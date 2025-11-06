// Simple Firebase connection test
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🔥 Firebase Configuration Test:');
  console.log('Auth app:', auth?.app?.options?.projectId);
  console.log('Firestore app:', db?.app?.options?.projectId);
  
  if (auth?.app?.options?.projectId === 'clique-c679c') {
    console.log('✅ Firebase Auth configured correctly');
  } else {
    console.log('❌ Firebase Auth configuration issue');
  }
  
  if (db?.app?.options?.projectId === 'clique-c679c') {
    console.log('✅ Firebase Firestore configured correctly');
  } else {
    console.log('❌ Firebase Firestore configuration issue');
  }

  // Test Firestore connectivity
  try {
    const testDoc = doc(db, 'test', 'connection');
    const docSnap = await getDoc(testDoc);
    console.log('✅ Firestore connection test passed');
    return true;
  } catch (error: any) {
    console.error('❌ Firestore connection test failed:', error.message);
    
    if (error.code === 'permission-denied') {
      console.warn('⚠️  This might be due to Firestore security rules. Make sure your rules allow read/write access.');
    } else if (error.code === 'unavailable') {
      console.warn('⚠️  Firestore service is currently unavailable. Check your internet connection.');
    }
    
    return false;
  }
};

export const createTestUser = async () => {
  try {
    const testDoc = doc(db, 'users', 'test-user');
    await setDoc(testDoc, {
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
    });
    console.log('✅ Test user creation successful');
    return true;
  } catch (error: any) {
    console.error('❌ Test user creation failed:', error.message);
    return false;
  }
};