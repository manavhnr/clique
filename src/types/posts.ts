import { Timestamp } from 'firebase/firestore';

/**
 * EXACT FIRESTORE SCHEMAS AS SPECIFIED
 * Do NOT modify these types - they match the requirements exactly
 */

// posts collection
export interface Post {
  postId: string;           // doc ID
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
  // Subcollection: posts/{postId}/comments
}

// postLikes collection
export interface PostLike {
  likeId: string;           // doc ID
  postId: string;
  userId: string;
  likedAt: Timestamp;
}

// comments subcollection (posts/{postId}/comments)
export interface PostComment {
  commentId: string;        // doc ID
  userId: string;
  userName: string;         // Cache user name for display
  userAvatar?: string;      // Cache user avatar for display
  commentText: string;
  parentCommentId: string | null;
  mediaUrl: string | null;
  likeCount: number;        // Comments can be liked
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// postViews collection
export interface PostView {
  viewId: string;           // doc ID
  postId: string;
  userId: string;
  viewedAt: Timestamp;
}

// postMedia collection
export interface PostMedia {
  mediaId: string;
  postId: string;
  mediaUrl: string;
  type: "image" | "video";
  uploadedAt: Timestamp;
}

// userLikes collection
export interface UserLike {
  postId: string;
  userId: string;
  likedAt: Timestamp;
}

// eventPosts collection
export interface EventPost {
  postId: string;
  eventId: string;
  createdAt: Timestamp;
}

// Collection names as constants
export const COLLECTION_NAMES = {
  POSTS: 'posts',
  COMMENTS: 'comments',      // Subcollection under posts
  POST_LIKES: 'postLikes',
  POST_COMMENTS: 'postComments', // Keep for backward compatibility
  POST_VIEWS: 'postViews',
  POST_MEDIA: 'postMedia',
  USER_LIKES: 'userLikes',
  EVENT_POSTS: 'eventPosts'
} as const;