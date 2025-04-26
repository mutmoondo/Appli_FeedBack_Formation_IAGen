# Mon Projet PWA Feedback

Ceci est une application web progressive permettant aux stagiaires de donner un feedback en temps réel pendant une formation.

## Setup

1.  Installer [Node.js](https://nodejs.org/) (qui inclut npm).
2.  Installer Firebase CLI: `npm install -g firebase-tools`
3.  Se connecter à Firebase: `firebase login`
4.  Initialiser Firebase (si pas déjà fait): `firebase init` (choisir Hosting, Functions, Firestore, Emulators)
5.  Installer les dépendances pour les Cloud Functions: `cd functions && npm install && cd ..`

## Développement Local (avec Émulateurs Firebase)

1.  Lancer les émulateurs: `firebase emulators:start`
2.  Ouvrir l'application dans le navigateur (l'URL sera indiquée, souvent http://localhost:5000)

## Déploiement

1.  Déployer les Cloud Functions: `firebase deploy --only functions`
2.  Déployer le site statique (Hosting): `firebase deploy --only hosting`
3.  Déployer les règles Firestore: `firebase deploy --only firestore:rules`
