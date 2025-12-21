import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { firestoreSetup } from '../services/firestoreSetupService';

interface SchemaStatus {
  isInitializing: boolean;
  isVerifying: boolean;
  results: {
    success: boolean;
    collections: string[];
    missing: string[];
  } | null;
  error: string | null;
}

export const FirestoreSetupScreen: React.FC = () => {
  const [status, setStatus] = useState<SchemaStatus>({
    isInitializing: false,
    isVerifying: false,
    results: null,
    error: null
  });

  const handleInitializeSchemas = async () => {
    setStatus(prev => ({ ...prev, isInitializing: true, error: null }));
    
    try {
      console.log('🚀 Starting schema initialization...');
      await firestoreSetup.initializeAllSchemas();
      
      // Verify the schemas were created
      const verification = await firestoreSetup.verifySchemas();
      
      setStatus({
        isInitializing: false,
        isVerifying: false,
        results: verification,
        error: null
      });

      if (verification.success) {
        Alert.alert(
          'Success! 🎉',
          `All ${verification.collections.length} database collections have been created successfully.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Partial Success ⚠️',
          `${verification.collections.length} collections created, but ${verification.missing.length} are missing.`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Failed to initialize schemas:', error);
      setStatus(prev => ({
        ...prev,
        isInitializing: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
      
      Alert.alert(
        'Error ❌',
        'Failed to initialize database schemas. Check the console for details.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleVerifySchemas = async () => {
    setStatus(prev => ({ ...prev, isVerifying: true, error: null }));
    
    try {
      const verification = await firestoreSetup.verifySchemas();
      
      setStatus(prev => ({
        ...prev,
        isVerifying: false,
        results: verification
      }));
      
    } catch (error) {
      console.error('Failed to verify schemas:', error);
      setStatus(prev => ({
        ...prev,
        isVerifying: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const handleShowIndexes = async () => {
    try {
      await firestoreSetup.createIndexes();
      Alert.alert(
        'Index Requirements 📋',
        'Check the console for detailed index requirements. You\'ll need to create these in Firebase Console for optimal performance.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to generate index requirements:', error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          🗄️ Database Setup
        </Text>
        <Text className="text-gray-600 mb-4">
          Initialize all Firestore collections and schemas for your Clique app.
        </Text>
        
        {/* Initialize Button */}
        <TouchableOpacity
          onPress={handleInitializeSchemas}
          disabled={status.isInitializing}
          className={`rounded-lg p-4 mb-3 ${
            status.isInitializing 
              ? 'bg-gray-300' 
              : 'bg-purple-600'
          }`}
        >
          <Text className={`text-center font-semibold ${
            status.isInitializing ? 'text-gray-500' : 'text-white'
          }`}>
            {status.isInitializing ? '🔄 Initializing...' : '🚀 Initialize All Schemas'}
          </Text>
        </TouchableOpacity>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerifySchemas}
          disabled={status.isVerifying}
          className={`rounded-lg p-4 mb-3 ${
            status.isVerifying 
              ? 'bg-gray-300' 
              : 'bg-blue-600'
          }`}
        >
          <Text className={`text-center font-semibold ${
            status.isVerifying ? 'text-gray-500' : 'text-white'
          }`}>
            {status.isVerifying ? '🔍 Verifying...' : '🔍 Verify Schemas'}
          </Text>
        </TouchableOpacity>

        {/* Show Indexes Button */}
        <TouchableOpacity
          onPress={handleShowIndexes}
          className="rounded-lg p-4 bg-green-600"
        >
          <Text className="text-center font-semibold text-white">
            📋 Show Index Requirements
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {status.error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <Text className="text-red-800 font-semibold mb-2">❌ Error</Text>
          <Text className="text-red-600">{status.error}</Text>
        </View>
      )}

      {/* Results Display */}
      {status.results && (
        <View className="bg-white rounded-lg p-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            📊 Schema Status
          </Text>
          
          <View className="flex-row items-center mb-3">
            <Text className={`text-lg font-semibold ${
              status.results.success ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {status.results.success ? '✅ All Good!' : '⚠️ Partial'}
            </Text>
            <Text className="text-gray-600 ml-2">
              {status.results.collections.length} collections created
            </Text>
          </View>

          {status.results.missing.length > 0 && (
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <Text className="text-yellow-800 font-semibold mb-2">
                ⚠️ Missing Collections ({status.results.missing.length})
              </Text>
              {status.results.missing.map((collection, index) => (
                <Text key={index} className="text-yellow-700 text-sm">
                  • {collection}
                </Text>
              ))}
            </View>
          )}

          <View className="bg-green-50 border border-green-200 rounded-lg p-4">
            <Text className="text-green-800 font-semibold mb-2">
              ✅ Created Collections ({status.results.collections.length})
            </Text>
            <ScrollView className="max-h-48">
              {status.results.collections.map((collection, index) => (
                <Text key={index} className="text-green-700 text-sm">
                  • {collection}
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Information Panel */}
      <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <Text className="text-blue-800 font-semibold mb-2">ℹ️ Information</Text>
        <Text className="text-blue-700 text-sm mb-2">
          • This will create all database collections for your Clique app
        </Text>
        <Text className="text-blue-700 text-sm mb-2">
          • Sample/template documents will be added to each collection
        </Text>
        <Text className="text-blue-700 text-sm mb-2">
          • You'll need to create indexes manually in Firebase Console
        </Text>
        <Text className="text-blue-700 text-sm">
          • This is safe to run multiple times - existing data won't be overwritten
        </Text>
      </View>
    </ScrollView>
  );
};

export default FirestoreSetupScreen;