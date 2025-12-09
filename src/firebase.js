// firebase.js - Configuración de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB4B9B7SzxeWC7h3tYXQuSTL6nGbbBH0rQ",
  authDomain: "sistema-de-produccion-tm.firebaseapp.com",
  projectId: "sistema-de-produccion-tm",
  storageBucket: "sistema-de-produccion-tm.firebasestorage.app",
  messagingSenderId: "357709452276",
  appId: "1:357709452276:web:f3bdf0aa8f77aa63409fa1"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
