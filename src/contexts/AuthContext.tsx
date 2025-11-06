import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { 
  User,
  onAuthStateChanged, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { AuthUser } from '../types/auth';

// Connection state management
let isFirebaseConnected = true;

interface RegistrationData {
  username: string;
  name: string;
  email: string;
  password: string;
}

interface CompleteRegistrationData {
  username: string;
  name: string;
  age: number;
  city: string;
  email: string;
  socialActivityLevel: 'rarely' | 'occasionally' | 'frequently' | 'very_frequently';
}

interface LoginData {
  emailOrUsername: string;
  password: string;
}

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  name?: string;
  age?: number;
  city?: string;
  phoneNumber?: string;
  socialActivityLevel?: 'rarely' | 'occasionally' | 'frequently' | 'very_frequently';
  isHost: boolean;
  isProfileComplete: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  checkUserExists: (phoneNumber: string) => Promise<{ exists: boolean; userData?: any }>;
  registerWithPassword: (data: RegistrationData) => Promise<{ success: boolean; message: string }>;
  loginWithPassword: (data: LoginData) => Promise<{ success: boolean; message: string }>;
  sendLoginOTP: (phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  sendRegistrationOTP: (phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  verifyLoginOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; message: string }>;
  verifyRegistrationOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; message: string; tempUser?: any }>;
  completeRegistration: (data: CompleteRegistrationData, phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  becomeHost: () => Promise<{ success: boolean; message: string }>;
  // Legacy methods for backward compatibility
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        // User is signed in
        try {
          const userProfile = await loadUserProfile(firebaseUser.uid);
          const authUser: AuthUser = {
            id: firebaseUser.uid,
            phoneNumber: firebaseUser.phoneNumber || userProfile?.phoneNumber || '',
            email: firebaseUser.email || userProfile?.email || '',
            username: userProfile?.username,
            name: userProfile?.name || firebaseUser.displayName || undefined,
            age: userProfile?.age,
            city: userProfile?.city,
            socialActivityLevel: userProfile?.socialActivityLevel,
            isProfileComplete: userProfile?.isProfileComplete ?? false,
            isVerified: firebaseUser.emailVerified || !!firebaseUser.phoneNumber,
            isHost: userProfile?.isHost ?? false,
            createdAt: userProfile?.createdAt || firebaseUser.metadata.creationTime || new Date().toISOString(),
          };
          setUser(authUser);
          isFirebaseConnected = true;
        } catch (error) {
          console.warn('Failed to load full user profile, using basic auth data:', error);
          // Fallback to basic Firebase Auth data if Firestore is unavailable
          const basicAuthUser: AuthUser = {
            id: firebaseUser.uid,
            phoneNumber: firebaseUser.phoneNumber || '',
            email: firebaseUser.email || '',
            username: undefined,
            name: firebaseUser.displayName || undefined,
            isProfileComplete: false,
            isVerified: firebaseUser.emailVerified || !!firebaseUser.phoneNumber,
            isHost: false,
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
          };
          setUser(basicAuthUser);
          isFirebaseConnected = false;
        }
      } else {
        // User is signed out
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error: any) {
      console.error('Error loading user profile:', error);
      
      // Handle offline scenarios gracefully
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        console.warn('🔄 Firestore is offline, will retry when connection is restored');
        // Return null for now, auth state will be managed by Firebase Auth
        return null;
      }
      
      // For other errors, still return null but log for debugging
      return null;
    }
  };

  const createUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
    try {
      await setDoc(doc(db, 'users', userId), {
        id: userId,
        isHost: false,
        isProfileComplete: false,
        createdAt: new Date().toISOString(),
        ...data,
      });
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      
      // Handle offline scenarios
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        console.warn('🔄 User profile creation will be retried when online');
        // Firebase will automatically retry when connection is restored
        throw new Error('Profile creation queued for when connection is restored');
      }
      
      throw error;
    }
  };

  const checkUserExists = async (phoneNumber: string): Promise<{ exists: boolean; userData?: any }> => {
    try {
      // For phone number check, we'll use Firebase Auth and Firestore
      // This is a simplified implementation - in production you'd want better phone number validation
      return { exists: false }; // Always return false for now since we'll handle this in the auth flow
    } catch (error) {
      console.error('Check user exists error:', error);
      return { exists: false };
    }
  };

  const registerWithPassword = async (data: RegistrationData): Promise<{ success: boolean; message: string }> => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: data.name
      });

      // Create user profile in Firestore (with offline handling)
      try {
        await createUserProfile(firebaseUser.uid, {
          id: firebaseUser.uid,
          email: data.email,
          username: data.username,
          name: data.name,
          isHost: false,
          isProfileComplete: true,
        });
      } catch (profileError: any) {
        // If profile creation fails due to offline, user can still proceed
        // Profile will be created when connection is restored
        console.warn('Profile creation queued for later:', profileError.message);
      }

      return { success: true, message: 'Account created successfully!' };
    } catch (error: any) {
      console.error('Registration failed:', error);
      let message = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account already exists with this email address.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection and try again.';
      }
      
      return { success: false, message };
    }
  };

  const loginWithPassword = async (data: LoginData): Promise<{ success: boolean; message: string }> => {
    try {
      // For simplicity, assuming emailOrUsername is always email
      // In production, you'd want to handle username lookup via Firestore
      await signInWithEmailAndPassword(auth, data.emailOrUsername, data.password);
      return { success: true, message: 'Login successful!' };
    } catch (error: any) {
      console.error('Login failed:', error);
      let message = 'Failed to login. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Invalid password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again later.';
      }
      
      return { success: false, message };
    }
  };

  const sendLoginOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Note: Phone auth in Expo requires additional setup for production
      // For now, we'll use a demo implementation
      console.log(`📱 Demo Mode: Sending OTP to ${phoneNumber}`);
      return {
        success: true,
        message: 'OTP sent successfully (Demo Mode)'
      };
    } catch (error) {
      console.error('Send login OTP error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  };

  const sendRegistrationOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`📱 Demo Mode: Sending registration OTP to ${phoneNumber}`);
      return {
        success: true,
        message: 'OTP sent successfully (Demo Mode)'
      };
    } catch (error) {
      console.error('Send registration OTP error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  };

  const verifyLoginOTP = async (phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Demo implementation
      if (otp === '123456') {
        return { success: true, message: 'OTP verified successfully (Demo Mode)' };
      }
      return { success: false, message: 'Invalid OTP. Please try again.' };
    } catch (error) {
      console.error('Verify login OTP error:', error);
      return { success: false, message: 'Failed to verify OTP. Please try again.' };
    }
  };

  const verifyRegistrationOTP = async (phoneNumber: string, otp: string): Promise<{ success: boolean; message: string; tempUser?: any }> => {
    try {
      // Demo implementation
      if (otp === '123456') {
        return { 
          success: true, 
          message: 'OTP verified successfully (Demo Mode)',
          tempUser: { phoneNumber }
        };
      }
      return { success: false, message: 'Invalid OTP. Please try again.' };
    } catch (error) {
      console.error('Verify registration OTP error:', error);
      return { success: false, message: 'Failed to verify OTP. Please try again.' };
    }
  };

  const completeRegistration = async (data: CompleteRegistrationData, phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!auth.currentUser) {
        return { success: false, message: 'No authenticated user found' };
      }

      // Update user profile in Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        username: data.username,
        name: data.name,
        age: data.age,
        city: data.city,
        email: data.email,
        phoneNumber: phoneNumber,
        socialActivityLevel: data.socialActivityLevel,
        isProfileComplete: true,
      });

      return { success: true, message: 'Registration completed successfully' };
    } catch (error) {
      console.error('Registration completion failed:', error);
      return { success: false, message: 'Failed to complete registration' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const becomeHost = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!auth.currentUser) {
        return { success: false, message: 'User not logged in' };
      }

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isHost: true,
      });

      return {
        success: true,
        message: 'You are now a host! You can create and manage events.'
      };
    } catch (error: any) {
      console.error('Become host error:', error);
      
      let message = 'Failed to become host. Please try again.';
      
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        message = 'Network error. Please check your connection and try again.';
      }
      
      return {
        success: false,
        message
      };
    }
  };

  // Legacy methods for backward compatibility
  const sendOTP = sendLoginOTP;
  const verifyOTP = verifyLoginOTP;

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      checkUserExists,
      registerWithPassword,
      loginWithPassword,
      sendLoginOTP,
      sendRegistrationOTP,
      verifyLoginOTP,
      verifyRegistrationOTP,
      completeRegistration,
      logout,
      becomeHost,
      // Legacy methods for backward compatibility
      sendOTP,
      verifyOTP
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}