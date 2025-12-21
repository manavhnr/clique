/**
 * Firestore Index Configuration for Comments
 * 
 * This file contains the required Firestore composite indexes for optimal comment queries.
 * You can either:
 * 1. Use the simple queries (current implementation) - no indexes needed
 * 2. Create these indexes and use the optimized queries below
 */

/**
 * REQUIRED FIRESTORE INDEXES
 * 
 * To use optimized server-side filtering, create these composite indexes in Firebase Console:
 * 
 * 1. Collection Group: comments
 *    Fields: parentCommentId (Ascending), createdAt (Descending)
 *    Query scope: Collection group
 * 
 * 2. Collection Group: comments  
 *    Fields: parentCommentId (Ascending), createdAt (Ascending)
 *    Query scope: Collection group
 * 
 * You can create these indexes by:
 * 1. Going to the Firebase Console
 * 2. Navigate to Firestore Database > Indexes
 * 3. Click "Create Index"
 * 4. Set Collection ID to "comments"
 * 5. Add the fields as specified above
 * 
 * OR click this auto-generated link from your error:
 * https://console.firebase.google.com/v1/r/project/clique-c679c/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9jbGlxdWUtYzY3OWMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NvbW1lbnRzL2luZGV4ZXMvXxABGhMKD3BhcmVudENvbW1lbnRJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
 */

import { 
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  DocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { PostComment } from '../types/posts';

/**
 * OPTIMIZED QUERIES (requires indexes above)
 * 
 * Once you create the Firestore indexes, you can replace the methods in commentsService.ts 
 * with these optimized versions for better performance:
 */

export class OptimizedCommentsService {
  private getCommentsCollection(postId: string) {
    return collection(db, 'posts', postId, 'comments');
  }

  /**
   * Optimized getComments - requires composite index
   * Use this after creating the Firestore index
   */
  async getCommentsOptimized(
    postId: string,
    limitCount: number = 20,
    lastDoc?: DocumentSnapshot
  ) {
    const commentsCollection = this.getCommentsCollection(postId);
    
    // This query requires the composite index: parentCommentId + createdAt
    let q = query(
      commentsCollection,
      where('parentCommentId', '==', null),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    return snapshot;
  }

  /**
   * Optimized getReplies - requires composite index
   * Use this after creating the Firestore index
   */
  async getRepliesOptimized(postId: string, parentCommentId: string) {
    const commentsCollection = this.getCommentsCollection(postId);
    
    // This query requires the composite index: parentCommentId + createdAt  
    const q = query(
      commentsCollection,
      where('parentCommentId', '==', parentCommentId),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot;
  }

  /**
   * Optimized real-time listener - requires composite index
   * Use this after creating the Firestore index
   */
  subscribeToCommentsOptimized(
    postId: string,
    callback: (snapshot: any) => void,
    limitCount: number = 20
  ) {
    const commentsCollection = this.getCommentsCollection(postId);
    
    // This query requires the composite index: parentCommentId + createdAt
    const q = query(
      commentsCollection,
      where('parentCommentId', '==', null),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, callback);
  }
}

/**
 * INDEX CREATION INSTRUCTIONS
 * 
 * To create the required indexes:
 * 
 * 1. AUTOMATIC (Recommended):
 *    - Click the link from your error message
 *    - It will take you directly to index creation page
 *    - Click "Create Index"
 * 
 * 2. MANUAL:
 *    a) Go to Firebase Console > Firestore Database > Indexes
 *    b) Click "Create Index" 
 *    c) Fill in:
 *       - Collection ID: comments
 *       - Field 1: parentCommentId (Ascending)
 *       - Field 2: createdAt (Descending) 
 *       - Query scope: Collection group
 *    d) Click "Create"
 * 
 * 3. PROGRAMMATIC (Advanced):
 *    You can also create indexes using Firebase CLI:
 *    ```
 *    firebase deploy --only firestore:indexes
 *    ```
 *    With a firestore.indexes.json file containing the index definitions.
 */

/**
 * Firestore indexes configuration (firestore.indexes.json)
 * You can save this as firestore.indexes.json in your project root
 */
export const firestoreIndexesConfig = {
  "indexes": [
    {
      "collectionGroup": "comments",
      "queryScope": "COLLECTION_GROUP", 
      "fields": [
        { "fieldPath": "parentCommentId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "comments",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "parentCommentId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
};

/**
 * CURRENT SOLUTION
 * 
 * For now, the commentsService.ts uses client-side filtering to avoid the index requirement.
 * This works fine for moderate comment volumes but may be slower for posts with many comments.
 * 
 * Benefits of current approach:
 * - No index creation needed
 * - Works immediately
 * - Good for development/testing
 * 
 * Benefits of optimized approach (with indexes):
 * - Faster queries
 * - Better performance at scale
 * - More efficient use of Firestore reads
 * - Production-ready
 */

export default OptimizedCommentsService;