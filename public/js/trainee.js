console.log("Trainee JS Loaded");

// Récupérer l'ID de session depuis l'URL
const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session');
const statusElement = document.getElementById('status');

if (!sessionId) {
    statusElement.textContent = "Erreur: ID de session manquant dans l'URL.";
    // Désactiver les boutons ?
} else {
    statusElement.textContent = `Session: ${sessionId}`;
    // TODO: Remplacer par l'URL de votre Cloud Function après déploiement
    // ou utiliser une fonction appelable si configurée.
    const voteFunctionUrl = 'VOTRE_URL_CLOUD_FUNCTION_VOTE_ICI'; // !!! IMPORTANT !!!

    document.querySelectorAll('.feedback-button').forEach(button => {
        button.addEventListener('click', () => {
            const color = button.dataset.color;
            statusElement.textContent = `Envoi du vote (${color})...`;
            button.disabled = true; // Empêcher double-clic

            fetch(voteFunctionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId: sessionId, color: color })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`);
                }
                statusElement.textContent = `Vote (${color}) envoyé !`;
                // Optionnel : Réactiver après un délai, ou laisser désactivé ?
                setTimeout(() => {
                    button.disabled = false;
                    statusElement.textContent = `Session: ${sessionId} - Prêt à voter.`;
                }, 1500);
            })
            .catch(error => {
                console.error('Erreur lors de l'envoi du vote:', error);
                statusElement.textContent = `Erreur lors de l'envoi (${color}). Réessayez.`;
                button.disabled = false; // Réactiver en cas d'erreur
            });
        });
    });
}
