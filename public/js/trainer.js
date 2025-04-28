console.log("Trainer JS Loaded");
firebase.initializeApp(window.firebaseConfig);
// Récupérer l'ID de session depuis l'URL
const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session');
const sessionIdElement = document.getElementById('sessionId');
const countGreenEl = document.getElementById('count-green');
const countOrangeEl = document.getElementById('count-orange');
const countRedEl = document.getElementById('count-red');
const countVotersEl = document.getElementById('count-voters');
// const countTraineesEl = document.getElementById('count-trainees');
// const participationRateEl = document.getElementById('participation-rate');
const ctx = document.getElementById('feedbackChart').getContext('2d');

let feedbackChart = null; // Variable pour stocker l'instance du graphique

function initializeChart() {
    feedbackChart = new Chart(ctx, {
        type: 'doughnut', // Type de graphique (doughnut ou pie)
        data: {
            labels: ['Vert', 'Orange', 'Rouge'],
            datasets: [{
                label: 'Votes',
                data: [0, 0, 0], // Données initiales
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)', // Vert
                    'rgba(243, 156, 18, 0.8)', // Orange
                    'rgba(231, 76, 60, 0.8)'   // Rouge
                ],
                borderColor: [
                    'rgba(46, 204, 113, 1)',
                    'rgba(243, 156, 18, 1)',
                    'rgba(231, 76, 60, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Répartition des Feedbacks'
                }
            }
        }
    });
}


if (!sessionId) {
    sessionIdElement.textContent = "ERREUR : ID de session manquant !";
    // Afficher un message d'erreur plus proéminent ?
} else {
    sessionIdElement.textContent = sessionId;
    initializeChart(); // Initialiser le graphique

    // S'assurer que le SDK Firebase est initialisé (via /__/firebase/init.js)
    // et que Firestore est disponible.
    try {
        const db = firebase.firestore(); // Utilise l'instance initialisée globalement
        const sessionRef = db.collection('sessions').doc(sessionId);

        console.log(`Écoute des changements pour la session: ${sessionId}`);

        sessionRef.onSnapshot((doc) => {
            console.log("Snapshot reçu:", doc.exists ? doc.data() : 'Document non trouvé');
            if (doc.exists) {
                const data = doc.data();
                const votes = data.voteCounts || { green: 0, orange: 0, red: 0 };
                const totalVoters = data.totalVoters || 0;
                // const totalTrainees = data.totalTrainees || 0; // Si implémenté

                // Mettre à jour les compteurs
                countGreenEl.textContent = votes.green;
                countOrangeEl.textContent = votes.orange;
                countRedEl.textContent = votes.red;
                countVotersEl.textContent = totalVoters;

                // Mettre à jour le graphique
                if (feedbackChart) {
                    feedbackChart.data.datasets[0].data = [votes.green, votes.orange, votes.red];
                    feedbackChart.update();
                }

                // Calculer et afficher le taux de participation (si totalTrainees est disponible)
                /*
                if (totalTrainees > 0) {
                    countTraineesEl.textContent = totalTrainees;
                    const rate = ((totalVoters / totalTrainees) * 100).toFixed(1);
                    participationRateEl.textContent = rate;
                } else {
                    countTraineesEl.textContent = 'N/A';
                    participationRateEl.textContent = 'N/A';
                }
                */

            } else {
                console.warn(`La session ${sessionId} n'existe pas dans Firestore.`);
                // Afficher un message indiquant que la session est invalide ou n'a pas encore de données
                countGreenEl.textContent = '-';
                countOrangeEl.textContent = '-';
                countRedEl.textContent = '-';
                countVotersEl.textContent = '0';
                if (feedbackChart) {
                     feedbackChart.data.datasets[0].data = [0, 0, 0];
                     feedbackChart.update();
                }
            }
        }, (error) => {
            console.error(`Erreur lors de l'écoute de la session ${sessionId}:`, error);
            // Afficher une erreur à l'utilisateur ?
        });

    } catch (e) {
        console.error("Erreur lors de l'initialisation de Firestore ou de l'écoute:", e);
        alert("Impossible de se connecter à la base de données de feedback. Vérifiez la configuration Firebase.");
    }
}

