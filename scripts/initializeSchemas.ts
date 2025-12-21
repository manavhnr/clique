#!/usr/bin/env node

/**
 * Firestore Schema Initialization Script
 * Run this script to create all database collections and sample data
 * 
 * Usage:
 *   npx tsx scripts/initializeSchemas.ts
 *   or 
 *   node scripts/initializeSchemas.js
 */

import { firestoreSetup } from '../src/services/firestoreSetupService';

async function main() {
  console.log('🚀 Starting Firestore schema initialization...\n');
  
  try {
    // Initialize all schemas
    console.log('📋 Step 1: Creating all database collections...');
    await firestoreSetup.initializeAllSchemas();
    
    console.log('\n🔍 Step 2: Verifying schema creation...');
    const verification = await firestoreSetup.verifySchemas();
    
    if (verification.success) {
      console.log('\n✅ SUCCESS: All schemas initialized successfully!');
      console.log(`📊 Created ${verification.collections.length} collections`);
    } else {
      console.log('\n⚠️  WARNING: Some collections may be missing');
      console.log(`❌ Missing: ${verification.missing.join(', ')}`);
    }
    
    console.log('\n📋 Step 3: Index requirements...');
    await firestoreSetup.createIndexes();
    
    console.log('\n🎉 Setup complete! Your Clique app database is ready.');
    console.log(`
🔗 Next Steps:
1. Check Firebase Console -> Firestore to see your collections
2. Create the suggested indexes for optimal performance
3. Configure security rules for production
4. Set up backup and monitoring

📝 Collections Created:
${verification.collections.map(c => `   ✅ ${c}`).join('\n')}
    `);
    
  } catch (error) {
    console.error('\n❌ Failed to initialize schemas:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎯 Schema initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Schema initialization failed:', error);
      process.exit(1);
    });
}

export { main as initializeSchemas };