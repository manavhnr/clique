import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  Timestamp,
  writeBatch,
  FieldValue,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// TypeScript interfaces for exact schema compliance
export interface Post {
  postId: string;
  authorId: string;
  eventId: string | null;
  text: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  visibility: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PostLike {
  likeId: string;
  postId: string;
  userId: string;
  likedAt: Timestamp;
}

export interface PostComment {
  commentId: string;
  postId: string;
  userId: string;
  commentText: string;
  parentCommentId: string | null;
  mediaUrl: string | null;
  createdAt: Timestamp;
}

export interface PostView {
  viewId: string;
  postId: string;
  userId: string;
  viewedAt: Timestamp;
}

export interface PostMedia {
  mediaId: string;
  postId: string;
  mediaUrl: string;
  type: "image" | "video";
  uploadedAt: Timestamp;
}

export interface UserLike {
  postId: string;
  userId: string;
  likedAt: Timestamp;
}

export interface EventPost {
  postId: string;
  eventId: string;
  createdAt: Timestamp;
}

// Collection references
const postsCollection = collection(db, 'posts');
const postLikesCollection = collection(db, 'postLikes');
const postCommentsCollection = collection(db, 'postComments');
const postViewsCollection = collection(db, 'postViews');
const postMediaCollection = collection(db, 'postMedia');
const userLikesCollection = collection(db, 'userLikes');
const eventPostsCollection = collection(db, 'eventPosts');

/**
 * 1. createPost()
 * Create a new document in posts with correct fields.
 * If mediaUrls exist, store them first then write URLs.
 */
export async function createPost(
  authorId: string,
  eventId: string | null,
  text: string,
  mediaUrls: string[] = [],
  visibility: string = 'public'
): Promise<string> {
  try {
    // Create new post document reference
    const postRef = doc(postsCollection);
    const postId = postRef.id;

    // Create post data with exact schema
    const postData: Omit<Post, 'postId'> = {
      authorId,
      eventId,
      text,
      mediaUrls,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      visibility,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };

    // Write post to Firestore
    await setDoc(postRef, postData);

    // If mediaUrls exist, create postMedia documents
    if (mediaUrls.length > 0) {
      const batch = writeBatch(db);
      
      for (const mediaUrl of mediaUrls) {
        const mediaRef = doc(postMediaCollection);
        const mediaData: PostMedia = {
          mediaId: mediaRef.id,
          postId,
          mediaUrl,
          type: mediaUrl.includes('video') ? 'video' : 'image', // Simple type detection
          uploadedAt: serverTimestamp() as Timestamp
        };
        batch.set(mediaRef, mediaData);
      }
      
      await batch.commit();
    }

    // If eventId exists, create eventPost document
    if (eventId) {
      const eventPostRef = doc(eventPostsCollection);
      const eventPostData: EventPost = {
        postId,
        eventId,
        createdAt: serverTimestamp() as Timestamp
      };
      await setDoc(eventPostRef, eventPostData);
    }

    return postId;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

/**
 * 2. getHomepagePosts()
 * Fetch posts sorted by createdAt desc.
 * Include likeCount and commentCount.
 */
export async function getHomepagePosts(limitCount: number = 20): Promise<Post[]> {
  try {
    const q = query(
      postsCollection,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        postId: doc.id,
        authorId: data.authorId,
        eventId: data.eventId,
        text: data.text,
        mediaUrls: data.mediaUrls,
        likeCount: data.likeCount,
        commentCount: data.commentCount,
        shareCount: data.shareCount,
        visibility: data.visibility,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    return posts;
  } catch (error) {
    console.error('Error fetching homepage posts:', error);
    throw error;
  }
}

/**
 * Helper function to verify a post exists in the database
 */
export async function verifyPostExists(postId: string): Promise<boolean> {
  try {
    console.log(`🔍 Checking if post exists in Firestore: ${postId}`);
    const postRef = doc(postsCollection, postId);
    const postSnap = await getDoc(postRef);
    const exists = postSnap.exists();
    console.log(`✅ Post exists check result: ${exists}`);
    return exists;
  } catch (error) {
    console.error('❌ Error verifying post exists:', error);
    return false;
  }
}

/**
 * Enhanced function to get post data directly from Firestore
 */
export async function getPostFromFirestore(postId: string): Promise<Post | null> {
  try {
    console.log(`🔍 Fetching post data from Firestore: ${postId}`);
    const postRef = doc(postsCollection, postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      console.log(`❌ Post ${postId} does not exist in Firestore`);
      return null;
    }
    
    const data = postSnap.data();
    const post: Post = {
      postId: postSnap.id,
      authorId: data.authorId,
      eventId: data.eventId,
      text: data.text,
      mediaUrls: data.mediaUrls,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      shareCount: data.shareCount || 0,
      visibility: data.visibility,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
    
    console.log(`✅ Post data retrieved:`, {
      id: post.postId,
      author: post.authorId,
      likes: post.likeCount,
      text: post.text?.substring(0, 30) + '...'
    });
    
    return post;
  } catch (error) {
    console.error('❌ Error fetching post from Firestore:', error);
    return null;
  }
}

/**
 * 3. likePost(postId, userId)
 * Create a doc in postLikes.
 * Create a doc in userLikes.
 * Increment likeCount in posts using FieldValue.increment(1).
 */
export async function likePost(postId: string, userId: string): Promise<void> {
  try {
    // Check if user already liked this post (prevents duplicates)
    const userLikeRef = doc(userLikesCollection, `${postId}_${userId}`);
    const existingLike = await getDoc(userLikeRef);
    
    if (existingLike.exists()) {
      throw new Error('User has already liked this post');
    }

    // Use batch for atomic operations
    const batch = writeBatch(db);

    // Create postLikes document
    const postLikeRef = doc(postLikesCollection);
    batch.set(postLikeRef, {
      likeId: postLikeRef.id,
      postId,
      userId,
      likedAt: serverTimestamp()
    });

    // Create userLikes document
    batch.set(userLikeRef, {
      postId,
      userId,
      likedAt: serverTimestamp()
    });

    // Increment post like count
    const postRef = doc(postsCollection, postId);
    batch.update(postRef, {
      likeCount: increment(1),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
}

/**
 * 4. unlikePost(postId, userId)
 * Delete doc in postLikes.
 * Delete doc in userLikes.
 * Decrement likeCount in posts using FieldValue.increment(-1).
 */
export async function unlikePost(postId: string, userId: string): Promise<void> {
  try {
    // Check if user has liked this post
    const userLikeRef = doc(userLikesCollection, `${postId}_${userId}`);
    const existingLike = await getDoc(userLikeRef);
    
    if (!existingLike.exists()) {
      throw new Error('User has not liked this post');
    }

    // Use batch for atomic operations
    const batch = writeBatch(db);

    // Find and delete postLikes documents
    const postLikesQuery = query(
      postLikesCollection,
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    const postLikesSnapshot = await getDocs(postLikesQuery);
    
    postLikesSnapshot.forEach((likeDoc) => {
      batch.delete(likeDoc.ref);
    });

    // Delete userLikes document
    batch.delete(userLikeRef);

    // Decrement post like count
    const postRef = doc(postsCollection, postId);
    batch.update(postRef, {
      likeCount: increment(-1),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
}

/**
 * Debug function to check like collections status
 */
export async function debugLikeStatus(postId: string, userId: string): Promise<void> {
  try {
    console.log(`🔍 === DEBUGGING LIKE STATUS FOR POST ${postId} ===`);
    
    // Check post exists and current like count
    const postRef = doc(postsCollection, postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const postData = postSnap.data();
      console.log('📄 Post data:');
      console.log('   Current likeCount:', postData.likeCount || 0);
      console.log('   Author:', postData.authorId);
      console.log('   Text:', postData.text?.substring(0, 50) + '...');
    } else {
      console.log('❌ Post does not exist!');
      return;
    }
    
    // Check userLikes collection
    const userLikeRef = doc(userLikesCollection, `${postId}_${userId}`);
    const userLikeSnap = await getDoc(userLikeRef);
    console.log('👤 UserLikes document exists:', userLikeSnap.exists());
    
    if (userLikeSnap.exists()) {
      const userLikeData = userLikeSnap.data();
      console.log('   Liked at:', userLikeData.likedAt?.toDate?.()?.toISOString());
    }
    
    // Check postLikes collection
    const postLikesQuery = query(
      postLikesCollection,
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    const postLikesSnapshot = await getDocs(postLikesQuery);
    console.log(`💖 PostLikes documents found: ${postLikesSnapshot.size}`);
    
    // Check all postLikes for this post
    const allPostLikesQuery = query(
      postLikesCollection,
      where('postId', '==', postId)
    );
    const allPostLikesSnapshot = await getDocs(allPostLikesQuery);
    console.log(`💖 Total postLikes for this post: ${allPostLikesSnapshot.size}`);
    
    console.log('🔍 === DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Error debugging like status:', error);
  }
}

/**
 * 5. fetchUserLikedState(postId, userId)
 * Return true if matching postLikes entry exists.
 */
export async function fetchUserLikedState(postId: string, userId: string): Promise<boolean> {
  try {
    const userLikeRef = doc(userLikesCollection, `${postId}_${userId}`);
    const docSnap = await getDoc(userLikeRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error fetching user liked state:', error);
    throw error;
  }
}

/**
 * 1. addComment(postId, userId, commentText, parentCommentId = null, mediaUrl = null)
 * Create a new document in postComments.
 * Use auto-generated doc ID.
 * Fields must match schema EXACTLY.
 * After creating comment, increment commentCount inside the corresponding post document using FieldValue.increment(1).
 */
export async function addComment(
  postId: string,
  userId: string,
  commentText: string,
  parentCommentId: string | null = null,
  mediaUrl: string | null = null
): Promise<string> {
  try {
    // Create comment document with auto-generated ID
    const commentRef = doc(postCommentsCollection);
    const commentData: PostComment = {
      commentId: commentRef.id,
      postId,
      userId,
      commentText,
      parentCommentId,
      mediaUrl,
      createdAt: serverTimestamp() as Timestamp
    };

    await setDoc(commentRef, commentData);

    // Increment commentCount in the corresponding post document
    const postRef = doc(postsCollection, postId);
    await updateDoc(postRef, {
      commentCount: increment(1)
    });

    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * 2. getCommentsForPost(postId)
 * Query postComments where postId == input.
 * Order by createdAt ascending.
 * Return full list of comments in real-time using onSnapshot.
 */
export function getCommentsForPost(postId: string, callback: (comments: PostComment[]) => void): () => void {
  try {
    const q = query(
      postCommentsCollection,
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    // Return unsubscribe function from onSnapshot
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const comments: PostComment[] = [];
      
      querySnapshot.forEach((doc: DocumentData) => {
        const data = doc.data();
        comments.push({
          commentId: doc.id,
          postId: data.postId,
          userId: data.userId,
          commentText: data.commentText,
          parentCommentId: data.parentCommentId,
          mediaUrl: data.mediaUrl,
          createdAt: data.createdAt
        });
      });

      callback(comments);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error getting comments for post:', error);
    throw error;
  }
}

/**
 * 3. deleteComment(commentId, postId)
 * Delete the comment doc.
 * Decrement commentCount on the post.
 * If the comment has replies (parentCommentId match), DO NOT auto-delete replies (leave them as is).
 */
export async function deleteComment(commentId: string, postId: string): Promise<void> {
  try {
    // Delete the comment document
    const commentRef = doc(postCommentsCollection, commentId);
    await deleteDoc(commentRef);

    // Decrement commentCount on the post
    const postRef = doc(postsCollection, postId);
    await updateDoc(postRef, {
      commentCount: increment(-1)
    });

    // Note: We do NOT auto-delete replies as per requirements
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

/**
 * 4. getCommentReplies(parentCommentId)
 * Query all comments where parentCommentId == given parentCommentId.
 * Sorted by createdAt ascending.
 */
export async function getCommentReplies(parentCommentId: string): Promise<PostComment[]> {
  try {
    const q = query(
      postCommentsCollection,
      where('parentCommentId', '==', parentCommentId),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const replies: PostComment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      replies.push({
        commentId: doc.id,
        postId: data.postId,
        userId: data.userId,
        commentText: data.commentText,
        parentCommentId: data.parentCommentId,
        mediaUrl: data.mediaUrl,
        createdAt: data.createdAt
      });
    });

    return replies;
  } catch (error) {
    console.error('Error getting comment replies:', error);
    throw error;
  }
}

/**
 * Additional utility function to record post views
 */
export async function recordPostView(postId: string, userId: string): Promise<void> {
  try {
    const viewRef = doc(postViewsCollection);
    const viewData: PostView = {
      viewId: viewRef.id,
      postId,
      userId,
      viewedAt: serverTimestamp() as Timestamp
    };

    await setDoc(viewRef, viewData);
  } catch (error) {
    console.error('Error recording post view:', error);
    throw error;
  }
}

/**
 * Initialize collections with proper structure (for setup)
 */
export async function initializePostCollections(): Promise<void> {
  try {
    console.log('🚀 Initializing post collections...');

    // Create sample documents to establish collection structure
    const collections = [
      { name: 'posts', ref: postsCollection },
      { name: 'postLikes', ref: postLikesCollection },
      { name: 'postComments', ref: postCommentsCollection },
      { name: 'postViews', ref: postViewsCollection },
      { name: 'postMedia', ref: postMediaCollection },
      { name: 'userLikes', ref: userLikesCollection },
      { name: 'eventPosts', ref: eventPostsCollection }
    ];

    for (const collection of collections) {
      const placeholderRef = doc(collection.ref, '_placeholder');
      await setDoc(placeholderRef, {
        _isPlaceholder: true,
        _createdAt: serverTimestamp(),
        _note: `Placeholder document for ${collection.name} collection`
      });
      console.log(`✅ Created collection: ${collection.name}`);
    }

    console.log('✅ All post collections initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize post collections:', error);
    throw error;
  }
}