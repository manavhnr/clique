import { addComment, getCommentsForPost, deleteComment, getCommentReplies } from '../services/postService';

/**
 * Test function to verify comment functionality
 */
export async function testCommentSystem(postId: string, userId: string): Promise<void> {
  console.log('🧪 Testing comment system...');

  try {
    // Test 1: Add a comment
    console.log('📝 Test 1: Adding a comment...');
    const commentId = await addComment(postId, userId, 'This is a test comment!');
    console.log(`✅ Comment created with ID: ${commentId}`);

    // Test 2: Add a reply
    console.log('💬 Test 2: Adding a reply...');
    const replyId = await addComment(postId, userId, 'This is a reply to the comment!', commentId);
    console.log(`✅ Reply created with ID: ${replyId}`);

    // Test 3: Get comments for post (using callback for real-time)
    console.log('📋 Test 3: Getting comments for post...');
    const unsubscribe = getCommentsForPost(postId, (comments) => {
      console.log(`✅ Retrieved ${comments.length} comments for post ${postId}`);
      comments.forEach(comment => {
        console.log(`- Comment: "${comment.commentText}" by ${comment.userId}`);
        console.log(`  Parent: ${comment.parentCommentId || 'None'}`);
      });
    });

    // Wait a bit to receive data
    setTimeout(() => {
      unsubscribe();
      console.log('✅ Unsubscribed from real-time comments');
    }, 2000);

    // Test 4: Get replies for the comment
    console.log('🔄 Test 4: Getting replies for comment...');
    setTimeout(async () => {
      try {
        const replies = await getCommentReplies(commentId);
        console.log(`✅ Retrieved ${replies.length} replies for comment ${commentId}`);
        replies.forEach(reply => {
          console.log(`- Reply: "${reply.commentText}" by ${reply.userId}`);
        });
      } catch (error) {
        console.error('❌ Error getting replies:', error);
      }
    }, 3000);

    // Test 5: Delete comment (optional - uncomment if you want to test deletion)
    // setTimeout(async () => {
    //   try {
    //     console.log('🗑️ Test 5: Deleting comment...');
    //     await deleteComment(commentId, postId);
    //     console.log('✅ Comment deleted successfully');
    //   } catch (error) {
    //     console.error('❌ Error deleting comment:', error);
    //   }
    // }, 5000);

    console.log('✅ Comment system test completed!');

  } catch (error) {
    console.error('❌ Comment system test failed:', error);
  }
}

/**
 * Helper function to test with a specific post and user
 */
export async function runCommentTest(): Promise<void> {
  const testPostId = 'test-post-id'; // Replace with actual post ID
  const testUserId = 'test-user-id'; // Replace with actual user ID

  console.log('🚀 Starting comment system test...');
  console.log(`📍 Post ID: ${testPostId}`);
  console.log(`👤 User ID: ${testUserId}`);

  await testCommentSystem(testPostId, testUserId);
}