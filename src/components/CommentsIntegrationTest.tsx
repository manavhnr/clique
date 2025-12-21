/**
 * Comments Integration Test Component
 * Tests the enhanced Firestore integration for the comments system
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { 
  commentsService,
  CreateCommentData,
  CommentWithReplies
} from '../services/commentsService';
import { PostComment } from '../types/posts';
import { useAuth } from '../contexts/AuthContext';
import { getHomepagePosts } from '../services/postService';

interface TestResults {
  createComment: { success: boolean; error?: string; commentId?: string };
  getComments: { success: boolean; error?: string; count?: number };
  deleteComment: { success: boolean; error?: string };
  subscription: { success: boolean; error?: string; updates?: number };
}

export default function CommentsIntegrationTest() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [testPostId, setTestPostId] = useState<string | null>(null);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(`[CommentsTest] ${message}`);
  };

  const runIntegrationTest = async () => {
    if (!user) {
      Alert.alert('❌ Error', 'You must be logged in to run this test');
      return;
    }

    setTesting(true);
    setResults(null);
    setLogs([]);
    addLog('🚀 Starting Firestore comments integration test');
    
    const testResults: TestResults = {
      createComment: { success: false },
      getComments: { success: false },
      deleteComment: { success: false },
      subscription: { success: false }
    };

    try {
      // 1. Get a test post
      addLog('📋 Getting test post...');
      const posts = await getHomepagePosts();
      
      if (posts.length === 0) {
        throw new Error('No posts found for testing');
      }
      
      const testPost = posts[0];
      setTestPostId(testPost.postId);
      addLog(`✅ Using test post: ${testPost.postId}`);
      
      // 2. Test comment creation
      addLog('💬 Testing comment creation...');
      try {
        const commentData: CreateCommentData = {
          userId: user.phoneNumber || 'test-user',
          userName: user.phoneNumber || 'Test User',
          commentText: 'This is a test comment for Firestore integration! 🔥',
          parentCommentId: null,
          mediaUrl: null
        };
        
        const result = await commentsService.createComment(testPost.postId, commentData);
        if (!result.success) {
          throw new Error(result.message);
        }
        const newCommentId = result.commentId!;
        
        testResults.createComment = { success: true, commentId: newCommentId };
        addLog(`✅ Comment created with ID: ${newCommentId}`);
      } catch (error) {
        testResults.createComment = { success: false, error: String(error) };
        addLog(`❌ Comment creation failed: ${error}`);
      }
      
      // 3. Test getting comments
      addLog('📖 Testing get comments...');
      try {
        const result = await commentsService.getComments(testPost.postId);
        const comments = result.comments;
        testResults.getComments = { success: true, count: comments.length };
        addLog(`✅ Retrieved ${comments.length} comments`);
        
        // Log comment details
        comments.forEach((comment: CommentWithReplies, index: number) => {
          addLog(`  Comment ${index + 1}: ${comment.commentText.substring(0, 50)}...`);
        });
      } catch (error) {
        testResults.getComments = { success: false, error: String(error) };
        addLog(`❌ Get comments failed: ${error}`);
      }
      
      // 4. Test real-time subscription
      addLog('🔄 Testing real-time subscription...');
      let subscriptionUpdates = 0;
      let unsubscribe: (() => void) | null = null;
      
      try {
        unsubscribe = commentsService.subscribeToComments(
          testPost.postId,
          (comments: CommentWithReplies[]) => {
            subscriptionUpdates++;
            addLog(`📡 Subscription update ${subscriptionUpdates}: ${comments.length} comments`);
          },
          20 // limitCount
        );
        
        // Wait a moment for subscription to initialize
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        testResults.subscription = { success: true, updates: subscriptionUpdates };
        addLog(`✅ Subscription working (${subscriptionUpdates} updates received)`);
        
        // Clean up subscription
        if (unsubscribe) {
          unsubscribe();
          addLog('🧹 Subscription cleaned up');
        }
      } catch (error) {
        testResults.subscription = { success: false, error: String(error) };
        addLog(`❌ Subscription failed: ${error}`);
      }
      
      // 5. Test comment deletion (if we created one)
      if (testResults.createComment.success && testResults.createComment.commentId) {
        addLog('🗑️ Testing comment deletion...');
        try {
          const deleteResult = await commentsService.deleteComment(testPost.postId, testResults.createComment.commentId);
          if (!deleteResult.success) {
            throw new Error(deleteResult.message);
          }
          testResults.deleteComment = { success: true };
          addLog('✅ Comment deleted successfully');
        } catch (error) {
          testResults.deleteComment = { success: false, error: String(error) };
          addLog(`❌ Comment deletion failed: ${error}`);
        }
      } else {
        addLog('⏭️ Skipping deletion test (no comment created)');
      }
      
      // Final results
      setResults(testResults);
      addLog('🏁 Integration test completed');
      
      const totalTests = 4;
      const successfulTests = Object.values(testResults).filter(result => result.success).length;
      
      Alert.alert(
        '🔬 Test Results',
        `Firestore Comments Integration Test\n\n` +
        `✅ Successful: ${successfulTests}/${totalTests}\n` +
        `❌ Failed: ${totalTests - successfulTests}/${totalTests}\n\n` +
        `Create Comment: ${testResults.createComment.success ? '✅' : '❌'}\n` +
        `Get Comments: ${testResults.getComments.success ? '✅' : '❌'}\n` +
        `Subscription: ${testResults.subscription.success ? '✅' : '❌'}\n` +
        `Delete Comment: ${testResults.deleteComment.success ? '✅' : '❌'}\n\n` +
        `Check console for detailed logs.`
      );
      
    } catch (error) {
      addLog(`💥 Test suite failed: ${error}`);
      Alert.alert('❌ Test Failed', `Integration test encountered an error:\n\n${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔬 Comments Firestore Integration Test</Text>
        <Text style={styles.subtitle}>
          Tests the enhanced Firestore integration including CRUD operations and real-time updates
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, testing && styles.buttonDisabled]}
        onPress={runIntegrationTest}
        disabled={testing}
      >
        {testing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.buttonText}>Testing...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>🚀 Run Integration Test</Text>
        )}
      </TouchableOpacity>
      
      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📊 Test Results</Text>
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              Create Comment: {results.createComment.success ? '✅' : '❌'}
            </Text>
            {results.createComment.commentId && (
              <Text style={styles.resultDetail}>ID: {results.createComment.commentId}</Text>
            )}
          </View>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              Get Comments: {results.getComments.success ? '✅' : '❌'}
            </Text>
            {results.getComments.count !== undefined && (
              <Text style={styles.resultDetail}>Count: {results.getComments.count}</Text>
            )}
          </View>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              Real-time Subscription: {results.subscription.success ? '✅' : '❌'}
            </Text>
            {results.subscription.updates !== undefined && (
              <Text style={styles.resultDetail}>Updates: {results.subscription.updates}</Text>
            )}
          </View>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              Delete Comment: {results.deleteComment.success ? '✅' : '❌'}
            </Text>
          </View>
        </View>
      )}
      
      {logs.length > 0 && (
        <View style={styles.logsContainer}>
          <Text style={styles.logsTitle}>📝 Test Logs</Text>
          <ScrollView style={styles.logsScroll} showsVerticalScrollIndicator={false}>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
      
      {testPostId && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Test Post ID: {testPostId}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#9c27b0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultsContainer: {
    backgroundColor: '#2a2a3e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  resultItem: {
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  resultDetail: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 2,
    marginLeft: 20,
  },
  logsContainer: {
    backgroundColor: '#0a0a1a',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginBottom: 20,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  logsScroll: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    color: '#e0e0e0',
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  infoContainer: {
    backgroundColor: '#2a2a3e',
    padding: 10,
    borderRadius: 5,
  },
  infoText: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
  },
});