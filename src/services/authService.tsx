import { AuthUser } from '../types/auth';

// Mock data for demo mode
const mockUsers = [
  {
    id: 'demo-user-1',
    phone_number: '+1234567890',
    is_verified: true,
    is_host: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-user-2',
    phone_number: '+0987654321',
    is_verified: true,
    is_host: true,
    created_at: new Date().toISOString(),
  },
];

// In-memory OTP storage for demo mode
const otpStorage = new Map<string, { otp: string; timestamp: number; attempts: number }>();

// Clean up expired OTPs
const cleanupOTPs = () => {
  const now = Date.now();
  otpStorage.forEach((data, phoneNumber) => {
    if (now - data.timestamp > 5 * 60 * 1000) { // 5 minutes
      otpStorage.delete(phoneNumber);
    }
  });
};

setInterval(cleanupOTPs, 60000); // Clean up every minute

export const authService = {
  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP for verification
      otpStorage.set(phoneNumber, {
        otp,
        timestamp: Date.now(),
        attempts: 0
      });

      // For demo mode, log OTP to console
      console.log(`🔐 Demo Mode OTP for ${phoneNumber}: ${otp}`);
      
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
  async verifyOTPAndSignIn(phoneNumber: string, otp: string): Promise<{ 
    success: boolean; 
    user?: AuthUser; 
    message: string 
  }> {
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
      let user = mockUsers.find(u => u.phone_number === phoneNumber);
      
      let authUser: AuthUser;
      
      if (!user) {
        // Create new demo user
        user = {
          id: `demo-${phoneNumber.replace(/\D/g, '')}`,
          phone_number: phoneNumber,
          is_verified: true,
          is_host: false,
          created_at: new Date().toISOString(),
        };
        mockUsers.push(user);
        
        // Create AuthUser for new user (profile incomplete)
        authUser = {
          id: user.id,
          phoneNumber: user.phone_number,
          isVerified: user.is_verified,
          isHost: user.is_host,
          createdAt: user.created_at,
          isProfileComplete: false,
        };
      } else {
        // Convert existing user to AuthUser format
        authUser = {
          id: user.id,
          phoneNumber: user.phone_number,
          isVerified: user.is_verified,
          isHost: user.is_host,
          createdAt: user.created_at,
          username: (user as any).username,
          name: (user as any).name,
          age: (user as any).age,
          city: (user as any).city,
          email: (user as any).email,
          socialActivityLevel: (user as any).social_activity_level,
          isProfileComplete: (user as any).is_profile_complete ?? false,
        };
      }

      return {
        success: true,
        user: authUser,
        message: 'OTP verified successfully'
      };

    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  },

  // Get current user (placeholder)
  getCurrentUser(): AuthUser | null {
    // This would typically check secure storage
    return null;
  },

  // Sign out
  signOut(): void {
    // Clear any stored data
    console.log('User signed out');
  },

  // Become host
  async becomeHost(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find user in mock data
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Update user to be a host
      mockUsers[userIndex].is_host = true;

      return {
        success: true,
        message: 'You are now a host! You can create events.'
      };
    } catch (error) {
      console.error('Become host error:', error);
      return {
        success: false,
        message: 'Failed to become host. Please try again.'
      };
    }
  }
};