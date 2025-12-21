import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.container}>
      <View style={styles.content}>
        {/* Illustration/Logo Area */}
        <View style={styles.illustrationContainer}>
          {/* You can replace this with an actual illustration/logo */}
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>Clique</Text>
          </View>
          <Text style={styles.appName}>Clique!</Text>
          <Text style={styles.tagline}>
            Where every thought finds a home and{'\n'}every image tells a story.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('Registration' as never)}
          >
            <Text style={styles.getStartedText}>Getting Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLinkContainer}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.loginLinkText}>
              Already have an account! <Text style={styles.loginText}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#10B981',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLinkContainer: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loginText: {
    color: '#10B981',
    fontWeight: '600',
  },
});