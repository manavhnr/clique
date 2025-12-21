/**
 * Firestore Schema Documentation and Sample Data
 * For Clique Personalized Feed System
 */

import { Timestamp } from 'firebase/firestore';

// Type alias for consistency
type FirebaseTimestamp = Timestamp;

// ==========================================
// USER COLLECTION SCHEMA
// ==========================================
// Collection: 'users'
// Document ID: User's UID from Firebase Auth

interface UserDocumentSchema {
  // Basic profile information
  id: string;                    // Same as document ID
  name: string;                  // Display name
  username: string;              // Unique username
  email: string;                 // User email
  avatar?: string;               // Profile picture URL
  
  // Social graph
  following: string[];           // Array of user IDs this user follows
  followers: string[];           // Array of user IDs that follow this user
  
  // Personalization data
  interests: string[];           // User's interests for topic-based feed
                                // Examples: ["music", "food", "technology", "art", "sports"]
  
  // Location for location-based feed
  location: {
    lat: number;                 // Latitude
    lng: number;                 // Longitude
    city?: string;               // Optional city name
    country?: string;            // Optional country
  };
  
  // Additional metadata
  isHost: boolean;               // Whether user can create events
  createdAt: FirebaseTimestamp;  // Account creation time
  lastActive?: FirebaseTimestamp; // Last activity timestamp
  
  // Privacy settings
  isLocationPublic: boolean;     // Whether location can be used for recommendations
  allowTopicRecommendations: boolean; // Whether to use interests for feed
}

// Sample user documents:
const sampleUsers = [
  {
    id: "user_123",
    name: "Sarah Johnson",
    username: "sarahj_events",
    email: "sarah@example.com",
    avatar: "https://example.com/avatar1.jpg",
    following: ["user_456", "user_789"],
    followers: ["user_456", "user_999"],
    interests: ["music", "food", "nightlife", "art"],
    location: {
      lat: 40.7128,
      lng: -74.0060,
      city: "New York",
      country: "USA"
    },
    isHost: true,
    createdAt: "2025-01-01T00:00:00Z",
    lastActive: "2025-12-06T10:30:00Z",
    isLocationPublic: true,
    allowTopicRecommendations: true
  },
  {
    id: "user_456",
    name: "Mike Chen",
    username: "mikechen_music",
    email: "mike@example.com",
    following: ["user_123"],
    followers: ["user_123", "user_789"],
    interests: ["music", "technology", "concerts"],
    location: {
      lat: 40.7589,
      lng: -73.9851,
      city: "New York",
      country: "USA"
    },
    isHost: false,
    createdAt: "2025-01-15T00:00:00Z",
    isLocationPublic: true,
    allowTopicRecommendations: true
  }
];

// ==========================================
// POSTS COLLECTION SCHEMA
// ==========================================
// Collection: 'posts' 
// Document ID: Auto-generated

interface PostDocumentSchema {
  // Basic post information
  id: string;                    // Document ID
  ownerId: string;               // User ID who created the post
  content: string;               // Post text content
  
  // Categorization for topic-based feed
  topics: string[];              // Topics/tags for this post
                                // Examples: ["music", "concert", "rock", "live-music"]
  
  // Location for location-based feed
  location: {
    lat: number;                 // Event/post location latitude
    lng: number;                 // Event/post location longitude
    name?: string;               // Venue/location name
    address?: string;            // Full address
  };
  
  // Media and content
  images?: string[];             // Array of image URLs
  eventId?: string;              // Reference to related event (if applicable)
  eventTitle?: string;           // Event title for context
  
  // Engagement metrics
  likes: number;                 // Like count
  comments: number;              // Comment count
  shares: number;                // Share count
  
  // Metadata
  createdAt: FirebaseTimestamp;  // Post creation time
  updatedAt?: FirebaseTimestamp; // Last update time
  isActive: boolean;             // Whether post is active/visible
  
  // Visibility settings
  visibility: "public" | "followers" | "private"; // Who can see the post
}

