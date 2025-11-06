// firebaseConfig.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyASD1z407bm0wkGaR8dNYW4kxEuZW5tsfU",
  authDomain: "clique.firebaseapp.com",
  projectId: "clique",
  storageBucket: "clique.appspot.com",
  messagingSenderId: "1018025506253",
  appId: "1:1018025506253:ios:65c5a05b002e5888788084",
};

// Initialize Firebase once
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export default app;
