import {
  collection,
  doc,
  getDocs,
  query,
  where,
  limit,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { UserSearchResult } from './userService';
import { calculateDistance } from '../utils/distanceUtils';

export interface RecommendedUser extends UserSearchResult {
  relevanceScore: number;
  reasonTags: string[];
  mutualInterests?: string[];
  distance?: number;
  distanceFormatted?: string;
}

interface UserLocation {
  latitude?: number;
  longitude?: number;
  city?: string;
}

interface UserInterests {
  interests?: string[];
  socialActivityLevel?: string;
}

class RecommendationService {
  private usersRef = collection(db, 'users');

  /**
   * Get recommended users based on multiple factors
   */
  async getRecommendedUsers(
    currentUserId: string,
    existingConversationUserIds: string[] = [],
    limitCount: number = 20
  ): Promise<RecommendedUser[]> {
    try {
      // Get current user's profile
      const currentUserProfile = await this.getCurrentUserProfile(currentUserId);
      if (!currentUserProfile) {
        throw new Error('Current user profile not found');
      }

      // Get all candidate users
      const candidates = await this.getCandidateUsers(
        currentUserId,
        existingConversationUserIds
      );

      // Score and rank candidates
      const scoredUsers = await this.scoreUsers(
        candidates,
        currentUserProfile,
        currentUserId
      );

      // Sort by relevance score and limit results
      return scoredUsers
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error getting recommended users:', error);
      throw error;
    }
  }

  /**
   * Get current user's profile for comparison
   */
  private async getCurrentUserProfile(userId: string): Promise<any | null> {
    try {
      const userDoc = await getDoc(doc(this.usersRef, userId));
      return userDoc.exists() ? { id: userId, ...userDoc.data() } : null;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      return null;
    }
  }

  /**
   * Get candidate users excluding current user and existing conversations
   */
  private async getCandidateUsers(
    currentUserId: string,
    excludeUserIds: string[]
  ): Promise<any[]> {
    try {
      // Get a sample of users to work with
      const usersQuery = query(this.usersRef, limit(100));
      const snapshot = await getDocs(usersQuery);
      
      const candidates: any[] = [];
      const excludeSet = new Set([currentUserId, ...excludeUserIds]);

      snapshot.forEach((doc) => {
        if (!excludeSet.has(doc.id) && doc.data().isProfileComplete) {
          candidates.push({
            id: doc.id,
            ...doc.data(),
          });
        }
      });

      return candidates;
    } catch (error) {
      console.error('Error fetching candidate users:', error);
      return [];
    }
  }

  /**
   * Score users based on multiple factors
   */
  private async scoreUsers(
    candidates: any[],
    currentUser: any,
    currentUserId: string
  ): Promise<RecommendedUser[]> {
    const scoredUsers: RecommendedUser[] = [];

    for (const candidate of candidates) {
      const score = this.calculateRelevanceScore(candidate, currentUser);
      const reasonTags = this.generateReasonTags(candidate, currentUser);
      const mutualInterests = this.findMutualInterests(candidate, currentUser);
      
      // Calculate distance if coordinates are available
      let distance: number | undefined;
      let distanceFormatted: string | undefined;
      
      if (this.hasValidCoordinates(candidate) && this.hasValidCoordinates(currentUser)) {
        distance = calculateDistance(
          currentUser.latitude,
          currentUser.longitude,
          candidate.latitude,
          candidate.longitude
        );
        distanceFormatted = this.formatDistance(distance);
      }

      const recommendedUser: RecommendedUser = {
        id: candidate.id,
        phoneNumber: candidate.phoneNumber || '',
        isVerified: candidate.isVerified || false,
        isHost: candidate.isHost || false,
        createdAt: candidate.createdAt || '',
        username: candidate.username || '',
        name: candidate.name || '',
        age: candidate.age,
        city: candidate.city || '',
        email: candidate.email || '',
        avatar: candidate.avatar || `https://picsum.photos/100/100?random=${candidate.id}`,
        socialActivityLevel: candidate.socialActivityLevel,
        isProfileComplete: candidate.isProfileComplete,
        followers: candidate.followers || Math.floor(Math.random() * 500) + 50,
        following: candidate.following || Math.floor(Math.random() * 300) + 20,
        bio: candidate.bio || this.generateBio(candidate),
        isFollowing: await this.checkIfFollowing(currentUserId, candidate.id),
        postsCount: candidate.postsCount || Math.floor(Math.random() * 50) + 5,
        relevanceScore: score,
        reasonTags,
        mutualInterests,
        distance,
        distanceFormatted,
      };

      scoredUsers.push(recommendedUser);
    }

    return scoredUsers;
  }

  /**
   * Calculate relevance score based on multiple factors
   */
  private calculateRelevanceScore(candidate: any, currentUser: any): number {
    let score = 0;

    // Same city/location (+3 points)
    if (candidate.city && currentUser.city && 
        candidate.city.toLowerCase() === currentUser.city.toLowerCase()) {
      score += 3;
    }

    // Nearby location if coordinates available (+2 points)
    if (this.hasValidCoordinates(candidate) && this.hasValidCoordinates(currentUser)) {
      const distance = calculateDistance(
        currentUser.latitude,
        currentUser.longitude,
        candidate.latitude,
        candidate.longitude
      );
      if (distance <= 10) { // Within 10km
        score += 2;
      }
    }

    // Similar social activity level (+2 points)
    if (candidate.socialActivityLevel === currentUser.socialActivityLevel) {
      score += 2;
    }

    // Host status match (+1 point)
    if (candidate.isHost === currentUser.isHost) {
      score += 1;
    }

    // Age similarity (+1 point if within 5 years)
    if (candidate.age && currentUser.age && 
        Math.abs(candidate.age - currentUser.age) <= 5) {
      score += 1;
    }

    // Common interests (+1 point per common interest)
    const mutualInterests = this.findMutualInterests(candidate, currentUser);
    score += mutualInterests.length;

    // Recent activity bonus (+1 point if created account recently)
    if (candidate.createdAt) {
      const createdDate = new Date(candidate.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (createdDate > thirtyDaysAgo) {
        score += 1;
      }
    }

    // Random factor to add variety (0-1 points)
    score += Math.random();

    return score;
  }

  /**
   * Generate reason tags for why user is recommended
   */
  private generateReasonTags(candidate: any, currentUser: any): string[] {
    const tags: string[] = [];

    // Location-based tags
    if (candidate.city && currentUser.city && 
        candidate.city.toLowerCase() === currentUser.city.toLowerCase()) {
      tags.push(`From ${candidate.city}`);
    }

    if (this.hasValidCoordinates(candidate) && this.hasValidCoordinates(currentUser)) {
      const distance = calculateDistance(
        currentUser.latitude,
        currentUser.longitude,
        candidate.latitude,
        candidate.longitude
      );
      if (distance <= 5) {
        tags.push('Very nearby');
      } else if (distance <= 10) {
        tags.push('Nearby');
      }
    }

    // Activity level tags
    if (candidate.socialActivityLevel === currentUser.socialActivityLevel) {
      tags.push(`${candidate.socialActivityLevel} social activity`);
    }

    // Host status tags
    if (candidate.isHost && currentUser.isHost) {
      tags.push('Fellow host');
    } else if (candidate.isHost) {
      tags.push('Event host');
    }

    // Age similarity tags
    if (candidate.age && currentUser.age) {
      const ageDiff = Math.abs(candidate.age - currentUser.age);
      if (ageDiff <= 3) {
        tags.push('Similar age');
      }
    }

    // Interest tags
    const mutualInterests = this.findMutualInterests(candidate, currentUser);
    if (mutualInterests.length > 0) {
      tags.push(`${mutualInterests.length} common interest${mutualInterests.length > 1 ? 's' : ''}`);
    }

    // New user tags
    if (candidate.createdAt) {
      const createdDate = new Date(candidate.createdAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (createdDate > sevenDaysAgo) {
        tags.push('New to Clique');
      }
    }

    // Fallback tags if no specific reasons
    if (tags.length === 0) {
      tags.push('Active user');
    }

    return tags;
  }

  /**
   * Find mutual interests between users
   */
  private findMutualInterests(candidate: any, currentUser: any): string[] {
    // This is a simplified implementation
    // In reality, you'd have proper interest arrays in your user schema
    const candidateInterests = this.extractInterests(candidate);
    const currentUserInterests = this.extractInterests(currentUser);

    return candidateInterests.filter(interest => 
      currentUserInterests.includes(interest)
    );
  }

  /**
   * Extract interests from user profile (simplified)
   */
  private extractInterests(user: any): string[] {
    const interests: string[] = [];
    
    // Map social activity level to interests
    if (user.socialActivityLevel) {
      switch (user.socialActivityLevel) {
        case 'very_frequently':
          interests.push('parties', 'nightlife', 'networking');
          break;
        case 'frequently':
          interests.push('social events', 'meetups');
          break;
        case 'occasionally':
          interests.push('casual meetups', 'dining');
          break;
        default:
          interests.push('social activities');
      }
    }

    // Add interests based on host status
    if (user.isHost) {
      interests.push('event organizing', 'hosting');
    }

    // Add city-based interests
    if (user.city) {
      interests.push(`${user.city} events`);
    }

    return interests;
  }

  /**
   * Check if coordinates are valid
   */
  private hasValidCoordinates(user: any): boolean {
    return user.latitude && user.longitude && 
           typeof user.latitude === 'number' && 
           typeof user.longitude === 'number';
  }

  /**
   * Format distance for display
   */
  private formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km away`;
    } else {
      return `${Math.round(distance)}km away`;
    }
  }

  /**
   * Generate bio for users without one
   */
  private generateBio(user: any): string {
    const activity = user.socialActivityLevel || 'occasional';
    const location = user.city ? ` from ${user.city}` : '';
    const hostText = user.isHost ? ' | Event host' : '';
    
    return `${activity.charAt(0).toUpperCase() + activity.slice(1)} social butterfly${location}${hostText} 🎉`;
  }

  /**
   * Check if current user is following the candidate
   * This is simplified - in reality you'd check a following relationship
   */
  private async checkIfFollowing(currentUserId: string, candidateId: string): Promise<boolean> {
    // Simplified implementation - return false for now
    // In reality, you'd check a followers/following collection or field
    return false;
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;