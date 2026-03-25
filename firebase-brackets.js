import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            "AIzaSyDtCwnv5xtWiMfkYbnspmFSY1jyaaqqubw",
  authDomain:        "nba-predictor-c0236.firebaseapp.com",
  projectId:         "nba-predictor-c0236",
  storageBucket:     "nba-predictor-c0236.firebasestorage.app",
  messagingSenderId: "978348396570",
  appId:             "1:978348396570:web:758309f36ce1792eab41a3",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const q = query(
  collection(db, 'predictions'),
  orderBy('timestamp', 'desc')
);

// Wait for DOM + brackets.js to be fully ready before firing
onSnapshot(q, (snapshot) => {
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  function trySet() {
    if (typeof window.setSubmissions === 'function') {
      window.setSubmissions(data);
    } else {
      // brackets.js not ready yet — retry in 50ms
      setTimeout(trySet, 50);
    }
  }
  trySet();
});