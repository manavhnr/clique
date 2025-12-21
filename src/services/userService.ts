import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData 
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { AuthUser } from '../types/auth';

// Extended user interface for search results
export interface UserSearchResult extends AuthUser {
  followers?: number;
  following?: number;
  bio?: string;
  isFollowing?: boolean;
  postsCount?: number;
}

const USERS_COLLECTION = 'users';

/**
 * Search users by name or username
 */
export async function searchUsers(searchQuery: string, limitCount: number = 20): Promise<UserSearchResult[]> {
  try {
    if (!searchQuery.trim()) {
      return [];
    }

    console.log('Searching users with query:', searchQuery);
    
    // Get all users first, then filter client-side
    // This is a simple approach - for production, you'd want server-side search
    const usersRef = collection(db, USERS_COLLECTION);
    const allUsersQuery = query(usersRef, limit(100)); // Get up to 100 users to search through
    
    const querySnapshot = await getDocs(allUsersQuery);
    console.log('Found documents:', querySnapshot.size);
    
    const searchTerm = searchQuery.toLowerCase();
    const results: UserSearchResult[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('User document:', doc.id, data);
      
      // Check if the search term matches name or username
      const name = (data.name || '').toLowerCase();
      const username = (data.username || '').toLowerCase();
      
      if (name.includes(searchTerm) || username.includes(searchTerm)) {
        results.push({
          id: doc.id,
          phoneNumber: data.phone_number || data.phoneNumber || '',
          isVerified: data.is_verified || data.isVerified || false,
          isHost: data.is_host || data.isHost || false,
          createdAt: data.created_at || data.createdAt || '',
          username: data.username || '',
          name: data.name || '',
          age: data.age,
          city: data.city || '',
          email: data.email || '',
          avatar: data.avatar || `https://picsum.photos/100/100?random=${doc.id}`,
          socialActivityLevel: data.socialActivityLevel,
          isProfileComplete: data.isProfileComplete,
          // Extended fields for search results
          followers: data.followers || Math.floor(Math.random() * 1000), // Mock for now
          following: data.following || Math.floor(Math.random() * 500), // Mock for now
          bio: data.bio || `${data.socialActivityLevel || 'Occasional'} party goer and event enthusiast`,
          isFollowing: false, // This would need to be checked against current user's following list
          postsCount: data.postsCount || Math.floor(Math.random() * 50)
        });
      }
    });

    console.log('Search results:', results);

    // Sort results by relevance (exact matches first)
    return results.sort((a, b) => {
      const aNameMatch = a.name?.toLowerCase().startsWith(searchTerm) ? 1 : 0;
      const bNameMatch = b.name?.toLowerCase().startsWith(searchTerm) ? 1 : 0;
      const aUsernameMatch = a.username?.toLowerCase().startsWith(searchTerm) ? 1 : 0;
      const bUsernameMatch = b.username?.toLowerCase().startsWith(searchTerm) ? 1 : 0;
      
      const aScore = aNameMatch + aUsernameMatch;
      const bScore = bNameMatch + bUsernameMatch;
      
      return bScore - aScore;
    }).slice(0, limitCount);

  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

/**
 * Get all users (for admin or discovery purposes)
 */
export async function getAllUsers(limitCount: number = 50): Promise<UserSearchResult[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(
      usersRef,
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const users: UserSearchResult[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        phoneNumber: data.phone_number || data.phoneNumber || '',
        isVerified: data.is_verified || data.isVerified || false,
        isHost: data.is_host || data.isHost || false,
        createdAt: data.created_at || data.createdAt || '',
        username: data.username || '',
        name: data.name || '',
        age: data.age,
        city: data.city || '',
        email: data.email || '',
        avatar: data.avatar || `https://picsum.photos/100/100?random=${doc.id}`,
        socialActivityLevel: data.socialActivityLevel,
        isProfileComplete: data.isProfileComplete,
        // Extended fields
        followers: data.followers || Math.floor(Math.random() * 1000),
        following: data.following || Math.floor(Math.random() * 500),
        bio: data.bio || `${data.socialActivityLevel || 'Occasional'} party goer and event enthusiast`,
        isFollowing: false,
        postsCount: data.postsCount || Math.floor(Math.random() * 50)
      });
    });

    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
}

/**
 * Get suggested users (for discovery)
 */
export async function getSuggestedUsers(currentUserId: string, limitCount: number = 10): Promise<UserSearchResult[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(
      usersRef,
      where('id', '!=', currentUserId),
      orderBy('id'), // Required when using != operator
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const users: UserSearchResult[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        phoneNumber: data.phone_number || data.phoneNumber || '',
        isVerified: data.is_verified || data.isVerified || false,
        isHost: data.is_host || data.isHost || false,
        createdAt: data.created_at || data.createdAt || '',
        username: data.username || '',
        name: data.name || '',
        age: data.age,
        city: data.city || '',
        email: data.email || '',
        avatar: data.avatar || `https://picsum.photos/100/100?random=${doc.id}`,
        socialActivityLevel: data.socialActivityLevel,
        isProfileComplete: data.isProfileComplete,
        followers: data.followers || Math.floor(Math.random() * 1000),
        following: data.following || Math.floor(Math.random() * 500),
        bio: data.bio || `${data.socialActivityLevel || 'Occasional'} party goer and event enthusiast`,
        isFollowing: false,
        postsCount: data.postsCount || Math.floor(Math.random() * 50)
      });
    });

    return users;
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    throw error;
  }
}

/**
 * Check if current user is following another user
 */
export async function checkIfFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
  try {
    // This would check a 'follows' collection or similar
    // For now, return false as placeholder
    return false;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

/**
 * Follow/unfollow a user
 */
export async function toggleFollowUser(currentUserId: string, targetUserId: string, isFollowing: boolean): Promise<boolean> {
  try {
    // This would update the follows relationship in the database
    // For now, just return the opposite state
    console.log(`User ${currentUserId} ${isFollowing ? 'unfollowed' : 'followed'} user ${targetUserId}`);
    return !isFollowing;
  } catch (error) {
    console.error('Error toggling follow status:', error);
    throw error;
  }
}