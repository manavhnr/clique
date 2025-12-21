import { 
  createPost,
  getHomepagePosts,
  likePost,
  unlikePost,
  fetchUserLikedState,
  addComment,
  recordPostView
} from '../services/postService';
import { initializePostCollections, verifyPostCollections } from '../services/postCollectionSetup';

/**
 * EXAMPLE USAGE OF THE EXACT FIRESTORE POST SYSTEM
 * 
 * This file demonstrates how to use all the required functions
 * with the exact schema and collections specified.
 */

// Example usage functions
export class PostSystemExample {
  
  /**
   * Initialize the post system (run once)
   */
  static async setupPostSystem() {
    try {
      console.log('Setting up post system...');
      
      // Initialize all 7 collections
      await initializePostCollections();
      
      // Verify all collections exist
      const verification = await verifyPostCollections();
      
      if (verification.success) {
        console.log('✅ Post system ready!');
      } else {
        console.error('❌ Post system setup incomplete');
      }
    } catch (error) {
      console.error('Setup failed:', error);
    }
  }

  /**
   * Example: Create a new post
   */
  static async exampleCreatePost() {
    try {
      const postId = await createPost(
        'user123',                    // authorId
        'event456',                   // eventId (or null)
        'Check out this amazing event!', // text
        ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'], // mediaUrls
        'public'                      // visibility
      );
      
      console.log('Created post:', postId);
      return postId;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  /**
   * Example: Fetch homepage posts
   */
  static async exampleGetPosts() {
    try {
      const posts = await getHomepagePosts(10); // limit to 10 posts
      console.log('Homepage posts:', posts);
      return posts;
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      throw error;
    }
  }

  /**
   * Example: Like a post
   */
  static async exampleLikePost(postId: string, userId: string) {
    try {
      // Check if already liked
      const isAlreadyLiked = await fetchUserLikedState(postId, userId);
      
      if (isAlreadyLiked) {
        console.log('User already liked this post');
        return;
      }

      await likePost(postId, userId);
      console.log('Post liked successfully');
    } catch (error) {
      console.error('Failed to like post:', error);
      throw error;
    }
  }

  /**
   * Example: Unlike a post
   */
  static async exampleUnlikePost(postId: string, userId: string) {
    try {
      // Check if actually liked
      const isLiked = await fetchUserLikedState(postId, userId);
      
      if (!isLiked) {
        console.log('User has not liked this post');
        return;
      }

      await unlikePost(postId, userId);
      console.log('Post unliked successfully');
    } catch (error) {
      console.error('Failed to unlike post:', error);
      throw error;
    }
  }

  /**
   * Example: Add a comment
   */
  static async exampleAddComment(postId: string, userId: string, text: string) {
    try {
      const commentId = await addComment(postId, userId, text);
      console.log('Comment added:', commentId);
      return commentId;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }

  /**
   * Example: Get comments for a post (using comments service)
   */
  static async exampleGetComments(postId: string) {
    try {
      // Use commentsService instead
      const { commentsService } = await import('../services/commentsService');
      const result = await commentsService.getComments(postId);
      console.log('Post comments:', result.comments);
      return result.comments;
    } catch (error) {
      console.error('Failed to get comments:', error);
      throw error;
    }
  }

  /**
   * Example: Record a post view
   */
  static async exampleRecordView(postId: string, userId: string) {
    try {
      await recordPostView(postId, userId);
      console.log('Post view recorded');
    } catch (error) {
      console.error('Failed to record view:', error);
      throw error;
    }
  }

  /**
   * Complete example workflow
   */
  static async exampleFullWorkflow() {
    try {
      console.log('Starting post system example...');

      // 1. Setup system
      await this.setupPostSystem();

      // 2. Create a post
      const postId = await this.exampleCreatePost();

      // 3. Get posts
      await this.exampleGetPosts();

      // 4. Record a view
      await this.exampleRecordView(postId, 'viewer123');

      // 5. Like the post
      await this.exampleLikePost(postId, 'user456');

      // 6. Add a comment
      const commentId = await this.exampleAddComment(postId, 'user456', 'Great post!');

      // 7. Get comments
      await this.exampleGetComments(postId);

      // 8. Check like state
      const isLiked = await fetchUserLikedState(postId, 'user456');
      console.log('Is post liked:', isLiked);

      console.log('✅ Full workflow completed successfully!');
    } catch (error) {
      console.error('❌ Workflow failed:', error);
    }
  }
}

/**
 * EXACT COLLECTION STRUCTURE SUMMARY
 * 
 * The system creates exactly these 7 collections:
 * 
 * 1. posts - Main post data with counts
 * 2. postLikes - Individual like records  
 * 3. postComments - Comment data with threading
 * 4. postViews - View tracking
 * 5. postMedia - Media file references
 * 6. userLikes - User-post like relationships
 * 7. eventPosts - Event-post associations
 * 
 * Cloud Functions:
 * - onPostLikeCreated: Increments posts.likeCount
 * - onPostLikeDeleted: Decrements posts.likeCount
 * 
 * All functions use Firebase v9 modular SDK with TypeScript.
 * All timestamps use serverTimestamp().
 * All operations follow Firestore best practices.
 */