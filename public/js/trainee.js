// trainee.js

console.log("Trainee JS Loaded");

firebase.initializeApp(window.firebaseConfig); 
// Récupérer l'ID de session depuis l'URL
const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session');
const statusElement = document.getElementById('status');

// Définir les couleurs autorisées
const allowedColors = ['green', 'orange', 'red'];

if (!sessionId) {
    statusElement.textContent = "Erreur: ID de session manquant dans l'URL.";
} else {
    statusElement.textContent = `Session: ${sessionId}`;

    const db = firebase.firestore();
    const sessionRef = db.collection('sessions').doc(sessionId);

    document.querySelectorAll('.feedback-button').forEach(button => {
        button.addEventListener('click', async () => {
            const color = button.dataset.color;

            if (!allowedColors.includes(color)) {
                console.error(`Couleur invalide: ${color}`);
                statusElement.textContent = "Erreur: couleur de vote invalide.";
                return;
            }

            statusElement.textContent = `Envoi du vote (${color})...`;
            button.disabled = true;

            try {
                await sessionRef.update({
                    [`voteCounts.${color}`]: firebase.firestore.FieldValue.increment(1),
                    totalVoters: firebase.firestore.FieldValue.increment(1)
                });

                statusElement.textContent = `Vote (${color}) envoyé !`;
            } catch (error) {
                console.error('Erreur lors de l\'envoi du vote:', error);
                statusElement.textContent = `Erreur lors de l'envoi (${color}). Réessayez.`;
            } finally {
                setTimeout(() => {
                    button.disabled = false;
                    statusElement.textContent = `Session: ${sessionId} - Prêt à voter.`;
                }, 1500);
            }
        });
    });
}

