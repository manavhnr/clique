import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { createTestUsers } from '../utils/createTestUsers';

const FirestoreConnectionsTest: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testCreateUsers = async () => {
    setLoading(true);
    try {
      const success = await createTestUsers();
      if (success) {
        addTestResult('✅ Test users created successfully!');
        addTestResult('🔄 Now try "Fetch All Users" to see them');
      } else {
        addTestResult('❌ Failed to create test users');
      }
    } catch (error) {
      console.error('Error creating test users:', error);
      addTestResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testFetchUsers = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setLoading(true);
    try {
      // Fetch all users except current user
      const usersQuery = query(
        collection(db, 'users'),
        where('uid', '!=', user.id)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      addTestResult(`✅ Found ${usersSnapshot.docs.length} users`);
      usersSnapshot.docs.forEach((doc, index) => {
        const userData = doc.data();
        addTestResult(`${index + 1}. ${userData.name} (@${userData.username})`);
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      addTestResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testFetchFollows = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setLoading(true);
    try {
      // Fetch current user's following
      const followingQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', user.id)
      );
      const followingSnapshot = await getDocs(followingQuery);
      
      addTestResult(`✅ Following: ${followingSnapshot.docs.length} users`);
      
      // Fetch current user's followers
      const followersQuery = query(
        collection(db, 'follows'),
        where('followingId', '==', user.id)
      );
      const followersSnapshot = await getDocs(followersQuery);
      
      addTestResult(`✅ Followers: ${followersSnapshot.docs.length} users`);
    } catch (error) {
      console.error('Error fetching follows:', error);
      addTestResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateFollow = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    // First, get a random user to follow
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('uid', '!=', user.id)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.docs.length === 0) {
        addTestResult('❌ No users found to follow');
        return;
      }

      const randomUser = usersSnapshot.docs[0].data();
      
      // Create follow relationship
      await addDoc(collection(db, 'follows'), {
        followerId: user.id,
        followingId: randomUser.uid,
        createdAt: serverTimestamp()
      });

      addTestResult(`✅ Successfully followed ${randomUser.name}`);
    } catch (error) {
      console.error('Error creating follow:', error);
      addTestResult(`❌ Error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Firestore Connections Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.setupButton]} 
          onPress={testCreateUsers}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            Create Test Users
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={testFetchUsers}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Fetch All Users'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={testFetchFollows}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            Check Follow Status
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.followButton]} 
          onPress={testCreateFollow}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            Test Follow Action
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    margin: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#495057',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  followButton: {
    backgroundColor: '#10B981',
  },
  setupButton: {
    backgroundColor: '#F59E0B',
  },
  clearButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    maxHeight: 300,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#343a40',
  },
  resultText: {
    fontSize: 13,
    marginBottom: 4,
    color: '#495057',
    fontFamily: 'monospace',
  },
});

export default FirestoreConnectionsTest;