// Sample post documents:
const samplePosts = [
  {
    id: "post_abc123",
    ownerId: "user_123",
    content: "Amazing rooftop party last night! The music was incredible 🎵",
    topics: ["music", "party", "nightlife", "rooftop"],
    location: {
      lat: 40.7505,
      lng: -73.9934,
      name: "Sky Bar NYC",
      address: "123 West 28th St, New York, NY"
    },
    images: ["https://example.com/post1_img1.jpg", "https://example.com/post1_img2.jpg"],
    eventId: "event_xyz789",
    eventTitle: "Rooftop Summer Vibes",
    likes: 45,
    comments: 12,
    shares: 8,
    createdAt: "2025-12-05T22:30:00Z",
    isActive: true,
    visibility: "public"
  },
  {
    id: "post_def456",
    ownerId: "user_456",
    content: "Tech meetup was mind-blowing! AI discussions were fascinating",
    topics: ["technology", "ai", "meetup", "networking"],
    location: {
      lat: 40.7614,
      lng: -73.9776,
      name: "WeWork Times Square",
      address: "1460 Broadway, New York, NY"
    },
    images: ["https://example.com/post2_img1.jpg"],
    likes: 23,
    comments: 5,
    shares: 3,
    createdAt: "2025-12-05T18:15:00Z",
    isActive: true,
    visibility: "public"
  },
  {
    id: "post_ghi789",
    ownerId: "user_789",
    content: "Food festival in Central Park! So many amazing vendors 🍕🌮",
    topics: ["food", "festival", "outdoor", "vendors"],
    location: {
      lat: 40.7829,
      lng: -73.9654,
      name: "Central Park",
      address: "Central Park, New York, NY"
    },
    images: ["https://example.com/post3_img1.jpg", "https://example.com/post3_img2.jpg"],
    likes: 67,
    comments: 18,
    shares: 12,
    createdAt: "2025-12-05T14:45:00Z",
    isActive: true,
    visibility: "public"
  }
];

// ==========================================
// FIRESTORE INDEXES REQUIRED
// ==========================================

/*
REQUIRED COMPOSITE INDEXES for optimal performance:

1. Posts by owner and timestamp (for followed users feed):
   Collection: posts
   Fields: ownerId (Ascending), createdAt (Descending)

2. Posts by topics and timestamp (for topic-based feed):
   Collection: posts  
   Fields: topics (Array), createdAt (Descending)

3. Posts by timestamp only (for recent posts queries):
   Collection: posts
   Fields: createdAt (Descending)

4. Posts by visibility and timestamp:
   Collection: posts
   Fields: visibility (Ascending), createdAt (Descending)

5. Posts by active status and timestamp:
   Collection: posts
   Fields: isActive (Ascending), createdAt (Descending)

You can create these indexes via Firebase Console or using the Firebase CLI:
firebase firestore:indexes

Or create an index configuration file:
*/

const firestoreIndexes = {
  indexes: [
    {
      collectionGroup: "posts",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "ownerId", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },
    {
      collectionGroup: "posts", 
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "topics", arrayConfig: "CONTAINS" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },
    {
      collectionGroup: "posts",
      queryScope: "COLLECTION", 
      fields: [
        { fieldPath: "visibility", order: "ASCENDING" },
        { fieldPath: "isActive", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    }
  ]
};

// ==========================================
// SECURITY RULES RECOMMENDATIONS
// ==========================================

/*
Firestore Security Rules for personalized feed:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read their own data and public user data
    match /users/{userId} {
      allow read: if true; // Public read for usernames, avatars
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts visibility rules
    match /posts/{postId} {
      allow read: if true; // For now, allow all reads (can be restricted by visibility field)
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
  }
}
*/

// ==========================================
// SAMPLE USAGE AND TESTING
// ==========================================

/*
To test the personalized feed with this schema:

1. Create users with the sample data above
2. Create posts with the sample data above  
3. Call the feed endpoint:

POST /api/feed/personalized
{
  "userId": "user_123",
  "limit": 20,
  "includeDebug": true
}

Expected response:
{
  "posts": [
    {
      "id": "post_def456",
      "content": "Tech meetup was mind-blowing!...",
      "score": 0.6,
      "followScore": 1,
      "topicScore": 0,
      "distanceScore": 0.8,
      "ownerName": "Mike Chen",
      "ownerUsername": "mikechen_music"
    }
  ],
  "hasMore": false,
  "totalProcessed": 3,
  "debugInfo": {
    "followBasedCount": 1,
    "topicBasedCount": 2,
    "locationBasedCount": 3,
    "averageScore": 0.425
  }
}
*/

export { 
  sampleUsers, 
  samplePosts, 
  firestoreIndexes 
};