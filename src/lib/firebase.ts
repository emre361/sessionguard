import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnF4xXOiZ8ytQOk9tLEFe8jMImWMUg-Z0",
  authDomain: "sessionguard-tr.firebaseapp.com",
  projectId: "sessionguard-tr",
  storageBucket: "sessionguard-tr.firebasestorage.app",
  messagingSenderId: "323970821780",
  appId: "1:323970821780:web:f5f1f68c32c7ba786f8e81"
};

// Uygulamayı başlat (Çoklu başlatma kontrolü ile)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);