import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import global styles
import './global.css';

// Import providers and screens
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { testFirebaseConnection } from './src/utils/firebaseTest';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Test Firebase connection on app startup
    const runFirebaseTest = async () => {
      const isConnected = await testFirebaseConnection();
      if (!isConnected) {
        console.warn('🚨 Firebase connection issues detected. App may work in limited mode.');
      }
    };
    
    runFirebaseTest();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor="#FFFFFF" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
