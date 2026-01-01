import { API_CONFIG } from '../constants/api';

// Mock data for development when backend is not available
const MOCK_CONNECTIONS_DATA: ConnectionsData = {
  followers: 0,
  following: 0,
  connections: 0
};

const MOCK_FOLLOW_STATUS: FollowStatus = {
  isFollowing: false
};

export interface ConnectionsData {
  followers: number;
  following: number;
  connections: number;
}

export interface FollowStatus {
  isFollowing: boolean;
}

export interface FollowersList {
  followers: Array<{
    userId: string;
    followedAt: string;
  }>;
  hasMore: boolean;
  nextCursor?: string;
}

export interface FollowingList {
  following: Array<{
    userId: string;
    followedAt: string;
  }>;
  hasMore: boolean;
  nextCursor?: string;
}

class ConnectionsService {
  private isApiAvailable: boolean | null = null;
  private lastHealthCheck: number = 0;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

  /**
   * Check if the API server is available
   */
  private async checkApiHealth(): Promise<boolean> {
    // Force mock data in development if configured
    if (API_CONFIG.DEV_CONFIG.FORCE_MOCK_DATA) {
      if (API_CONFIG.DEV_CONFIG.ENABLE_API_LOGGING) {
        console.log('🔧 Forced to use mock data (FORCE_MOCK_DATA = true)');
      }
      return false;
    }

    const now = Date.now();
    
    // Use cached result if recent
    if (this.isApiAvailable !== null && (now - this.lastHealthCheck) < this.HEALTH_CHECK_INTERVAL) {
      return this.isApiAvailable;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/feed/health`, {
        headers: API_CONFIG.HEADERS,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      this.isApiAvailable = response.ok;
      this.lastHealthCheck = now;
      
      if (API_CONFIG.DEV_CONFIG.ENABLE_API_LOGGING) {
        console.log(`🟢 Backend API is ${this.isApiAvailable ? 'available' : 'unavailable'}`);
      }
      
      return this.isApiAvailable;
    } catch (error) {
      if (API_CONFIG.DEV_CONFIG.ENABLE_API_LOGGING) {
        console.log('🔄 Backend not available, using mock data for development');
      }
      this.isApiAvailable = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  /**
   * Get connections count for a user
   */
  async getConnectionsCount(userId: string): Promise<ConnectionsData> {
    // Check if API is available
    const apiAvailable = await this.checkApiHealth();
    
    if (!apiAvailable) {
      if (API_CONFIG.DEV_CONFIG.ENABLE_API_LOGGING) {
        console.log(`📊 Using mock connections data for user ${userId}`);
      }
      return MOCK_CONNECTIONS_DATA; // Return exactly 0 connections for testing
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONNECTIONS}/${userId}/connections`,
        {
          headers: API_CONFIG.HEADERS,
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (API_CONFIG.DEV_CONFIG.ENABLE_API_LOGGING) {
        console.log(`📡 Backend connections data for ${userId}:`, data);
      }
      
      return data;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error.message);
      return MOCK_CONNECTIONS_DATA;
    }
  }

  /**
   * Follow a user
   */
  async followUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    const apiAvailable = await this.checkApiHealth();
    
    if (!apiAvailable) {
      console.log(`👥 Mock: User ${currentUserId} followed ${targetUserId}`);
      return true; // Simulate success in development
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONNECTIONS}/${currentUserId}/follow`,
        {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({ targetUserId }),
        }
      );

      return response.ok;
    } catch (error) {
      console.warn('⚠️ Follow request failed:', error.message);
      return false;
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    const apiAvailable = await this.checkApiHealth();
    
    if (!apiAvailable) {
      console.log(`👥 Mock: User ${currentUserId} unfollowed ${targetUserId}`);
      return true; // Simulate success in development
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONNECTIONS}/${currentUserId}/follow`,
        {
          method: 'DELETE',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({ targetUserId }),
        }
      );

      return response.ok;
    } catch (error) {
      console.warn('⚠️ Unfollow request failed:', error.message);
      return false;
    }
  }

  /**
   * Check if user is following another user
   */
  async getFollowStatus(currentUserId: string, targetUserId: string): Promise<FollowStatus | null> {
    const apiAvailable = await this.checkApiHealth();
    
    if (!apiAvailable) {
      return MOCK_FOLLOW_STATUS;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONNECTIONS}/${currentUserId}/follow-status/${targetUserId}`,
        {
          headers: API_CONFIG.HEADERS,
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('⚠️ Follow status check failed:', error.message);
      return MOCK_FOLLOW_STATUS;
    }
  }

  /**
   * Get followers list for a user
   */
  async getFollowers(userId: string, limit: number = 20, cursor?: string): Promise<FollowersList | null> {
    const apiAvailable = await this.checkApiHealth();
    
    if (!apiAvailable) {
      // Return mock followers list
      const mockFollowers = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
        userId: `follower-${i + 1}`,
        followedAt: new Date(Date.now() - i * 86400000).toISOString()
      }));
      
      return {
        followers: mockFollowers,
        hasMore: false,
        nextCursor: undefined
      };
    }

    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (cursor) params.append('cursor', cursor);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONNECTIONS}/${userId}/followers?${params}`,
        {
          headers: API_CONFIG.HEADERS,
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('⚠️ Followers fetch failed:', error.message);
      return null;
    }
  }

  /**
   * Get following list for a user
   */
  async getFollowing(userId: string, limit: number = 20, cursor?: string): Promise<FollowingList | null> {
    const apiAvailable = await this.checkApiHealth();
    
    if (!apiAvailable) {
      // Return mock following list
      const mockFollowing = Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
        userId: `following-${i + 1}`,
        followedAt: new Date(Date.now() - i * 86400000).toISOString()
      }));
      
      return {
        following: mockFollowing,
        hasMore: false,
        nextCursor: undefined
      };
    }

    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (cursor) params.append('cursor', cursor);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONNECTIONS}/${userId}/following?${params}`,
        {
          headers: API_CONFIG.HEADERS,
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('⚠️ Following fetch failed:', error.message);
      return null;
    }
  }
}

export const connectionsService = new ConnectionsService();