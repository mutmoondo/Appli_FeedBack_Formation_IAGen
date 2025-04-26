// Nom du cache
const CACHE_NAME = 'feedback-pwa-cache-v1';
// URLs à mettre en cache (coquille applicative)
const urlsToCache = [
  '/', // Redirige souvent vers index.html
  '/index.html',
  '/trainee.html',
  '/trainer.html',
  '/css/style.css',
  // '/js/config.js', // Attention si contient des clés
  '/js/trainee.js',
  '/js/trainer.js',
  '/manifest.json',
  // '/assets/icons/icon-192x192.png', // Ajoutez les chemins réels vers vos icônes
  // '/assets/icons/icon-512x512.png'
  // Ne pas mettre en cache les scripts Firebase /__/firebase/... car gérés par Hosting
  // Ne pas mettre en cache Chart.js CDN ici si vous voulez la dernière version,
  // sinon téléchargez-le et ajoutez-le aux assets.
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Mise en cache de la coquille applicative');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
          console.error("Erreur de mise en cache initiale:", err);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activation');
  // Supprimer les anciens caches si nécessaire
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l'ancien cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Prend le contrôle immédiatement
});

// Interception des requêtes réseau (Fetch event)
self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes vers les Cloud Functions ou Firestore
  if (event.request.url.includes('/__/firebase/')) {
      // Laisser passer les requêtes vers les services Firebase
      return;
  }
   if (event.request.method !== 'GET') {
       // Ne pas traiter les requêtes non-GET (ex: POST vers Cloud Function)
       return;
   }

  console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retourner la réponse depuis le cache
        if (response) {
          console.log('Service Worker: Ressource trouvée dans le cache:', event.request.url);
          return response;
        }

        // Non trouvé dans le cache - aller sur le réseau
        console.log('Service Worker: Ressource non trouvée dans le cache, fetch réseau:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // Optionnel: Mettre en cache la nouvelle ressource récupérée ?
            // Attention avec les ressources externes ou dynamiques
            // if (networkResponse.ok && urlsToCache.includes(new URL(event.request.url).pathname)) {
            //   let responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME).then(cache => {
            //       cache.put(event.request, responseToCache);
            //   });
            // }
            return networkResponse;
          }
        ).catch(error => {
            console.error("Service Worker: Erreur de fetch réseau:", error);
            // Optionnel: Retourner une page hors-ligne générique ?
            // return caches.match('/offline.html');
        });
      })
  );
});

