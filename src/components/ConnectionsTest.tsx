import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { connectionsService } from '../services/connectionsService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const ConnectionsTest: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [connectionsData, setConnectionsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testGetConnections = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setLoading(true);
    try {
      const data = await connectionsService.getConnectionsCount(user.id);
      setConnectionsData(data);
      Alert.alert('Success', `Connections: ${data.connections}`);
    } catch (error) {
      console.error('Error testing connections:', error);
      Alert.alert('Error', 'Failed to get connections count');
    } finally {
      setLoading(false);
    }
  };

  const testNavigateToConnections = () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    const initialTab = connectionsData && connectionsData.connections === 0 ? 'suggestions' : 'followers';
    navigation.navigate('Connections', {
      userId: user.id,
      userName: user.name,
      initialTab,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connections Test</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={testGetConnections}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Get Connections Count'}
        </Text>
      </TouchableOpacity>

      {connectionsData && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Connections: {connectionsData.connections}
          </Text>
          <Text style={styles.resultText}>
            Source: {connectionsData.source || 'API'}
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, styles.navButton]} 
        onPress={testNavigateToConnections}
      >
        <Text style={styles.buttonText}>Navigate to Connections</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 6,
    marginVertical: 5,
  },
  navButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  result: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    marginVertical: 10,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 2,
  },
});

export default ConnectionsTest;