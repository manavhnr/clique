// firebaseConfig.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { initializeFirestore, Firestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyASD1z407bm0wkGaR8dNYW4kxEuZW5tsfU",
  authDomain: "clique-c679c.firebaseapp.com",
  projectId: "clique-c679c",
  storageBucket: "clique-c679c.firebasestorage.app",
  messagingSenderId: "1018025506253",
  appId: "1:1018025506253:ios:65c5a05b002e5888788084",
};

// Initialize Firebase once
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ React Native fix for Firestore
export const db: Firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Helper functions for connection management
export const enableFirestoreNetwork = async () => {
  try {
    await enableNetwork(db);
    console.log('🟢 Firestore network enabled');
  } catch (error) {
    console.warn('Failed to enable Firestore network:', error);
  }
};

export const disableFirestoreNetwork = async () => {
  try {
    await disableNetwork(db);
    console.log('🔴 Firestore network disabled');
  } catch (error) {
    console.warn('Failed to disable Firestore network:', error);
  }
};

export default app;
