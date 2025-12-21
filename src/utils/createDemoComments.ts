/**
 * Demo Comments Creator
 * Creates sample comments in the new subcollection structure for testing
 */

import { commentsService, CreateCommentData } from '../services/commentsService';
import { getHomepagePosts } from '../services/postService';

export async function createDemoComments(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔨 Creating demo comments in subcollections...');
    
    // Get existing posts
    const posts = await getHomepagePosts();
    
    if (posts.length === 0) {
      return {
        success: false,
        message: 'No posts found. Please create some posts first.'
      };
    }
    
    const demoUsers = [
      { id: 'demo_user_1', name: 'Alex Johnson', avatar: 'https://picsum.photos/100/100?random=1' },
      { id: 'demo_user_2', name: 'Maria Garcia', avatar: 'https://picsum.photos/100/100?random=2' },
      { id: 'demo_user_3', name: 'David Chen', avatar: 'https://picsum.photos/100/100?random=3' },
      { id: 'demo_user_4', name: 'Sarah Wilson', avatar: 'https://picsum.photos/100/100?random=4' },
      { id: 'demo_user_5', name: 'Mike Brown', avatar: 'https://picsum.photos/100/100?random=5' },
    ];
    
    const demoComments = [
      "This looks amazing! 🔥",
      "Can't wait to be there!",
      "Such a great idea 💡",
      "Count me in! When do tickets go on sale?",
      "This is going to be epic! 🎉",
      "Love the vibe of this event",
      "Perfect timing, I'm free that day!",
      "The venue looks incredible 😍",
      "This is exactly what the city needs",
      "Already planning my outfit! ✨",
      "Hope there's good parking available",
      "The lineup is fantastic!",
      "Been waiting for something like this",
      "Sharing with all my friends!",
      "This is my kind of event! 🙌"
    ];
    
    const demoReplies = [
      "Same here! So excited 🎊",
      "Let's go together!",
      "I agree completely",
      "Thanks for sharing this!",
      "See you there! 👋",
      "Great point!",
      "Absolutely! 💯",
      "Me too! Can't wait",
      "You're so right about that",
      "This is going to be fun!"
    ];
    
    let createdCount = 0;
    
    // Create comments for each post
    for (const post of posts.slice(0, 3)) { // Only first 3 posts to avoid spam
      console.log(`Creating comments for post: ${post.postId}`);
      
      const commentIds: string[] = [];
      
      // Create 3-5 top-level comments for each post
      const numComments = Math.floor(Math.random() * 3) + 3; // 3-5 comments
      
      for (let i = 0; i < numComments; i++) {
        const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
        const randomComment = demoComments[Math.floor(Math.random() * demoComments.length)];
        
        const commentData: CreateCommentData = {
          userId: randomUser.id,
          userName: randomUser.name,
          userAvatar: randomUser.avatar,
          commentText: randomComment,
        };
        
        try {
          const result = await commentsService.createComment(post.postId, commentData);
          if (result.success && result.commentId) {
            commentIds.push(result.commentId);
            createdCount++;
            console.log(`✅ Created comment by ${randomUser.name}`);
          }
        } catch (error) {
          console.error('❌ Error creating comment:', error);
        }
      }
      
      // Create 1-2 replies for some comments
      const numReplies = Math.min(2, commentIds.length);
      
      for (let i = 0; i < numReplies; i++) {
        const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
        const randomReply = demoReplies[Math.floor(Math.random() * demoReplies.length)];
        const parentCommentId = commentIds[Math.floor(Math.random() * commentIds.length)];
        
        const replyData: CreateCommentData = {
          userId: randomUser.id,
          userName: randomUser.name,
          userAvatar: randomUser.avatar,
          commentText: randomReply,
          parentCommentId: parentCommentId,
        };
        
        try {
          const result = await commentsService.createComment(post.postId, replyData);
          if (result.success) {
            createdCount++;
            console.log(`💬 Created reply by ${randomUser.name}`);
          }
        } catch (error) {
          console.error('❌ Error creating reply:', error);
        }
      }
    }
    
    console.log(`🎉 Demo comments creation completed! Created ${createdCount} comments/replies`);
    
    return {
      success: true,
      message: `Successfully created ${createdCount} demo comments and replies`
    };
    
  } catch (error) {
    console.error('💥 Error creating demo comments:', error);
    return {
      success: false,
      message: `Failed to create demo comments: ${error}`
    };
  }
}

// Function to clear all comments (for testing purposes)
export async function clearAllComments(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🧹 Clearing all comments...');
    
    const posts = await getHomepagePosts();
    let deletedCount = 0;
    
    for (const post of posts) {
      try {
        const { comments } = await commentsService.getComments(post.postId, 100);
        
        for (const comment of comments) {
          try {
            await commentsService.deleteComment(post.postId, comment.commentId);
            deletedCount++;
          } catch (error) {
            console.error(`Error deleting comment ${comment.commentId}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error getting comments for post ${post.postId}:`, error);
      }
    }
    
    return {
      success: true,
      message: `Successfully deleted ${deletedCount} comments`
    };
    
  } catch (error) {
    console.error('Error clearing comments:', error);
    return {
      success: false,
      message: `Failed to clear comments: ${error}`
    };
  }
}

export default createDemoComments;