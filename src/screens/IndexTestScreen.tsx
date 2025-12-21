import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { commentsService } from '../services/commentsService';
import { getHomepagePosts } from '../services/postService';

export default function IndexTestScreen() {
  const [testing, setTesting] = useState(false);

  const testCommentsQuery = async () => {
    setTesting(true);
    try {
      console.log('🧪 Testing comments query...');
      
      // Get a sample post
      const posts = await getHomepagePosts();
      if (posts.length === 0) {
        Alert.alert('No Posts', 'Please create some posts first in the HomeScreen');
        setTesting(false);
        return;
      }
      
      const testPost = posts[0];
      console.log(`📝 Testing with post: ${testPost.postId}`);
      
      // Test the new query
      const result = await commentsService.getComments(testPost.postId);
      const comments = result.comments;
      console.log(`✅ Query successful! Found ${comments.length} comments`);
      
      comments.forEach((comment, index) => {
        console.log(`  ${index + 1}. ${comment.userName}: ${comment.commentText.slice(0, 50)}...`);
      });
      
      Alert.alert('✅ Test Passed', `Successfully fetched ${comments.length} comments without index errors!`);
    } catch (error) {
      console.error('❌ Test failed:', error);
      Alert.alert('Test Failed ❌', `Error: ${error}`);
    }
    setTesting(false);
  };

  const testRealTimeListener = () => {
    Alert.alert(
      '📡 Testing Real-time Listener',
      'This will test the real-time comments subscription. Check the console for results.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test Listener',
          onPress: async () => {
            try {
              const posts = await getHomepagePosts();
              if (posts.length === 0) {
                Alert.alert('No Posts', 'Please create some posts first');
                return;
              }
              
              const testPost = posts[0];
              console.log(`🔄 Setting up real-time listener for post: ${testPost.postId}`);
              
              const unsubscribe = commentsService.subscribeToComments(
                testPost.postId,
                (comments) => {
                  console.log(`📡 Real-time update: ${comments.length} comments`);
                  comments.forEach((comment, index) => {
                    console.log(`  ${index + 1}. ${comment.userName}: ${comment.commentText.slice(0, 50)}...`);
                  });
                }
              );
              
              // Auto-unsubscribe after 10 seconds
              setTimeout(() => {
                unsubscribe();
                console.log('🛑 Real-time listener unsubscribed');
                Alert.alert('✅ Success', 'Real-time listener test completed! Check console for results.');
              }, 10000);
              
            } catch (error) {
              console.error('❌ Real-time test failed:', error);
              Alert.alert('❌ Test Failed', `Error: ${error}`);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🔥 Index Fix Test</Text>
        <Text style={styles.subtitle}>
          Test the comments system after fixing the Firestore index error
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Fix Applied</Text>
          <Text style={styles.description}>
            The comments service now uses client-side filtering to avoid composite index requirements. This should eliminate the Firestore index error.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Test Queries</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={testCommentsQuery}
            disabled={testing}
          >
            <Text style={styles.buttonText}>
              {testing ? 'Testing...' : '🔍 Test Comments Query'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testRealTimeListener}
            disabled={testing}
          >
            <Text style={styles.buttonText}>
              📡 Test Real-time Listener
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 What Was Fixed:</Text>
          <Text style={styles.infoText}>
            • Removed complex queries that required composite indexes{'\n'}
            • Now uses simple orderBy('createdAt') queries{'\n'}
            • Added client-side filtering for parentCommentId{'\n'}
            • Should work without creating Firestore indexes{'\n\n'}
            
            <Text style={styles.boldText}>Performance:</Text>{'\n'}
            • Works immediately (no index setup needed){'\n'}
            • Good for moderate comment volumes{'\n'}
            • For high-performance needs, create the Firestore indexes
          </Text>
        </View>

        <View style={styles.nextSteps}>
          <Text style={styles.nextStepsTitle}>🚀 Next Steps:</Text>
          <Text style={styles.nextStepsText}>
            1. Run the tests above to verify the fix{'\n'}
            2. Go to HomeScreen and test commenting{'\n'}
            3. Check that no more index errors appear{'\n'}
            4. If you need better performance, create the Firestore indexes
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  secondaryButton: {
    backgroundColor: '#6366F1',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '600',
  },
  nextSteps: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  nextStepsText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
});