
const { initializeApp } = require('firebase/app')
const admin = require('firebase-admin');
const serviceAccount = require('./asset/toeicpracticeapp-9dc19-firebase-adminsdk-eqpy0-2c7a132769.json');
const firebaseConfig = {
  apiKey: "AIzaSyBiVHrN1tvAs4GWulf3LWsnTktj9kvow4U",
  authDomain: "toeicpracticeapp-9dc19.firebaseapp.com",
  projectId: "toeicpracticeapp-9dc19",
  storageBucket: "toeicpracticeapp-9dc19.appspot.com",
  messagingSenderId: "235184996000",
  appId: "1:235184996000:web:d94e0997ceb6179a2e53c5"
};

// Initialize Firebase
const firebase= initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://toeicpracticeapp-9dc19.appspot.com'
});
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const db = getFirestore()
module.exports = {firebase,db,admin};