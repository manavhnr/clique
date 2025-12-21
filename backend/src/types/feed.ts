// TypeScript interfaces for the personalized feed system
import { Timestamp } from 'firebase/firestore';

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface UserDocument {
  id: string;
  following: string[];
  interests: string[];
  location: UserLocation;
  name: string;
  username: string;
  avatar?: string;
}

export interface PostLocation {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

export interface PostDocument {
  id: string;
  ownerId: string;
  content: string;
  topics: string[];
  location: PostLocation;
  createdAt: any; // Firestore Timestamp
  images?: string[];
  likes?: number;
  eventId?: string;
  eventTitle?: string;
  
  // Computed fields for feed
  ownerName?: string;
  ownerUsername?: string;
  ownerAvatar?: string;
}

export interface FeedPost extends PostDocument {
  score: number;
  followScore: number;
  topicScore: number;
  distanceScore: number;
  distance?: number; // in kilometers
}

export interface PersonalizedFeedResponse {
  posts: FeedPost[];
  nextCursor?: string;
  hasMore: boolean;
  totalProcessed: number;
  debugInfo?: {
    followBasedCount: number;
    topicBasedCount: number;
    locationBasedCount: number;
    averageScore: number;
  };
}

export interface FeedRequest {
  userId: string;
  limit?: number;
  cursor?: string;
  includeDebug?: boolean;
}

// Scoring configuration
export const SCORING_WEIGHTS = {
  FOLLOW: 0.6,
  TOPIC: 0.25,
  DISTANCE: 0.15
} as const;

export const FEED_CONFIG = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
  MAX_DISTANCE_KM: 50, // Posts beyond this distance get 0 distance score
  BATCH_SIZE: 100, // For pagination in large datasets
} as const;