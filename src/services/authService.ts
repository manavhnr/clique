import { AuthUser } from '../types/auth';

// Mock data for demo mode
const mockUsers = [
  {
    id: 'demo-user-1',
    phone_number: '+1234567890',
    is_verified: true,
    is_host: false,
    created_at: new Date().toISOString(),
    username: 'demo_user',
    name: 'Demo User',
    age: 25,
    city: 'San Francisco',
    email: 'demo@example.com',
    socialActivityLevel: 'frequently',
    isProfileComplete: true,
    password: 'password123',
  },
  {
    id: 'demo-host-1',
    phone_number: '+1987654321', 
    is_verified: true,
    is_host: true,
    created_at: new Date().toISOString(),
    username: 'demo_host',
    name: 'Demo Host',
    age: 30,
    city: 'Los Angeles',
    email: 'host@example.com',
    socialActivityLevel: 'very_frequently',
    isProfileComplete: true,
    password: 'hostpass456',
  }
];

// In-memory OTP storage for demo mode
const otpStorage = new Map<string, { otp: string; timestamp: number; attempts: number }>();

// Clean up expired OTPs
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  otpStorage.forEach((data, phoneNumber) => {
    if (now - data.timestamp > 5 * 60 * 1000) { // 5 minutes
      otpStorage.delete(phoneNumber);
    }
  });
};

setInterval(cleanupExpiredOTPs, 60 * 1000); // Cleanup every minute

export const authService = {
  // Check if user exists by phone number
  async checkUserExists(phoneNumber: string): Promise<{ exists: boolean; userData?: any }> {
    try {
      const existingUser = mockUsers.find(u => u.phone_number === phoneNumber);
      return {
        exists: !!existingUser,
        userData: existingUser
      };
    } catch (error) {
      console.error('Check user exists error:', error);
      return { exists: false };
    }
  },

  // Create user with password (demo mode)
  async createUserWithPassword(email: string, password: string, name: string, username: string): Promise<{ success: boolean; user?: any; message: string }> {
    try {
      // Check if user already exists by email
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        return {
          success: false,
          message: 'An account already exists with this email address. Please login instead.'
        };
      }

      // Create new user
      const newUser = {
        id: `demo-${email.replace(/\W/g, '')}-${Date.now()}`,
        phone_number: '',
        is_verified: true,
        is_host: false,
        created_at: new Date().toISOString(),
        username: username,
        name: name,
        age: 0,
        city: '',
        email: email,
        socialActivityLevel: '',
        isProfileComplete: true,
        password: password, // In real app, this would be hashed
      };

      mockUsers.push(newUser);

      console.log(`✅ Demo Mode: User created successfully for ${email}`);

      return {
        success: true,
        user: newUser,
        message: 'Account created successfully!'
      };

    } catch (error) {
      console.error('Create user error:', error);
      return {
        success: false,
        message: 'Failed to create account. Please try again.'
      };
    }
  },

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // For demo mode, just log the OTP
      console.log(`🔐 Demo Mode OTP for ${phoneNumber}: ${otp}`);
      
      // Store OTP for verification
      otpStorage.set(phoneNumber, {
        otp,
        timestamp: Date.now(),
        attempts: 0
      });

      return {
        success: true,
        message: `Demo Mode: OTP sent to ${phoneNumber}. Check console for OTP code.`
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  },

  // Verify OTP and sign in/sign up
  async verifyOTPAndSignIn(phoneNumber: string, otp: string): Promise<{ success: boolean; user?: AuthUser; message: string }> {
    try {
      const storedData = otpStorage.get(phoneNumber);

      if (!storedData) {
        return {
          success: false,
          message: 'OTP not found or expired. Please request a new one.'
        };
      }

      // Check if OTP is expired (5 minutes)
      const now = Date.now();
      if (now - storedData.timestamp > 5 * 60 * 1000) {
        otpStorage.delete(phoneNumber);
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Check attempts
      if (storedData.attempts >= 3) {
        otpStorage.delete(phoneNumber);
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.'
        };
      }

      // Verify OTP
      if (storedData.otp !== otp) {
        storedData.attempts += 1;
        return {
          success: false,
          message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.`
        };
      }

      // OTP is valid - remove from storage
      otpStorage.delete(phoneNumber);

      // Find or create user (demo mode)
      let mockUser = mockUsers.find(u => u.phone_number === phoneNumber);
      
      if (!mockUser) {
        // For registration flow, create a basic user without profile data
        mockUser = {
          id: `demo-${phoneNumber.replace(/\D/g, '')}`,
          phone_number: phoneNumber,
          is_verified: true,
          is_host: false,
          created_at: new Date().toISOString(),
          username: '',
          name: '',
          age: 0,
          city: '',
          email: '',
          socialActivityLevel: '',
          isProfileComplete: false,
          password: '', // Default empty password for OTP users
        };
        mockUsers.push(mockUser);
      }

      const user: AuthUser = {
        id: mockUser.id,
        phoneNumber: mockUser.phone_number,
        isVerified: mockUser.is_verified,
        isHost: mockUser.is_host,
        createdAt: mockUser.created_at,
        username: mockUser.username || undefined,
        name: mockUser.name || undefined,
        age: mockUser.age || undefined,
        city: mockUser.city || undefined,
        email: mockUser.email || undefined,
        socialActivityLevel: (mockUser.socialActivityLevel as 'rarely' | 'occasionally' | 'frequently' | 'very_frequently') || undefined,
        isProfileComplete: mockUser.isProfileComplete || false,
      };

      return {
        success: true,
        user,
        message: 'OTP verified successfully (Demo Mode)'
      };

    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  },

  // Make user a host
  async becomeHost(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find user in mock data
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return { success: false, message: 'User not found' };
      }

      // Update user to host
      mockUsers[userIndex].is_host = true;

      return {
        success: true,
        message: 'You are now a host! You can create and manage events.'
      };
    } catch (error) {
      console.error('Become host error:', error);
      return {
        success: false,
        message: 'Failed to become host. Please try again.'
      };
    }
  },

  // Login with email/username and password
  async loginWithPassword(emailOrUsername: string, password: string): Promise<{ success: boolean; user?: any; message: string }> {
    try {
      // Find user by email or username
      const existingUser = mockUsers.find(u => 
        u.email === emailOrUsername || u.username === emailOrUsername
      );
      
      if (!existingUser) {
        return {
          success: false,
          message: 'No account found with this email or username.'
        };
      }

      // Check password (in real app, this would be hashed comparison)
      if (existingUser.password !== password) {
        return {
          success: false,
          message: 'Invalid password. Please try again.'
        };
      }

      console.log(`✅ Demo Mode: User logged in successfully: ${emailOrUsername}`);

      return {
        success: true,
        user: existingUser,
        message: 'Login successful!'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Failed to login. Please try again.'
      };
    }
  }
};