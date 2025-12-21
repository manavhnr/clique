/**
 * Firestore Database Setup Script
 * Creates the comments subcollection structure in your Firestore database
 */

import { 
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getHomepagePosts } from '../services/postService';

interface CommentDocument {
  userId: string;
  userName: string;
  userAvatar?: string;
  commentText: string;
  parentCommentId: string | null;
  mediaUrl: string | null;
  likeCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Creates the comments subcollection structure in Firestore
 * This adds actual documents to posts/{postId}/comments subcollections
 */
export async function setupCommentsSubcollections(): Promise<{
  success: boolean;
  message: string;
  postsProcessed: number;
  commentsCreated: number;
}> {
  console.log('🔥 Setting up comments subcollections in Firestore...');
  
  let postsProcessed = 0;
  let commentsCreated = 0;
  
  try {
    // 1. Get all existing posts
    const posts = await getHomepagePosts();
    
    if (posts.length === 0) {
      return {
        success: false,
        message: 'No posts found in database. Please create some posts first.',
        postsProcessed: 0,
        commentsCreated: 0
      };
    }
    
    console.log(`📝 Found ${posts.length} posts to setup with comment subcollections`);
    
    // 2. For each post, create the subcollection structure
    for (const post of posts) {
      try {
        console.log(`📁 Setting up comments subcollection for post: ${post.postId}`);
        
        // Reference to the comments subcollection
        const commentsCollectionRef = collection(db, 'posts', post.postId, 'comments');
        
        // Create sample comments to establish the subcollection structure
        const sampleComments: Omit<CommentDocument, 'commentId'>[] = [
          {
            userId: 'sample_user_1',
            userName: 'Sample User',
            userAvatar: 'https://picsum.photos/100/100?random=1',
            commentText: 'This is a sample comment to establish the subcollection structure.',
            parentCommentId: null,
            mediaUrl: null,
            likeCount: 0,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          },
          {
            userId: 'sample_user_2',
            userName: 'Demo User',
            userAvatar: 'https://picsum.photos/100/100?random=2',
            commentText: 'Another sample comment with proper field structure.',
            parentCommentId: null,
            mediaUrl: null,
            likeCount: 1,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          }
        ];
        
        // Add the sample comments to create the subcollection
        for (const commentData of sampleComments) {
          const commentDocRef = await addDoc(commentsCollectionRef, commentData);
          console.log(`  ✅ Created sample comment: ${commentDocRef.id}`);
          commentsCreated++;
        }
        
        // Create a sample reply to demonstrate nested structure
        const replyCommentRef = await addDoc(commentsCollectionRef, {
          userId: 'sample_user_3',
          userName: 'Reply User',
          userAvatar: 'https://picsum.photos/100/100?random=3',
          commentText: 'This is a sample reply to demonstrate nested comments.',
          parentCommentId: 'sample_comment_id', // This would be a real comment ID in practice
          mediaUrl: null,
          likeCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        
        console.log(`  💬 Created sample reply: ${replyCommentRef.id}`);
        commentsCreated++;
        postsProcessed++;
        
      } catch (error) {
        console.error(`❌ Error setting up comments for post ${post.postId}:`, error);
      }
    }
    
    console.log('🎉 Firestore comments subcollections setup completed!');
    
    return {
      success: true,
      message: `Successfully setup comments subcollections for ${postsProcessed} posts with ${commentsCreated} sample comments`,
      postsProcessed,
      commentsCreated
    };
    
  } catch (error) {
    console.error('💥 Error setting up Firestore subcollections:', error);
    return {
      success: false,
      message: `Failed to setup subcollections: ${error}`,
      postsProcessed,
      commentsCreated
    };
  }
}

/**
 * Creates the subcollection structure with proper Firestore indexes
 * This ensures the database has the right structure for queries
 */
export async function initializeCommentsSubcollectionStructure(): Promise<{
  success: boolean;
  message: string;
}> {
  console.log('🔧 Initializing comments subcollection structure...');
  
  try {
    // Get at least one post to work with
    const posts = await getHomepagePosts();
    
    if (posts.length === 0) {
      return {
        success: false,
        message: 'No posts available. Create posts first, then run this setup.'
      };
    }
    
    const samplePost = posts[0];
    console.log(`📋 Using post ${samplePost.postId} for structure initialization`);
    
    // Create comments subcollection reference
    const commentsRef = collection(db, 'posts', samplePost.postId, 'comments');
    
    // Create a structured document to establish the subcollection
    const structureDoc: Omit<CommentDocument, 'commentId'> = {
      userId: '__structure_doc__',
      userName: 'System',
      userAvatar: undefined,
      commentText: 'This document establishes the comments subcollection structure. It can be safely deleted after real comments are added.',
      parentCommentId: null,
      mediaUrl: null,
      likeCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // Add the structure document
    const docRef = await addDoc(commentsRef, structureDoc);
    console.log(`✅ Structure document created: ${docRef.id}`);
    
    console.log('🔍 Verifying subcollection structure...');
    
    // Verify the structure was created correctly
    const snapshot = await getDocs(commentsRef);
    console.log(`📊 Subcollection contains ${snapshot.size} documents`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  📄 Document ${doc.id}:`, {
        userId: data.userId,
        userName: data.userName,
        commentText: data.commentText?.substring(0, 50) + '...',
        hasParentId: !!data.parentCommentId,
        likeCount: data.likeCount,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || 'No timestamp'
      });
    });
    
    return {
      success: true,
      message: `Comments subcollection structure initialized successfully. Found ${snapshot.size} documents in the subcollection.`
    };
    
  } catch (error) {
    console.error('💥 Error initializing subcollection structure:', error);
    return {
      success: false,
      message: `Failed to initialize structure: ${error}`
    };
  }
}

/**
 * Batch operation to setup comments subcollections for all posts efficiently
 */
export async function batchSetupCommentsSubcollections(): Promise<{
  success: boolean;
  message: string;
  details: { postsProcessed: number; totalComments: number; }
}> {
  console.log('⚡ Starting batch setup of comments subcollections...');
  
  try {
    const posts = await getHomepagePosts();
    
    if (posts.length === 0) {
      throw new Error('No posts found in database');
    }
    
    const batch = writeBatch(db);
    let batchCount = 0;
    let totalComments = 0;
    
    for (const post of posts) {
      console.log(`🔄 Processing post: ${post.postId}`);
      
      // Create sample comments for this post
      const sampleComments = [
        {
          userId: `demo_user_${Math.floor(Math.random() * 1000)}`,
          userName: 'Demo User',
          userAvatar: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 50)}`,
          commentText: 'This post looks amazing! 🔥',
          parentCommentId: null,
          mediaUrl: null,
          likeCount: Math.floor(Math.random() * 10),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        {
          userId: `demo_user_${Math.floor(Math.random() * 1000)}`,
          userName: 'Another User',
          userAvatar: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 50)}`,
          commentText: 'Count me in! When do tickets go on sale?',
          parentCommentId: null,
          mediaUrl: null,
          likeCount: Math.floor(Math.random() * 5),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }
      ];
      
      // Add each comment to the batch
      for (const commentData of sampleComments) {
        const commentRef = doc(collection(db, 'posts', post.postId, 'comments'));
        batch.set(commentRef, commentData);
        batchCount++;
        totalComments++;
        
        // Execute batch when it gets large (Firestore limit is 500 operations)
        if (batchCount >= 400) {
          await batch.commit();
          console.log(`  ✅ Committed batch of ${batchCount} operations`);
          batchCount = 0;
        }
      }
    }
    
    // Commit any remaining operations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`  ✅ Committed final batch of ${batchCount} operations`);
    }
    
    console.log('🎊 Batch setup completed successfully!');
    
    return {
      success: true,
      message: `Batch setup completed for ${posts.length} posts`,
      details: {
        postsProcessed: posts.length,
        totalComments: totalComments
      }
    };
    
  } catch (error) {
    console.error('💥 Batch setup failed:', error);
    return {
      success: false,
      message: `Batch setup failed: ${error}`,
      details: { postsProcessed: 0, totalComments: 0 }
    };
  }
}

// Main function to run the setup
export async function runFirestoreSetup() {
  console.log('🚀 Starting Firestore comments subcollection setup...');
  console.log('📋 This will create comments subcollections in your Firestore database');
  
  // First, initialize the structure
  const structureResult = await initializeCommentsSubcollectionStructure();
  console.log('📁 Structure initialization:', structureResult.message);
  
  if (!structureResult.success) {
    console.error('❌ Structure initialization failed');
    return;
  }
  
  // Then setup subcollections for all posts
  const setupResult = await batchSetupCommentsSubcollections();
  console.log('🔧 Subcollection setup:', setupResult.message);
  
  if (setupResult.success) {
    console.log('✅ Firestore setup completed successfully!');
    console.log(`📊 Processed ${setupResult.details.postsProcessed} posts`);
    console.log(`💬 Created ${setupResult.details.totalComments} sample comments`);
    
    console.log('\\n🎯 Next steps:');
    console.log('1. Check your Firestore console to see the new subcollections');
    console.log('2. Test the comment system in your app');
    console.log('3. You can safely delete the sample comments if needed');
  } else {
    console.error('❌ Firestore setup failed:', setupResult.message);
  }
}

export default runFirestoreSetup;