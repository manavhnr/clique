import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function LoginScreen() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { loginWithPassword } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  const validateForm = (): boolean => {
    if (!emailOrUsername.trim()) {
      Alert.alert('Error', 'Please enter your email or username');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await loginWithPassword({
        emailOrUsername: emailOrUsername.trim(),
        password: password.trim(),
      });

      if (result.success) {
        Alert.alert('Success', 'Login successful!');
        // Navigation will be handled by AuthContext
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F9FAFB', '#F3F4F6']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <Text style={styles.logo}>HYN</Text>
            <Text style={styles.subtitle}>Host Your Night</Text>
            <Text style={styles.loginTitle}>Login to Your Account</Text>
            <Text style={styles.description}>
              Welcome back! Enter your phone number to continue
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            {/* Email or Username Input */}
            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              style={styles.input}
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              placeholder="Enter your email or username"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
            />

            {/* Password Input */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoComplete="password"
              autoCapitalize="none"
            />
            
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            {/* Create Account Link */}
            <TouchableOpacity
              style={styles.createAccountLink}
              onPress={() => navigation.navigate('Registration' as never)}
              disabled={isLoading}
            >
              <Text style={styles.createAccountText}>
                Don't have an account? <Text style={styles.createAccountButton}>Create Account</Text>
              </Text>
            </TouchableOpacity>
          </View>


        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#000000',
    marginBottom: 8,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
  },
  resendText: {
    color: '#000000',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  otpMessage: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  demoInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  demoText: {
    color: '#000000',
    fontSize: 14,
    textAlign: 'center',
  },
  createAccountLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  createAccountText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  createAccountButton: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});