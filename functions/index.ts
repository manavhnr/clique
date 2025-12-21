import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function: onCreate(postLikes)
 * Increment posts.likeCount when a postLike is created
 */
export const onPostLikeCreated = functions.firestore
  .document('postLikes/{likeId}')
  .onCreate(async (snapshot: admin.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    try {
      const likeData = snapshot.data();
      const postId = likeData.postId;

      if (!postId) {
        console.error('No postId found in like data');
        return;
      }

      // Increment likeCount in posts collection
      const postRef = db.collection('posts').doc(postId);
      await postRef.update({
        likeCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Successfully incremented likeCount for post: ${postId}`);
    } catch (error) {
      console.error('Error in onPostLikeCreated:', error);
      throw error;
    }
  });

/**
 * Cloud Function: onDelete(postLikes)
 * Decrement posts.likeCount when a postLike is deleted
 */
export const onPostLikeDeleted = functions.firestore
  .document('postLikes/{likeId}')
  .onDelete(async (snapshot: admin.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    try {
      const likeData = snapshot.data();
      const postId = likeData.postId;

      if (!postId) {
        console.error('No postId found in like data');
        return;
      }

      // Decrement likeCount in posts collection
      const postRef = db.collection('posts').doc(postId);
      await postRef.update({
        likeCount: admin.firestore.FieldValue.increment(-1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Successfully decremented likeCount for post: ${postId}`);
    } catch (error) {
      console.error('Error in onPostLikeDeleted:', error);
      throw error;
    }
  });