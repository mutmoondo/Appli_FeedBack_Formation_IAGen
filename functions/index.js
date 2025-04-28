const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.vote = functions.https.onRequest(async (req, res) => {
  try {
    const { sessionId, color } = req.body;

    const allowedColors = ['green', 'orange', 'red'];

    if (!sessionId || !allowedColors.includes(color)) {
      console.error('Requête invalide:', sessionId, color);
      return res.status(400).send('Requête invalide');
    }

    const sessionRef = admin.firestore().collection('sessions').doc(sessionId);

    await sessionRef.set({
      voteCounts: { [color]: admin.firestore.FieldValue.increment(1) },
      totalVoters: admin.firestore.FieldValue.increment(1)
    }, { merge: true });

    console.log(`Vote enregistré pour session ${sessionId}, couleur ${color}`);
    return res.status(200).send('Vote enregistré');
  } catch (error) {
    console.error('Erreur Firestore:', error);
    return res.status(500).send('Erreur serveur');
  }
});

