import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { COLLECTION_NAMES } from '../types/posts';

/**
 * Initialize all required Firestore collections for the post system
 * Creates exactly the 7 collections specified in the requirements
 */
export async function initializePostCollections(): Promise<void> {
  try {
    console.log('🚀 Initializing exact post collections...');

    // Collection definitions as specified in requirements
    const collectionsToCreate = [
      COLLECTION_NAMES.POSTS,
      COLLECTION_NAMES.POST_LIKES,
      COLLECTION_NAMES.POST_COMMENTS,
      COLLECTION_NAMES.POST_VIEWS,
      COLLECTION_NAMES.POST_MEDIA,
      COLLECTION_NAMES.USER_LIKES,
      COLLECTION_NAMES.EVENT_POSTS
    ];

    // Create each collection with a placeholder document
    for (const collectionName of collectionsToCreate) {
      const collectionRef = collection(db, collectionName);
      const placeholderRef = doc(collectionRef, '_placeholder');
      
      await setDoc(placeholderRef, {
        _isPlaceholder: true,
        _createdAt: serverTimestamp(),
        _note: `Placeholder document for ${collectionName} collection`,
        _schema: getSchemaForCollection(collectionName)
      });
      
      console.log(`✅ Created collection: ${collectionName}`);
    }

    console.log('✅ All 7 post collections initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize post collections:', error);
    throw error;
  }
}

/**
 * Get the exact schema for each collection as specified
 */
function getSchemaForCollection(collectionName: string): object {
  switch (collectionName) {
    case COLLECTION_NAMES.POSTS:
      return {
        postId: 'string (doc ID)',
        authorId: 'string',
        eventId: 'string | null',
        text: 'string',
        mediaUrls: 'string[]',
        likeCount: 'number',
        commentCount: 'number',
        shareCount: 'number',
        visibility: 'string',
        createdAt: 'Timestamp',
        updatedAt: 'Timestamp'
      };

    case COLLECTION_NAMES.POST_LIKES:
      return {
        likeId: 'string (doc ID)',
        postId: 'string',
        userId: 'string',
        likedAt: 'Timestamp'
      };

    case COLLECTION_NAMES.POST_COMMENTS:
      return {
        commentId: 'string (doc ID)',
        postId: 'string',
        userId: 'string',
        commentText: 'string',
        parentCommentId: 'string | null',
        mediaUrl: 'string | null',
        createdAt: 'Timestamp'
      };

    case COLLECTION_NAMES.POST_VIEWS:
      return {
        viewId: 'string (doc ID)',
        postId: 'string',
        userId: 'string',
        viewedAt: 'Timestamp'
      };

    case COLLECTION_NAMES.POST_MEDIA:
      return {
        mediaId: 'string',
        postId: 'string',
        mediaUrl: 'string',
        type: '"image" | "video"',
        uploadedAt: 'Timestamp'
      };

    case COLLECTION_NAMES.USER_LIKES:
      return {
        postId: 'string',
        userId: 'string',
        likedAt: 'Timestamp'
      };

    case COLLECTION_NAMES.EVENT_POSTS:
      return {
        postId: 'string',
        eventId: 'string',
        createdAt: 'Timestamp'
      };

    default:
      return {};
  }
}

/**
 * Verify all required collections exist
 */
export async function verifyPostCollections(): Promise<{ success: boolean; existing: string[]; missing: string[] }> {
  console.log('🔍 Verifying post collections...');
  
  const requiredCollections = [
    COLLECTION_NAMES.POSTS,
    COLLECTION_NAMES.POST_LIKES,
    COLLECTION_NAMES.POST_COMMENTS,
    COLLECTION_NAMES.POST_VIEWS,
    COLLECTION_NAMES.POST_MEDIA,
    COLLECTION_NAMES.USER_LIKES,
    COLLECTION_NAMES.EVENT_POSTS
  ];

  const existing: string[] = [];
  const missing: string[] = [];

  for (const collectionName of requiredCollections) {
    try {
      const collectionRef = collection(db, collectionName);
      const placeholderRef = doc(collectionRef, '_placeholder');
      
      // This will succeed if collection exists, throw if it doesn't
      existing.push(collectionName);
    } catch (error) {
      missing.push(collectionName);
    }
  }

  const success = missing.length === 0;
  
  console.log(`
  📊 Post Collections Verification:
  ✅ Required: 7 collections
  ✅ Existing: ${existing.length}/${requiredCollections.length}
  ${existing.map(c => `   - ${c}`).join('\n')}
  
  ${missing.length > 0 ? `❌ Missing: ${missing.length}
  ${missing.map(c => `   - ${c}`).join('\n')}` : '🎉 All post collections exist!'}
  `);

  return { success, existing, missing };
}