// Firebase v10 Modular SDK Configuration & Connection Manager
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const STORAGE_KEY = 'mess_firebase_config';

// Load stored Firebase config if user provided one
export function getStoredFirebaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to read stored Firebase config', e);
    return null;
  }
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
  } catch (e) {
    alert('Failed to save Firebase config: ' + e.message);
  }
}

export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

let app = null;
let db = null;
let auth = null;
let isConnected = false;

const userConfig = getStoredFirebaseConfig();

// Attempt initializing Firebase if valid config exists
if (userConfig && userConfig.apiKey && userConfig.projectId && userConfig.apiKey !== 'YOUR_API_KEY') {
  try {
    app = initializeApp(userConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isConnected = true;
    console.log('Firebase initialized successfully with project:', userConfig.projectId);
  } catch (err) {
    console.warn('Firebase initialization error, running in Demo/Simulation mode:', err);
    isConnected = false;
  }
} else {
  console.info('Running in Interactive Demo Mode (Local Storage / IndexedDB). Connect your Firebase in Settings to sync with Cloud Firestore.');
}

export { 
  app, 
  db, 
  auth, 
  isConnected,
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
