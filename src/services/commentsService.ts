import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  onSnapshot,
  increment,
  Timestamp,
  DocumentSnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { PostComment, COLLECTION_NAMES } from '../types/posts';

export interface CreateCommentData {
  userId: string;
  userName: string;
  userAvatar?: string;
  commentText: string;
  parentCommentId?: string | null;
  mediaUrl?: string | null;
}

export interface CommentWithReplies extends PostComment {
  replies: PostComment[];
  isExpanded?: boolean;
}

class CommentsService {
  // Get comments collection reference for a specific post
  private getCommentsCollection(postId: string): CollectionReference {
    return collection(db, COLLECTION_NAMES.POSTS, postId, COLLECTION_NAMES.COMMENTS);
  }

  // Get posts collection reference
  private getPostsCollection() {
    return collection(db, COLLECTION_NAMES.POSTS);
  }

  // Create a new comment
  async createComment(postId: string, commentData: CreateCommentData): Promise<{ success: boolean; commentId?: string; message: string }> {
    try {
      console.log(`Creating comment for post ${postId}:`, commentData);
      
      const commentsCollection = this.getCommentsCollection(postId);
      const postsCollection = this.getPostsCollection();

      // Create the comment object without undefined values
      const comment: Partial<PostComment> = {
        userId: commentData.userId,
        userName: commentData.userName,
        commentText: commentData.commentText,
        parentCommentId: commentData.parentCommentId || null,
        mediaUrl: commentData.mediaUrl || null,
        likeCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Only add userAvatar if it has a value
      if (commentData.userAvatar) {
        comment.userAvatar = commentData.userAvatar;
      }

      // Add comment to subcollection
      const commentRef = await addDoc(commentsCollection, comment);
      console.log(`Comment created with ID: ${commentRef.id}`);

      // Update comment count in parent post
      const postRef = doc(postsCollection, postId);
      await updateDoc(postRef, {
        commentCount: increment(1),
        updatedAt: Timestamp.now(),
      });
      
      console.log(`Updated comment count for post ${postId}`);

      return {
        success: true,
        commentId: commentRef.id,
        message: 'Comment added successfully'
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      return {
        success: false,
        message: `Failed to create comment: ${error}`
      };
    }
  }

  // Get comments for a post with pagination
  async getComments(
    postId: string,
    limitCount: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    comments: CommentWithReplies[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      console.log(`Fetching comments for post ${postId}, limit: ${limitCount}`);
      
      const commentsCollection = this.getCommentsCollection(postId);
      
      // Use simple query to avoid composite index requirement
      let q = query(
        commentsCollection,
        orderBy('createdAt', 'desc'),
        limit(limitCount * 2) // Get more to filter client-side
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      console.log(`Retrieved ${snapshot.size} total comments from Firestore`);
      
      const allComments: PostComment[] = [];

      // Process all comments with proper data validation
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Validate required fields
        if (data.userId && data.commentText) {
          const comment: PostComment = {
            commentId: doc.id,
            userId: data.userId,
            userName: data.userName || 'Anonymous User',
            commentText: data.commentText,
            parentCommentId: data.parentCommentId || null,
            mediaUrl: data.mediaUrl || null,
            likeCount: data.likeCount || 0,
            createdAt: data.createdAt || Timestamp.now(),
            updatedAt: data.updatedAt || Timestamp.now(),
          };

          // Only add userAvatar if it exists
          if (data.userAvatar) {
            comment.userAvatar = data.userAvatar;
          }

          allComments.push(comment);
        }
      });

      // Filter for top-level comments (no parent) client-side
      const topLevelComments = allComments
        .filter(comment => !comment.parentCommentId)
        .slice(0, limitCount);
        
      console.log(`Filtered to ${topLevelComments.length} top-level comments`);

      const comments: CommentWithReplies[] = [];

      // Get replies for each top-level comment
      for (const comment of topLevelComments) {
        const replies = await this.getReplies(postId, comment.commentId);
        comments.push({
          ...comment,
          replies,
          isExpanded: false
        });
      }

      return {
        comments,
        hasMore: topLevelComments.length === limitCount,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return {
        comments: [],
        hasMore: false
      };
    }
  }

  // Get replies for a specific comment
  async getReplies(postId: string, parentCommentId: string): Promise<PostComment[]> {
    try {
      console.log(`Fetching replies for comment ${parentCommentId} in post ${postId}`);
      
      const commentsCollection = this.getCommentsCollection(postId);
      
      // Get all comments and filter client-side to avoid index requirements
      const q = query(
        commentsCollection,
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      const replies: PostComment[] = [];

      // Filter for replies to this specific comment client-side
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.parentCommentId === parentCommentId) {
          const reply: PostComment = {
            commentId: doc.id,
            userId: data.userId,
            userName: data.userName || 'Anonymous',
            commentText: data.commentText || '',
            parentCommentId: data.parentCommentId,
            mediaUrl: data.mediaUrl || null,
            likeCount: data.likeCount || 0,
            createdAt: data.createdAt || Timestamp.now(),
            updatedAt: data.updatedAt || Timestamp.now(),
          };

          // Only add userAvatar if it exists
          if (data.userAvatar) {
            reply.userAvatar = data.userAvatar;
          }

          replies.push(reply);
        }
      });

      console.log(`Found ${replies.length} replies for comment ${parentCommentId}`);
      return replies;
    } catch (error) {
      console.error('Error fetching replies:', error);
      return [];
    }
  }

