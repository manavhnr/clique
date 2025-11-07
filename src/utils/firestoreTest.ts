import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export async function testFirestorePermissions() {
  console.log('🧪 Testing Firestore permissions...');
  
  try {
    // Test 1: Try to write a simple test document
    const testDocRef = doc(db, 'test', 'permissions');
    await setDoc(testDocRef, {
      timestamp: new Date().toISOString(),
      message: 'Testing permissions'
    });
    console.log('✅ Write test successful');
    
    // Test 2: Try to read the document
    const testDoc = await getDoc(testDocRef);
    if (testDoc.exists()) {
      console.log('✅ Read test successful');
      console.log('📄 Test data:', testDoc.data());
    } else {
      console.log('❌ Read test failed - document not found');
    }
    
    // Test 3: Clean up
    await deleteDoc(testDocRef);
    console.log('✅ Delete test successful');
    
    return { success: true, message: 'All Firestore tests passed' };
    
  } catch (error: any) {
    console.error('❌ Firestore permission test failed:', error);
    
    if (error.code === 'permission-denied') {
      return { 
        success: false, 
        message: 'Permission denied - Firestore security rules are blocking writes' 
      };
    }
    
    if (error.code === 'unavailable') {
      return { 
        success: false, 
        message: 'Firestore unavailable - network or connection issue' 
      };
    }
    
    return { 
      success: false, 
      message: `Firestore error: ${error.code || error.message}` 
    };
  }
}