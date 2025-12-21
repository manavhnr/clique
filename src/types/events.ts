// Event and Post Type Definitions for Photo Collage System

export interface Event {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  price: number;
  capacity: number;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  attendees: string[]; // Array of user IDs
  tags: string[];
  coverImage?: string;
  // Photo collage stats
  totalPhotos: number;
  totalContributors: number;
  isPhotoSharingEnabled: boolean;
}

export interface EventPost {
  id: string;
  userId: string;
  eventId: string;
  content: {
    text: string;
    hashtags: string[];
    mentions: string[]; // Array of @usernames
  };
  media: EventPostMedia[];
  stats: {
    replies: number;
    retweets: number;
    likes: number;
    bookmarks: number;
  };
  interactions: {
    likedBy: string[]; // Array of user IDs
    retweetedBy: string[];
    bookmarkedBy: string[];
    repliedBy: string[];
  };
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  visibility: 'public' | 'private' | 'followers_only';
}

export interface EventPostMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  aspectRatio: number;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  // Link to event for collage aggregation
  eventId: string;
  contributorId: string;
  contributorName: string;
  contributorUsername: string;
  contributorAvatar?: string;
  uploadedAt: string;
  isApproved: boolean; // For moderation
  moderationStatus: 'pending' | 'approved' | 'rejected';
}

export interface EventPhotoCollage {
  id: string; // Same as eventId
  eventId: string;
  eventTitle: string;
  eventDate: string;
  hostId: string;
  photos: EventCollagePhoto[];
  contributors: EventContributor[];
  stats: {
    totalPhotos: number;
    totalContributors: number;
    totalLikes: number;
    totalViews: number;
  };
  settings: {
    isPublic: boolean;
    allowGuestContributions: boolean;
    requireApproval: boolean;
    maxPhotosPerUser: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventCollagePhoto {
  id: string;
  eventId: string;
  postId?: string; // Reference to original post if it came from a post
  mediaId: string; // Reference to EventPostMedia
  url: string;
  thumbnailUrl?: string;
  aspectRatio: number;
  contributorId: string;
  contributor: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  caption?: string;
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  timestamp: string; // When photo was taken (if available)
  uploadedAt: string;
  likes: number;
  likedBy: string[];
  comments: EventPhotoComment[];
  tags: string[]; // User tags in photo
  isDeleted: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  metadata?: {
    camera?: string;
    settings?: string;
    filters?: string[];
  };
}

export interface EventContributor {
  id: string;
  userId: string;
  eventId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  contributionStats: {
    photosCount: number;
    likesReceived: number;
    firstPhotoAt: string;
    lastPhotoAt: string;
  };
  role: 'attendee' | 'host' | 'photographer' | 'guest';
  joinedAt: string;
  isActive: boolean;
}

export interface EventPhotoComment {
  id: string;
  photoId: string;
  eventId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  text: string;
  mentions: string[]; // Array of @usernames
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
  likes: number;
  likedBy: string[];
}

export interface UserEventActivity {
  id: string;
  userId: string;
  eventId: string;
  activityType: 'post_created' | 'photo_uploaded' | 'photo_liked' | 'comment_added' | 'event_shared';
  activityData: {
    postId?: string;
    photoId?: string;
    commentId?: string;
    targetUserId?: string;
  };
  timestamp: string;
  isPublic: boolean;
}

// API Response Types
export interface EventCollageResponse {
  event: Event;
  collage: EventPhotoCollage;
  photos: EventCollagePhoto[];
  contributors: EventContributor[];
  userStats?: {
    photosContributed: number;
    likesReceived: number;
    rank: number;
  };
}

export interface EventFeedResponse {
  posts: EventPost[];
  pagination: {
    hasMore: boolean;
    nextCursor?: string;
    totalCount: number;
  };
  events: Event[]; // Referenced events
  users: any[]; // User profiles for posts
}

// Database Collection Names
export const COLLECTIONS = {
  EVENTS: 'events',
  EVENT_POSTS: 'eventPosts',
  EVENT_POST_MEDIA: 'eventPostMedia',
  EVENT_PHOTO_COLLAGES: 'eventPhotoCollages',
  EVENT_COLLAGE_PHOTOS: 'eventCollagePhotos',
  EVENT_CONTRIBUTORS: 'eventContributors',
  EVENT_PHOTO_COMMENTS: 'eventPhotoComments',
  USER_EVENT_ACTIVITY: 'userEventActivity',
} as const;