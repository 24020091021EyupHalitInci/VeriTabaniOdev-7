// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbD-lhWxkgnMPy1nVBS5IIzyL4CkvvS1g",
  authDomain: "gununnotu.firebaseapp.com",
  projectId: "gununnotu",
  storageBucket: "gununnotu.firebasestorage.app",
  messagingSenderId: "818916203257",
  appId: "1:818916203257:web:b994992742bcc50fdf2028",
  measurementId: "G-82KVN0H8HS"
};

// Uygulamayı başlat ve Firestore referansını dışa aktar
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);