// firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyASD1z407bm0wkGaR8dNYW4kxEuZW5tsfU",
  authDomain: "clique.firebaseapp.com",
  projectId: "clique",
  storageBucket: "clique.appspot.com",
  messagingSenderId: "1018025506253",
  appId: "1:1018025506253:ios:65c5a05b002e5888788084",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
