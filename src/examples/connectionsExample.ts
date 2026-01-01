// Example usage of connectionsService
import { connectionsService } from '../services/connectionsService';

// Example: Test connections functionality in a React Native component
export const testConnectionsExample = async () => {
  try {
    // Test getting connections count
    const connectionsData = await connectionsService.getConnectionsCount('user123');
    console.log('Connections:', connectionsData);
    // Output: { followers: 45, following: 23, connections: 68 }

    // Test following a user
    const followResult = await connectionsService.followUser('user123', 'user456');
    console.log('Follow successful:', followResult);

    // Test checking follow status
    const followStatus = await connectionsService.getFollowStatus('user123', 'user456');
    console.log('Is following:', followStatus?.isFollowing);

    // Test getting followers list
    const followers = await connectionsService.getFollowers('user123', 10);
    console.log('Followers:', followers?.followers);

  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Mock data for development/testing when backend is not available
export const mockConnectionsData = {
  followers: 45,
  following: 23,
  connections: 68
};

// For use in development mode when API is not available
export const getMockConnections = () => Promise.resolve(mockConnectionsData);