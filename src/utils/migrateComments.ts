/**
 * Migration Script: Move Comments to Subcollections
 * 
 * This script moves existing comments from the global 'postComments' collection
 * to subcollections under each post document (posts/{postId}/comments).
 * 
 * Run this script once to migrate your existing data.
 */

import { 
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  increment,
  query,
  where,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { PostComment, COLLECTION_NAMES } from '../types/posts';

interface OldPostComment {
  commentId: string;
  postId: string;
  userId: string;
  commentText: string;
  parentCommentId: string | null;
  mediaUrl: string | null;
  createdAt: Timestamp;
}

export async function migrateCommentsToSubcollections(): Promise<{
  success: boolean;
  message: string;
  migratedCount: number;
  errorCount: number;
}> {
  console.log('🔄 Starting comment migration to subcollections...');
  
  let migratedCount = 0;
  let errorCount = 0;
  const batch = writeBatch(db);
  const batchSize = 100; // Firestore batch limit is 500, we use 100 for safety
  let currentBatchSize = 0;
  
  try {
    // 1. Get all existing comments from the old postComments collection
    const oldCommentsCollection = collection(db, 'postComments');
    const oldCommentsSnapshot = await getDocs(oldCommentsCollection);
    
    console.log(`📊 Found ${oldCommentsSnapshot.size} comments to migrate`);
    
    if (oldCommentsSnapshot.empty) {
      return {
        success: true,
        message: 'No comments found to migrate',
        migratedCount: 0,
        errorCount: 0
      };
    }
    
    // 2. Group comments by postId for efficient processing
    const commentsByPost: { [postId: string]: OldPostComment[] } = {};
    const postCommentCounts: { [postId: string]: number } = {};
    
    oldCommentsSnapshot.forEach((commentDoc) => {
      const commentData = commentDoc.data() as OldPostComment;
      const postId = commentData.postId;
      
      if (!commentsByPost[postId]) {
        commentsByPost[postId] = [];
        postCommentCounts[postId] = 0;
      }
      
      commentsByPost[postId].push({
        ...commentData,
        commentId: commentDoc.id,
      });
      postCommentCounts[postId]++;
    });
    
    console.log(`📋 Comments grouped across ${Object.keys(commentsByPost).length} posts`);
    
    // 3. Migrate comments for each post
    for (const [postId, comments] of Object.entries(commentsByPost)) {
      try {
        console.log(`📝 Migrating ${comments.length} comments for post ${postId}`);
        
        // Get the new subcollection reference
        const newCommentsCollection = collection(db, COLLECTION_NAMES.POSTS, postId, COLLECTION_NAMES.COMMENTS);
        
        // Create a map to track old comment IDs to new comment IDs for reply parent references
        const commentIdMapping: { [oldId: string]: string } = {};
        
        // First pass: Migrate top-level comments (no parent)
        const topLevelComments = comments.filter(c => !c.parentCommentId);
        const replies = comments.filter(c => c.parentCommentId);
        
        for (const comment of topLevelComments) {
          try {
            const newCommentData: Omit<PostComment, 'commentId'> = {
              userId: comment.userId,
              userName: `User ${comment.userId.slice(0, 6)}`, // We don't have userName in old structure
              userAvatar: undefined,
              commentText: comment.commentText,
              parentCommentId: null,
              mediaUrl: comment.mediaUrl,
              likeCount: 0, // Reset like count, you may want to migrate this separately
              createdAt: comment.createdAt || Timestamp.now(),
              updatedAt: comment.createdAt || Timestamp.now(),
            };
            
            const newCommentRef = await addDoc(newCommentsCollection, newCommentData);
            commentIdMapping[comment.commentId] = newCommentRef.id;
            migratedCount++;
            
            // Add to batch for deleting old comment
            if (currentBatchSize < batchSize) {
              const oldCommentRef = doc(collection(db, 'postComments'), comment.commentId);
              batch.delete(oldCommentRef);
              currentBatchSize++;
            }
            
            // Execute batch if it's full
            if (currentBatchSize >= batchSize) {
              await batch.commit();
              currentBatchSize = 0;
            }
            
          } catch (error) {
            console.error(`❌ Error migrating top-level comment ${comment.commentId}:`, error);
            errorCount++;
          }
        }
        
        // Second pass: Migrate replies with updated parent references
        for (const reply of replies) {
          try {
            const newParentId = commentIdMapping[reply.parentCommentId!];
            
            if (!newParentId) {
              console.warn(`⚠️  Parent comment not found for reply ${reply.commentId}, creating as top-level comment`);
            }
            
            const newReplyData: Omit<PostComment, 'commentId'> = {
              userId: reply.userId,
              userName: `User ${reply.userId.slice(0, 6)}`,
              userAvatar: undefined,
              commentText: reply.commentText,
              parentCommentId: newParentId || null,
              mediaUrl: reply.mediaUrl,
              likeCount: 0,
              createdAt: reply.createdAt || Timestamp.now(),
              updatedAt: reply.createdAt || Timestamp.now(),
            };
            
            await addDoc(newCommentsCollection, newReplyData);
            migratedCount++;
            
            // Add to batch for deleting old reply
            if (currentBatchSize < batchSize) {
              const oldReplyRef = doc(collection(db, 'postComments'), reply.commentId);
              batch.delete(oldReplyRef);
              currentBatchSize++;
            }
            
            // Execute batch if it's full
            if (currentBatchSize >= batchSize) {
              await batch.commit();
              currentBatchSize = 0;
            }
            
          } catch (error) {
            console.error(`❌ Error migrating reply ${reply.commentId}:`, error);
            errorCount++;
          }
        }
        
        // 4. Update post's comment count
        try {
          const postRef = doc(collection(db, COLLECTION_NAMES.POSTS), postId);
          await updateDoc(postRef, {
            commentCount: postCommentCounts[postId],
            updatedAt: Timestamp.now(),
          });
          console.log(`✅ Updated comment count for post ${postId}: ${postCommentCounts[postId]}`);
        } catch (error) {
          console.error(`❌ Error updating comment count for post ${postId}:`, error);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing post ${postId}:`, error);
        errorCount++;
      }
    }
    
    // Execute remaining batch operations
    if (currentBatchSize > 0) {
      await batch.commit();
    }
    
    console.log('🎉 Comment migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} comments`);
    console.log(`❌ Errors encountered: ${errorCount}`);
    
    return {
      success: true,
      message: `Migration completed. Migrated ${migratedCount} comments with ${errorCount} errors.`,
      migratedCount,
      errorCount
    };
    
  } catch (error) {
    console.error('💥 Fatal error during migration:', error);
    return {
      success: false,
      message: `Migration failed: ${error}`,
      migratedCount,
      errorCount
    };
  }
}

// Helper function to run migration with user confirmation
export async function runCommentMigration(): Promise<void> {
  console.log('⚠️  IMPORTANT: This will migrate all comments from postComments collection to subcollections');
  console.log('📋 Make sure to backup your data before proceeding');
  
  // In a React Native app, you might want to show an Alert.alert instead
  // For now, we'll just run the migration
  
  const result = await migrateCommentsToSubcollections();
  
  if (result.success) {
    console.log('✅ Migration Result:', result.message);
  } else {
    console.error('❌ Migration Failed:', result.message);
  }
}

// Export the main function for use in your app
export default migrateCommentsToSubcollections;