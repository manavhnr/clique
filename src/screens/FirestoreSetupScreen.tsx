import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { 
  runFirestoreSetup,
  batchSetupCommentsSubcollections,
  initializeCommentsSubcollectionStructure
} from '../utils/setupFirestoreComments';
import { createDemoComments, clearAllComments } from '../utils/createDemoComments';
import CommentsIntegrationTest from '../components/CommentsIntegrationTest';

export default function FirestoreSetupScreen() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCompleteSetup = async () => {
    Alert.alert(
      '🔥 Setup Firestore Comments Database',
      'This will create comments subcollections in your Firestore database for all existing posts. This is a one-time setup process.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Setup Database',
          onPress: async () => {
            setLoading(true);
            try {
              console.log('🚀 Starting complete Firestore setup...');
              await runFirestoreSetup();
              Alert.alert(
                '✅ Success!', 
                'Firestore comments subcollections have been created!\n\n📋 Next steps:\n1. Check your Firestore console\n2. Look for posts/{postId}/comments subcollections\n3. Test the comment system in your app'
              );
            } catch (error) {
              console.error('❌ Setup error:', error);
              Alert.alert('Error', 'Failed to setup Firestore structure. Check console for details.');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleQuickSetup = async () => {
    if (loading) return;
    
    Alert.alert(
      '⚡ Quick Batch Setup',
      'This will create comments subcollections for all posts with sample data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Subcollections',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await batchSetupCommentsSubcollections();
              Alert.alert(
                result.success ? '✅ Success' : '❌ Error',
                result.message + 
                (result.success ? `\n\n📊 Statistics:\n• Posts processed: ${result.details.postsProcessed}\n• Comments created: ${result.details.totalComments}` : '')
              );
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to setup Firestore comments');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleStructureInit = async () => {
    if (loading) return;
    
    Alert.alert(
      '🔧 Initialize Structure',
      'This creates the basic subcollection structure without sample data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Initialize',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await initializeCommentsSubcollectionStructure();
              Alert.alert(
                result.success ? '✅ Success' : '❌ Error',
                result.message
              );
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to initialize structure');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleCreateDemoComments = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await createDemoComments();
      Alert.alert(
        result.success ? '✅ Success' : '❌ Error',
        result.message
      );
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to create demo comments');
    }
    setLoading(false);
  };

  const handleClearComments = async () => {
    Alert.alert(
      '🗑️ Clear All Comments',
      'Are you sure you want to delete all comments from all posts? This cannot be undone.',
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
                result.success ? '✅ Success' : '❌ Error',
                result.message
              );
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to clear comments');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🔥 Firestore Comments Setup</Text>
          <Text style={styles.subtitle}>
            Create and manage comments subcollections in your Firestore database
          </Text>
        </View>

        {/* Main Setup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Database Setup</Text>
          <Text style={styles.sectionDescription}>
            Set up the comments subcollection structure in your Firestore database
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleCompleteSetup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Setting up...' : '🎯 Complete Setup (Recommended)'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>
            Runs the complete setup process with structure initialization and sample data
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleQuickSetup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : '⚡ Quick Batch Setup'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>
            Creates subcollections for all posts with sample comments (faster)
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.structureButton]}
            onPress={handleStructureInit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Initializing...' : '🔧 Structure Only'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>
            Creates basic subcollection structure without sample data
          </Text>
        </View>

        {/* Demo Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Demo Data</Text>
          <Text style={styles.sectionDescription}>
            Add or remove sample comments for testing
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={handleCreateDemoComments}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : '➕ Create Demo Comments'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearComments}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Clearing...' : '🗑️ Clear All Comments'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Processing Firestore operations...</Text>
            <Text style={styles.loadingSubtext}>This may take a few moments</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📋 Setup Instructions</Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>1. Initial Setup:</Text>{"\n"}
            • Run "Complete Setup" for first-time database setup{"\n"}
            • This creates the subcollection structure in Firestore{"\n\n"}
            
            <Text style={styles.boldText}>2. Verify Setup:</Text>{"\n"}
            • Open your Firestore console{"\n"}
            • Navigate to the 'posts' collection{"\n"}
            • Check that each post document has a 'comments' subcollection{"\n\n"}
            
            <Text style={styles.boldText}>3. Test the System:</Text>{"\n"}
            • Go to your app's HomeScreen{"\n"}
            • Tap the comment button on any post{"\n"}
            • Try adding comments and replies{"\n"}
            • Test real-time updates{"\n\n"}
            
            <Text style={styles.boldText}>🏗️ Database Structure Created:</Text>{"\n"}
            📁 posts/{"\n"}
            {"  "}📄 {"{postId}"} (existing post document){"\n"}
            {"    "}📁 comments/ (new subcollection){"\n"}
            {"      "}📄 {"{commentId}"} - comment document{"\n"}
            {"        "}• userId: string{"\n"}
            {"        "}• userName: string{"\n"}
            {"        "}• commentText: string{"\n"}
            {"        "}• parentCommentId: string | null{"\n"}
            {"        "}• likeCount: number{"\n"}
            {"        "}• createdAt: Timestamp{"\n"}
            {"        "}• updatedAt: Timestamp
          </Text>
        </View>

        {/* Status Info */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>🔍 Current Status</Text>
          <Text style={styles.statusText}>
            • User: {user?.name || user?.username || 'Not logged in'}{"\n"}
            • Database: {loading ? 'Processing...' : 'Ready for setup'}
          </Text>
        </View>

        {/* Integration Test Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔬 Integration Testing</Text>
          <Text style={styles.sectionDescription}>
            Test the enhanced Firestore integration for comments system
          </Text>
          <CommentsIntegrationTest />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 22,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
  },
  secondaryButton: {
    backgroundColor: '#10B981',
  },
  structureButton: {
    backgroundColor: '#8B5CF6',
  },
  successButton: {
    backgroundColor: '#059669',
  },
  dangerButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    marginTop: -8,
    paddingHorizontal: 4,
    lineHeight: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#EFF6FF',
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '600',
  },
  statusContainer: {
    padding: 20,
    backgroundColor: '#F0FDF4',
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
});