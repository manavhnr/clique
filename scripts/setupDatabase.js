/**
 * Simple Database Setup Script
 * Run: npm run setup-db
 */

const { initializeFirestore } = require('firebase/firestore');
const { initializeApp, getApps, getApp } = require('firebase/app');

const firebaseConfig = {
  apiKey: "AIzaSyASD1z407bm0wkGaR8dNYW4kxEuZW5tsfU",
  authDomain: "clique-c679c.firebaseapp.com",
  projectId: "clique-c679c",
  storageBucket: "clique-c679c.firebasestorage.app",
  messagingSenderId: "1018025506253",
  appId: "1:1018025506253:ios:65c5a05b002e5888788084",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

const { collection, doc, setDoc, Timestamp } = require('firebase/firestore');

async function createBasicCollections() {
  console.log('🚀 Creating basic Firestore collections...\n');
  
  const collections = [
    // Core Collections
    'users', 'events', 'bookingPasses', 'notifications',
    
    // New Schema Collections  
    'reports', 'moderationActions', 'autoModerationRules',
    'adminUsers', 'adminActions', 'platformSettings', 
    'featuredEvents', 'promotionPackages', 'promotionCampaigns',
    'userAnalytics', 'eventAnalytics', 'platformAnalytics',
    'paymentMethods', 'transactions', 'payouts', 'refundRequests',
    
    // System Collections
    'featureFlags', 'systemHealth', 'auditLogs'
  ];

  let successCount = 0;
  
  for (const collectionName of collections) {
    try {
      const collectionRef = collection(db, collectionName);
      const placeholderDoc = doc(collectionRef, '_placeholder');
      
      await setDoc(placeholderDoc, {
        _isPlaceholder: true,
        _createdAt: Timestamp.now(),
        _note: `Placeholder document for ${collectionName} collection`,
        _schemaVersion: '1.0.0'
      });
      
      console.log(`✅ Created: ${collectionName}`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Failed: ${collectionName} -`, error.message);
    }
  }
  
  console.log(`\n🎉 Setup Complete!`);
  console.log(`📊 Created ${successCount}/${collections.length} collections`);
  console.log(`\n🔗 Next steps:`);
  console.log(`1. Check Firebase Console -> Firestore`);
  console.log(`2. Your collections are ready for use`);
  console.log(`3. Start building your Clique app features!`);
}

// Run the setup
createBasicCollections()
  .then(() => {
    console.log('\n✨ Database setup successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Database setup failed:', error);
    process.exit(1);
  });