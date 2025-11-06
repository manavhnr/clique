import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthUser } from '../types/auth';
import { authService } from '../services/authService';

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

  useEffect(() => {
    // Load user from secure storage on app start
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      setIsLoading(true);
      const storedUser = await SecureStore.getItemAsync('hyn_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load stored user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserExists = async (phoneNumber: string) => {
    return await authService.checkUserExists(phoneNumber);
  };

  const sendLoginOTP = async (phoneNumber: string) => {
    const userCheck = await authService.checkUserExists(phoneNumber);
    if (!userCheck.exists) {
      return {
        success: false,
        message: 'No account found with this phone number. Please create an account first.'
      };
    }
    return await authService.sendOTP(phoneNumber);
  };

  const sendRegistrationOTP = async (phoneNumber: string) => {
    const userCheck = await authService.checkUserExists(phoneNumber);
    if (userCheck.exists) {
      return {
        success: false,
        message: 'An account already exists with this phone number. Please login instead.'
      };
    }
    return await authService.sendOTP(phoneNumber);
  };

  const verifyLoginOTP = async (phoneNumber: string, otp: string) => {
    const result = await authService.verifyOTPAndSignIn(phoneNumber, otp);
    
    if (result.success && result.user) {
      setUser(result.user);
      // Store user securely
      await SecureStore.setItemAsync('hyn_user', JSON.stringify(result.user));
    }
    
    return {
      success: result.success,
      message: result.message
    };
  };

  const verifyRegistrationOTP = async (phoneNumber: string, otp: string) => {
    // Just verify OTP for registration, don't create user yet
    const result = await authService.verifyOTPAndSignIn(phoneNumber, otp);
    return {
      success: result.success,
      message: result.message,
      tempUser: result.user
    };
  };

  // Legacy methods for backward compatibility
  const sendOTP = async (phoneNumber: string) => {
    return await authService.sendOTP(phoneNumber);
  };

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    const result = await authService.verifyOTPAndSignIn(phoneNumber, otp);
    
    if (result.success && result.user) {
      setUser(result.user);
      // Store user securely
      await SecureStore.setItemAsync('hyn_user', JSON.stringify(result.user));
    }
    
    return {
      success: result.success,
      message: result.message
    };
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('hyn_user');
  };

  const registerWithPassword = async (data: RegistrationData) => {
    try {
      // Create user using authService
      const result = await authService.createUserWithPassword(
        data.email,
        data.password,
        data.name,
        data.username
      );

      if (!result.success) {
        return {
          success: false,
          message: result.message
        };
      }

      // Convert to AuthUser format
      const newUser: AuthUser = {
        id: result.user.id,
        phoneNumber: result.user.phone_number || '',
        email: result.user.email,
        username: result.user.username,
        name: result.user.name,
        isProfileComplete: true,
        isVerified: true,
        isHost: false,
        createdAt: result.user.created_at,
      };

      // Store user securely
      setUser(newUser);
      await SecureStore.setItemAsync('hyn_user', JSON.stringify(newUser));

      return { success: true, message: result.message };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: 'Failed to create account. Please try again.' };
    }
  };

  const loginWithPassword = async (data: LoginData) => {
    try {
      // Use authService to login with password
      const result = await authService.loginWithPassword(
        data.emailOrUsername,
        data.password
      );

      if (!result.success) {
        return {
          success: false,
          message: result.message
        };
      }

      // Convert to AuthUser format
      const loggedInUser: AuthUser = {
        id: result.user.id,
        phoneNumber: result.user.phone_number || '',
        email: result.user.email,
        username: result.user.username,
        name: result.user.name,
        isProfileComplete: true,
        isVerified: true,
        isHost: result.user.is_host || false,
        createdAt: result.user.created_at,
      };

      // Store user securely
      setUser(loggedInUser);
      await SecureStore.setItemAsync('hyn_user', JSON.stringify(loggedInUser));

      return { success: true, message: result.message };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: 'Failed to login. Please try again.' };
    }
  };

  const completeRegistration = async (data: CompleteRegistrationData, phoneNumber: string) => {
    try {
      // Create new user with profile information
      const newUser: AuthUser = {
        id: `demo-${phoneNumber?.replace(/\D/g, '') || Date.now()}`,
        phoneNumber: phoneNumber || user?.phoneNumber || '',
        username: data.username,
        name: data.name,
        age: data.age,
        city: data.city,
        email: data.email,
        socialActivityLevel: data.socialActivityLevel,
        isProfileComplete: true,
        isVerified: true,
        isHost: false,
        createdAt: new Date().toISOString(),
      };

      // Store updated user
      setUser(newUser);
      await SecureStore.setItemAsync('hyn_user', JSON.stringify(newUser));

      return { success: true, message: 'Registration completed successfully' };
    } catch (error) {
      console.error('Registration completion failed:', error);
      return { success: false, message: 'Failed to complete registration' };
    }
  };

  const becomeHost = async () => {
    if (!user) {
      return { success: false, message: 'User not logged in' };
    }

    const result = await authService.becomeHost(user.id);
    
    if (result.success) {
      const updatedUser = { ...user, isHost: true };
      setUser(updatedUser);
      await SecureStore.setItemAsync('hyn_user', JSON.stringify(updatedUser));
    }
    
    return result;
  };

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