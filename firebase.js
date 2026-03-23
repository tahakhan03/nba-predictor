// ─────────────────────────────────────────────────────────────────────────────
// firebase.js  —  Connects the bracket app to Firebase Firestore
//
// SETUP INSTRUCTIONS (do this once):
//   1. Go to https://firebase.google.com and sign in with your Google account
//   2. Click "Go to console" → "Add project" → name it "nba-predictor" → Continue
//   3. Disable Google Analytics (not needed) → "Create project"
//   4. On the project home page click the </> web icon → Register app
//      App nickname: "nba-predictor" → Register app
//   5. Copy ONLY the firebaseConfig object values into the section below
//   6. In the left sidebar: Build → Firestore Database → Create database
//      → Start in TEST MODE → choose a region close to you → Enable
//
// That's it — no server required. Firebase handles everything for free.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ─── YOUR CONFIG GOES HERE ────────────────────────────────────────
// Replace every value below with your own from the Firebase console.
// (Project settings → General → Your apps → SDK setup and configuration)
const firebaseConfig = {
  apiKey:            "AIzaSyDtCwnv5xtWiMfkYbnspmFSY1jyaaqqubw",
  authDomain:        "nba-predictor-c0236.firebaseapp.com",
  projectId:         "nba-predictor-c0236",
  storageBucket:     "nba-predictor-c0236.firebasestorage.app",
  messagingSenderId: "978348396570",
  appId:             "1:978348396570:web:758309f36ce1792eab41a3",
};
// ─────────────────────────────────────────────────────────────────

// ─── Initialize Firebase ──────────────────────────────────────────
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ─── Expose save function to bracket.js ───────────────────────────
// bracket.js calls window.saveEntry(entry) when a user submits.
window.saveEntry = async function (entry) {
  await addDoc(collection(db, 'predictions'), entry);
  // onSnapshot below will automatically fire and update the list.
};

// ─── Real-time listener ───────────────────────────────────────────
// Fires immediately on page load (loads existing submissions) and
// then again any time a new submission is added by anyone, anywhere.
const q = query(
  collection(db, 'predictions'),
  orderBy('timestamp', 'desc')
);

onSnapshot(q, (snapshot) => {
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  // Hand the data back to bracket.js
  if (typeof window.setSubmissions === 'function') {
    window.setSubmissions(data);
  }
});
