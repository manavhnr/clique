import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestoreSetup } from './src/services/firestoreSetupService';

export default function TestButtons() {
  const [isInitializingDB, setIsInitializingDB] = useState(false);

  const handleEditPress = () => {
    console.log('Edit Profile button pressed');
    Alert.alert('Button Pressed', 'Edit Profile button works!');
  };

  const handleHostPress = () => {
    console.log('Host Dashboard button pressed');
    Alert.alert('Button Pressed', 'Host Dashboard button works!');
  };

  const handleInitializeDatabase = async () => {
    setIsInitializingDB(true);
    
    try {
      console.log('🚀 Starting database initialization...');
      
      // Initialize all schemas
      await firestoreSetup.initializeAllSchemas();
      
      // Verify schemas were created
      const verification = await firestoreSetup.verifySchemas();
      
      if (verification.success) {
        Alert.alert(
          'Database Setup Complete! 🎉',
          `Successfully created ${verification.collections.length} database collections for your Clique app.\n\nCheck Firebase Console to see your collections.`,
          [{ text: 'Awesome!' }]
        );
      } else {
        Alert.alert(
          'Setup Partially Complete ⚠️',
          `Created ${verification.collections.length} collections, but ${verification.missing.length} are missing.\n\nMissing: ${verification.missing.join(', ')}`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Database setup failed:', error);
      Alert.alert(
        'Setup Failed ❌',
        'Could not initialize database schemas. Check the console for details.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsInitializingDB(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Button Test</Text>
      
      {/* Test Split Buttons */}
      <View style={styles.buttonRow}>
        {/* Edit Profile Button - Left Half */}
        <TouchableOpacity 
          style={styles.editButtonHalf}
          onPress={handleEditPress}
        >
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        {/* Host Dashboard Button - Right Half */}
        <TouchableOpacity 
          style={styles.hostDashboardButtonHalf}
          onPress={handleHostPress}
        >
          <Ionicons name="business-outline" size={20} color="#FFFFFF" />
          <Text style={styles.hostDashboardButtonText}>Host Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* Test Individual Buttons */}
      <TouchableOpacity style={styles.testButton} onPress={handleEditPress}>
        <Text style={styles.testButtonText}>Test Edit Button</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={handleHostPress}>
        <Text style={styles.testButtonText}>Test Host Button</Text>
      </TouchableOpacity>

      {/* Database Setup Button */}
      <TouchableOpacity 
        style={[styles.databaseButton, isInitializingDB && styles.disabledButton]} 
        onPress={handleInitializeDatabase}
        disabled={isInitializingDB}
      >
        <View style={styles.buttonContent}>
          {isInitializingDB ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="server-outline" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.databaseButtonText}>
            {isInitializingDB ? 'Setting Up Database...' : '🗄️ Initialize Database Schemas'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 40,
  },
  editButtonHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 4,
  },
  hostDashboardButtonHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  hostDashboardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  testButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  databaseButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  databaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});