  // Update a comment
  async updateComment(
    postId: string,
    commentId: string,
    updates: Partial<Pick<PostComment, 'commentText' | 'mediaUrl'>>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const commentsCollection = this.getCommentsCollection(postId);
      const commentRef = doc(commentsCollection, commentId);

      await updateDoc(commentRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      return {
        success: true,
        message: 'Comment updated successfully'
      };
    } catch (error) {
      console.error('Error updating comment:', error);
      return {
        success: false,
        message: 'Failed to update comment'
      };
    }
  }

  // Delete a comment
  async deleteComment(postId: string, commentId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Deleting comment ${commentId} from post ${postId}`);
      
      const commentsCollection = this.getCommentsCollection(postId);
      const postsCollection = this.getPostsCollection();

      // First, get all replies to this comment
      const repliesQuery = query(
        commentsCollection,
        orderBy('createdAt', 'asc')
      );
      
      const repliesSnapshot = await getDocs(repliesQuery);
      const repliesToDelete: string[] = [];
      
      repliesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.parentCommentId === commentId) {
          repliesToDelete.push(doc.id);
        }
      });
      
      console.log(`Found ${repliesToDelete.length} replies to delete`);

      // Delete the main comment
      const commentRef = doc(commentsCollection, commentId);
      await deleteDoc(commentRef);
      
      // Delete all replies
      for (const replyId of repliesToDelete) {
        const replyRef = doc(commentsCollection, replyId);
        await deleteDoc(replyRef);
      }

      // Update comment count in parent post
      const totalDeleted = 1 + repliesToDelete.length;
      const postRef = doc(postsCollection, postId);
      await updateDoc(postRef, {
        commentCount: increment(-totalDeleted),
        updatedAt: Timestamp.now(),
      });
      
      console.log(`Deleted ${totalDeleted} comments and updated post count`);

      return {
        success: true,
        message: `Comment and ${repliesToDelete.length} replies deleted successfully`
      };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return {
        success: false,
        message: `Failed to delete comment: ${error}`
      };
    }
  }

  // Like/unlike a comment
  async toggleCommentLike(postId: string, commentId: string, userId: string): Promise<{ success: boolean; isLiked: boolean }> {
    try {
      const commentsCollection = this.getCommentsCollection(postId);
      const commentRef = doc(commentsCollection, commentId);
      const commentDoc = await getDoc(commentRef);

      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }

      // For simplicity, we'll just increment/decrement the count
      // In a real app, you might want to track individual likes in a subcollection
      const currentLikes = commentDoc.data()?.likeCount || 0;
      const increment_value = currentLikes > 0 ? -1 : 1; // Toggle logic (simplified)

      await updateDoc(commentRef, {
        likeCount: increment(increment_value),
        updatedAt: Timestamp.now(),
      });

      return {
        success: true,
        isLiked: increment_value > 0
      };
    } catch (error) {
      console.error('Error toggling comment like:', error);
      return {
        success: false,
        isLiked: false
      };
    }
  }

  // Real-time listener for comments
  subscribeToComments(
    postId: string,
    callback: (comments: CommentWithReplies[]) => void,
    limitCount: number = 20
  ) {
    const commentsCollection = this.getCommentsCollection(postId);
    
    // Use simpler query to avoid composite index requirement
    const q = query(
      commentsCollection,
      orderBy('createdAt', 'desc'),
      limit(limitCount * 2) // Get more to filter client-side
    );

    return onSnapshot(q, async (snapshot) => {
      const allComments: PostComment[] = [];

      // Get all comments with proper data handling
      snapshot.forEach((doc) => {
        const data = doc.data();
        const comment: PostComment = {
          commentId: doc.id,
          userId: data.userId,
          userName: data.userName || 'Anonymous',
          commentText: data.commentText || '',
          parentCommentId: data.parentCommentId || null,
          mediaUrl: data.mediaUrl || null,
          likeCount: data.likeCount || 0,
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now(),
        };

        // Only add userAvatar if it exists
        if (data.userAvatar) {
          comment.userAvatar = data.userAvatar;
        }

        allComments.push(comment);
      });

      // Filter for top-level comments client-side
      const topLevelComments = allComments
        .filter(comment => !comment.parentCommentId)
        .slice(0, limitCount);

      const comments: CommentWithReplies[] = [];

      // Get replies for each comment
      for (const comment of topLevelComments) {
        const replies = allComments.filter(
          reply => reply.parentCommentId === comment.commentId
        );

        comments.push({
          ...comment,
          replies,
          isExpanded: false
        });
      }

      callback(comments);
    }, (error) => {
      console.error('Error in comments listener:', error);
      callback([]); // Return empty array on error
    });
  }

  // Get comment count for a post (alternative to reading from post document)
  async getCommentCount(postId: string): Promise<number> {
    try {
      const commentsCollection = this.getCommentsCollection(postId);
      const snapshot = await getDocs(commentsCollection);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  }
}

export const commentsService = new CommentsService();

// Exported convenience functions that match the expected API
export const addComment = async (
  postId: string,
  userId: string,
  content: string,
  parentCommentId?: string
): Promise<{ success: boolean; commentId?: string; error?: string }> => {
  const result = await commentsService.createComment(postId, {
    userId,
    userName: 'User', // You may want to get this from auth context
    commentText: content,
    parentCommentId
  });

  return {
    success: result.success,
    commentId: result.commentId,
    error: result.success ? undefined : result.message
  };
};

export const deleteComment = async (
  commentId: string,
  postId: string
): Promise<{ success: boolean; error?: string }> => {
  const result = await commentsService.deleteComment(postId, commentId);
  
  return {
    success: result.success,
    error: result.success ? undefined : result.message
  };
};

export const getCommentsForPost = (
  postId: string,
  callback: (comments: CommentWithReplies[]) => void
): (() => void) => {
  return commentsService.subscribeToComments(postId, callback);
};