const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialiser Firebase Admin SDK (une seule fois)
try {
  admin.initializeApp();
} catch (e) {
  console.log("Initialization failed or already initialized:", e.message);
}

const db = admin.firestore();

// // Exemple de fonction HTTP (à adapter pour la fonction 'vote')
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// TODO: Implémenter la fonction 'vote' ici
// Exemple de structure pour la fonction 'vote'
 exports.vote = functions
    // Optionnel: Définir la région (ex: europe-west1)
    // .region('europe-west1')
    .https.onRequest(async (req, res) => {
        // Autoriser les requêtes cross-origin (IMPORTANT pour le dev local et si le frontend n'est pas sur le même domaine/port)
        // TODO: Restreindre à votre domaine en production !
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');

        // Gérer les requêtes OPTIONS (preflight)
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        // Vérifier la méthode HTTP
        if (req.method !== 'POST') {
           res.status(405).send('Method Not Allowed');
           return;
        }

        // Récupérer les données du corps de la requête
        const { sessionId, color } = req.body;

        // Validation simple
        if (!sessionId || !color || !['green', 'orange', 'red'].includes(color)) {
            functions.logger.warn("Requête invalide reçue:", req.body);
            res.status(400).send('Invalid request body. Need sessionId and color (green, orange, red).');
            return;
        }

        functions.logger.info(`Vote reçu pour session ${sessionId}: ${color}`);

        const sessionRef = db.collection('sessions').doc(sessionId);

        try {
            await db.runTransaction(async (transaction) => {
                const sessionDoc = await transaction.get(sessionRef);

                let currentVotes = { green: 0, orange: 0, red: 0 };
                let currentTotalVoters = 0;

                if (sessionDoc.exists) {
                    currentVotes = sessionDoc.data().voteCounts || currentVotes;
                    currentTotalVoters = sessionDoc.data().totalVoters || 0;
                } else {
                    // Optionnel : Créer la session si elle n'existe pas ? Ou rejeter ?
                    // Pour l'instant, on crée implicitement les compteurs
                     functions.logger.info(`Session ${sessionId} non trouvée, création implicite.`);
                }

                // Incrémenter les compteurs
                const newVotes = { ...currentVotes };
                newVotes[color] = (newVotes[color] || 0) + 1;
                const newTotalVoters = currentTotalVoters + 1;

                // Mettre à jour le document
                // Utiliser set avec merge:true si on veut créer le doc s'il n'existe pas
                // Utiliser update si on est sûr qu'il existe (ou gérer l'erreur)
                transaction.set(sessionRef, {
                    voteCounts: newVotes,
                    totalVoters: newTotalVoters,
                    // Optionnel: ajouter/màj un timestamp de dernière activité
                    lastVoteAt: admin.firestore.FieldValue.serverTimestamp()
                 }, { merge: true }); // merge:true est important si le doc n'existe pas encore

                 functions.logger.info(`Session ${sessionId} mise à jour. Votes: ${JSON.stringify(newVotes)}, Total Votants: ${newTotalVoters}`);
            });

            res.status(204).send(); // Succès, pas de contenu à renvoyer

        } catch (error) {
            functions.logger.error(`Erreur lors de la transaction pour la session ${sessionId}:`, error);
            res.status(500).send('Internal Server Error');
        }
    });

