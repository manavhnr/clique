import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { createMultipleSamplePosts } from './createSamplePost';

/**
 * Debug utilities for the post system
 */

export const checkPostsInDatabase = async (): Promise<void> => {
  try {
    console.log('🔍 Checking posts in database...');
    
    const postsCollection = collection(db, 'posts');
    const snapshot = await getDocs(postsCollection);
    
    console.log(`📊 Found ${snapshot.size} posts in database`);
    
    if (snapshot.size === 0) {
      console.log('📝 No posts found. Database is empty.');
      return;
    }
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 Post ID: ${doc.id}`);
      console.log(`   Author: ${data.authorId}`);
      console.log(`   Text: ${data.text?.substring(0, 50)}...`);
      console.log(`   Likes: ${data.likeCount || 0}`);
      console.log(`   Created: ${data.createdAt?.toDate?.()?.toISOString() || 'No date'}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
};

export const initializeSampleData = async (userId: string): Promise<void> => {
  try {
    console.log('🚀 Initializing sample data...');
    
    // Check if posts already exist
    const postsCollection = collection(db, 'posts');
    const snapshot = await getDocs(postsCollection);
    
    if (snapshot.size > 0) {
      console.log(`✅ Database already has ${snapshot.size} posts. Skipping initialization.`);
      return;
    }
    
    console.log('📝 Creating sample posts...');
    const postIds = await createMultipleSamplePosts(userId);
    console.log(`✅ Created ${postIds.length} sample posts:`, postIds);
    
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
    throw error;
  }
};

export const debugPostSystem = async (userId: string): Promise<void> => {
  console.log('🐛 === POST SYSTEM DEBUG ===');
  console.log(`👤 User ID: ${userId}`);
  
  await checkPostsInDatabase();
  
  // Check individual collections
  try {
    const collections = ['posts', 'postLikes', 'postComments', 'userLikes'];
    
    for (const collectionName of collections) {
      const col = collection(db, collectionName);
      const snapshot = await getDocs(col);
      console.log(`📦 ${collectionName}: ${snapshot.size} documents`);
    }
  } catch (error) {
    console.error('❌ Error checking collections:', error);
  }
  
  console.log('🐛 === DEBUG COMPLETE ===');
};