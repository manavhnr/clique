import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { commentsService } from '../services/commentsService';
import { createDemoComments, clearAllComments, migrateCommentsToSubcollections } from '../services/commentsTestUtils';

export default function CommentsTestScreen() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCreateDemoComments = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await createDemoComments();
      Alert.alert(
        result.success ? 'Success' : 'Error',
        result.message
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create demo comments');
    }
    setLoading(false);
  };

  const handleClearComments = async () => {
    Alert.alert(
      'Clear All Comments',
      'Are you sure you want to delete all comments? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await clearAllComments();
              Alert.alert(
                result.success ? 'Success' : 'Error',
                result.message
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to clear comments');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleMigration = async () => {
    Alert.alert(
      'Migrate Comments',
      'This will move comments from the old postComments collection to the new subcollection structure. Make sure to backup your data first.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Migrate',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await migrateCommentsToSubcollections();
              Alert.alert(
                result.success ? 'Success' : 'Error',
                result.message
              );
            } catch (error) {
              Alert.alert('Error', 'Migration failed');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const testCommentCreation = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in first');
      return;
    }
    
    setLoading(true);
    try {
      // This is just a test - you'd need a real post ID
      const testPostId = 'test_post_id';
      
      const result = await commentsService.createComment(testPostId, {
        userId: user.id,
        userName: user.name || user.username || 'Test User',
        commentText: 'This is a test comment created at ' + new Date().toLocaleString(),
      });
      
      Alert.alert(
        result.success ? 'Success' : 'Error',
        result.message
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create test comment');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comments System Test</Text>
        <Text style={styles.subtitle}>
          Test the new subcollection-based comment system
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo Data</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleCreateDemoComments}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Demo Comments'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearComments}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Clearing...' : 'Clear All Comments'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Migration</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={handleMigration}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Migrating...' : 'Migrate Old Comments'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testing</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testCommentCreation}
          disabled={loading || !user}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test Comment Creation'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.infoTitle}>How to use:</Text>
        <Text style={styles.infoText}>
          1. Create demo comments to test the system{"\n"}
          2. Go to HomeScreen and tap on a post's comment button{"\n"}
          3. Try adding comments and replies{"\n"}
          4. Test real-time updates by opening the comments on multiple devices
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
  },
  secondaryButton: {
    backgroundColor: '#10B981',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  info: {
    padding: 20,
    backgroundColor: '#F0F9FF',
    margin: 20,
    borderRadius: 8,
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
});