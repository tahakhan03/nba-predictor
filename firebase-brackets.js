import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ─── Your Firebase config ─────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyDtCwnv5xtWiMfkYbnspmFSY1jyaaqqubw",
  authDomain:        "nba-predictor-c0236.firebaseapp.com",
  projectId:         "nba-predictor-c0236",
  storageBucket:     "nba-predictor-c0236.firebasestorage.app",
  messagingSenderId: "978348396570",
  appId:             "1:978348396570:web:758309f36ce1792eab41a3",
};

// ─── Initialize ───────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ─── Real-time listener ───────────────────────────────────────────
// Loads all submissions on page open and updates live as new ones arrive.
const q = query(
  collection(db, 'predictions'),
  orderBy('timestamp', 'desc')
);

onSnapshot(q, (snapshot) => {
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  if (typeof window.setSubmissions === 'function') {
    window.setSubmissions(data);
  }
});
