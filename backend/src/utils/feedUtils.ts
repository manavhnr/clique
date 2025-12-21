/**
 * Core utility functions for personalized feed scoring
 * Implements follow-based, topic-based, and location-based ranking
 */

import { UserDocument, PostDocument, UserLocation, PostLocation, SCORING_WEIGHTS, FEED_CONFIG } from '../types/feed';

/**
 * Calculates if user follows the post owner
 * @param userFollowing Array of user IDs the current user follows
 * @param postOwnerId ID of the post owner
 * @returns 1 if following, 0 if not
 */
export function computeFollowScore(userFollowing: string[], postOwnerId: string): number {
  return userFollowing.includes(postOwnerId) ? 1 : 0;
}

/**
 * Calculates topic relevance score based on interest overlap
 * @param userInterests Array of user's interests
 * @param postTopics Array of post's topics
 * @returns Score between 0 and 1 representing topic relevance
 */
export function computeTopicScore(userInterests: string[], postTopics: string[]): number {
  if (userInterests.length === 0 || postTopics.length === 0) {
    return 0;
  }
  
  // Count matching topics (case-insensitive)
  const userInterestsLower = userInterests.map(interest => interest.toLowerCase());
  const postTopicsLower = postTopics.map(topic => topic.toLowerCase());
  
  const matchedTopics = userInterestsLower.filter(interest => 
    postTopicsLower.includes(interest)
  );
  
  // Return ratio of matched topics to total user interests
  return matchedTopics.length / userInterests.length;
}

/**
 * Calculates distance between two geographic points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates distance-based score with inverse normalization
 * @param userLocation User's current location
 * @param postLocation Post's location
 * @returns Score between 0 and 1, where closer = higher score
 */
export function computeDistanceScore(userLocation: UserLocation, postLocation: PostLocation): number {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    postLocation.lat,
    postLocation.lng
  );
  
  // If beyond max distance, return 0
  if (distance > FEED_CONFIG.MAX_DISTANCE_KM) {
    return 0;
  }
  
  // Inverse normalization: closer = higher score
  // Score = 1 - (distance / maxDistance)
  return Math.max(0, 1 - (distance / FEED_CONFIG.MAX_DISTANCE_KM));
}

/**
 * Computes the final weighted score for a post
 * @param followScore Score from follow relationship (0 or 1)
 * @param topicScore Score from topic matching (0-1)
 * @param distanceScore Score from location proximity (0-1)
 * @returns Final weighted score
 */
export function computeFinalScore(
  followScore: number, 
  topicScore: number, 
  distanceScore: number
): number {
  return (
    followScore * SCORING_WEIGHTS.FOLLOW +
    topicScore * SCORING_WEIGHTS.TOPIC +
    distanceScore * SCORING_WEIGHTS.DISTANCE
  );
}

/**
 * Validates user location data
 */
export function isValidLocation(location: UserLocation | PostLocation): boolean {
  return (
    location &&
    typeof location.lat === 'number' &&
    typeof location.lng === 'number' &&
    location.lat >= -90 &&
    location.lat <= 90 &&
    location.lng >= -180 &&
    location.lng <= 180
  );
}

/**
 * Normalizes and validates limit parameter
 */
export function validateLimit(limit?: number): number {
  if (!limit || limit <= 0) {
    return FEED_CONFIG.DEFAULT_LIMIT;
  }
  return Math.min(limit, FEED_CONFIG.MAX_LIMIT);
}

/**
 * Creates a cursor for pagination
 * Format: score_timestamp_postId for consistent ordering
 */
export function createCursor(score: number, timestamp: any, postId: string): string {
  const timestampMs = timestamp?.toMillis?.() || timestamp?.getTime?.() || Date.now();
  return `${score}_${timestampMs}_${postId}`;
}

/**
 * Parses a pagination cursor
 */
export function parseCursor(cursor: string): { score: number; timestamp: number; postId: string } | null {
  try {
    const parts = cursor.split('_');
    if (parts.length !== 3) return null;
    
    return {
      score: parseFloat(parts[0]),
      timestamp: parseInt(parts[1]),
      postId: parts[2]
    };
  } catch {
    return null;
  }
}