# Clique App - Complete Firestore Database Schemas

## 🔥 Overview
This document contains the complete database schema for the Clique React Native event platform, extracted from the actual TypeScript type definitions and Firestore setup service.

---

## 📋 Collection Structure (60+ Collections)

### 👤 **User Management Collections**
- `users` - Main user profiles with phone authentication
- `userProfiles` - Extended profile information
- `hostProfiles` - Host-specific data and capabilities  
- `userConnections` - Following/followers relationships
- `userPreferences` - App preferences and notification settings
- `userSessions` - Session management and authentication tokens

### 🎉 **Event Management Collections**
- `events` - Main event data and metadata
- `eventCategories` - Event categories (party, music, food, sports, culture)
- `joinRequests` - Event join/booking requests from users
- `eventTemplates` - Reusable event templates for hosts
- `eventSeries` - Recurring events and event series
- `eventPhotos` - Event photo management and galleries
- `eventReviews` - Post-event reviews and ratings

### 📸 **Photo Collage System Collections**
- `eventPosts` - Social posts linked to specific events
- `eventPostMedia` - Media files with contributor attribution
- `eventPhotoCollages` - Collaborative photo collections per event
- `eventCollagePhotos` - Individual photos within collages
- `eventContributors` - Users contributing photos to events
- `eventPhotoComments` - Comments on collage photos
- `userEventActivity` - User activity tracking across events

### 🎫 **Booking System Collections**
- `bookingPasses` - Ticket/pass management system
- `tickets` - Individual ticket instances and QR codes
- `bookingHistory` - Booking transaction history
- `waitlists` - Waitlist management for full events
- `bookingPreferences` - User booking preferences and defaults

### 🔔 **Notification System Collections**
- `notifications` - User notifications and messages
- `notificationPreferences` - User notification settings
- `notificationTemplates` - Template messages for different events
- `pushTokens` - FCM token management for push notifications
- `notificationHistory` - Notification delivery tracking

### 🛡️ **Moderation & Safety Collections**
- `reports` - User reports and safety concerns
- `moderationActions` - Admin actions taken on content/users
- `autoModerationRules` - Automated moderation configuration
- `contentFlags` - Flagged content awaiting review
- `moderationQueue` - Content awaiting manual review
- `userSuspensions` - Account suspensions and restrictions
- `appealRequests` - User appeals against moderation actions

### 👨‍💼 **Admin & Platform Management Collections**
- `adminUsers` - Platform administrators and permissions
- `adminActions` - Admin action logs and audit trail
- `platformSettings` - Global platform configuration
- `systemHealth` - System health monitoring
- `auditLogs` - Complete audit trail for security
- `emergencyActions` - Emergency system controls
- `platformAnnouncements` - System-wide announcements

### ⭐ **Featured Events & Marketing Collections**
- `featuredEvents` - Promoted and featured events
- `promotionPackages` - Marketing packages and pricing
- `featuredEventAnalytics` - Promotion performance analytics
- `promotionCampaigns` - Marketing campaign management
- `trendingAlgorithms` - Trending event algorithms
- `editorialPicks` - Curated event selections
- `localPromotions` - Location-based promotions
- `promotionBids` - Bidding system for featured placement

### 📊 **Analytics Collections**
- `userAnalytics` - User behavior and engagement tracking
- `eventAnalytics` - Event performance metrics and insights
- `platformAnalytics` - Overall platform statistics
- `cohortAnalysis` - User cohort analysis and retention
- `businessIntelligence` - BI dashboard data aggregation
- `analyticsConfiguration` - Analytics settings and configuration

### 💳 **Payment Collections**
- `paymentMethods` - Stored payment methods for users
- `transactions` - Payment transactions and processing
- `payouts` - Host payouts and earnings
- `paymentIntents` - Stripe payment intents and processing
- `subscriptions` - Recurring payments and subscriptions
- `invoices` - Invoice generation and management
- `refundRequests` - Refund processing and management
- `paymentSettings` - Payment configuration and settings

### ⚙️ **System Collections**
- `appVersions` - App version management and updates
- `maintenanceWindows` - Scheduled maintenance periods
- `featureFlags` - Feature toggle management
- `apiKeys` - API key management and rotation
- `webhookConfigs` - Webhook endpoint configuration
- `backupLogs` - Database backup monitoring
- `migrationHistory` - Schema migration tracking

---

## 🔧 Core Schema Definitions

### **User Schema** (auth.ts)
```typescript
export interface AuthUser {
  id: string;
  phoneNumber: string;
  isVerified: boolean;
  isHost: boolean;
  createdAt?: string;
  // Profile information
  username?: string;
  name?: string;
  age?: number;
  city?: string;
  email?: string;
  avatar?: string;
  socialActivityLevel?: 'rarely' | 'occasionally' | 'frequently' | 'very_frequently';
  isProfileComplete?: boolean;
}

export interface User {
  id: string;
  phone_number: string;
  is_verified: boolean;
  is_host: boolean;
  created_at: string;
  // Profile information
  username?: string;
  name?: string;
  age?: number;
  city?: string;
  email?: string;
  social_activity_level?: 'rarely' | 'occasionally' | 'frequently' | 'very_frequently';
  is_profile_complete?: boolean;
}
```

### **Event Schema** (events.ts)
```typescript
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
  // Photo collage integration
  totalPhotos: number;
  totalContributors: number;
  isPhotoSharingEnabled: boolean;
}
```

### **Event Post Schema** (events.ts)
```typescript
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
```

### **Event Photo Collage Schema** (events.ts)
```typescript
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
```

### **Media Schema** (events.ts)
```typescript
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
```

### **Booking Schema** (booking.ts)
```typescript
export interface BookingRequest {
  id: string;
  eventId: string;
  userId: string;
  hostId: string;
  status: 'pending' | 'approved' | 'payment_pending' | 'paid' | 'rejected';
  ticketTier: string;
  price: number;
  requestedAt: string;
  respondedAt?: string;
  paymentStatus?: 'not_required' | 'pending' | 'completed' | 'failed';
  paymentCompletedAt?: string;
  qrCode?: string; // Generated only after payment
  userProfile: {
    id: string;
    name: string;
    username?: string;
    email: string;
    avatar?: string;
    age?: number;
    city?: string;
    socialActivityLevel?: 'rarely' | 'occasionally' | 'frequently' | 'very_frequently';
  };
  eventDetails: {
    title: string;
    date: string;
    time: string;
    location: {
      name: string;
      address: string;
    };
  };
}

export interface UserBooking {
  id: string;
  eventId: string;
  status: 'pending' | 'approved' | 'payment_pending' | 'paid' | 'rejected';
  ticketTier: string;
  price: number;
  requestedAt: string;
  respondedAt?: string;
  paymentStatus?: 'not_required' | 'pending' | 'completed' | 'failed';
  paymentCompletedAt?: string;
  qrCode?: string; // Generated only after payment is completed
  eventDetails: {
    title: string;
    date: string;
    time: string;
    location: {
      name: string;
      address: string;
    };
    images: string[];
  };
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userPhone: string;
  numberOfTickets: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  bookingDate: string;
  qrCode?: string;
}
```

---

## 📊 Required Firestore Indexes

### **User Indexes**
```
- users: ['email', 'accountStatus']
- users: ['isHost', 'isVerified']  
- users: ['location.city', 'accountStatus']
```

### **Event Indexes**
```
- events: ['status', 'visibility', 'schedule.startTime']
- events: ['category', 'location.city', 'schedule.startTime']
- events: ['hostId', 'status']
- events: ['tags', 'schedule.startTime']
```

### **Booking Indexes**
```
- bookingPasses: ['userId', 'status']
- bookingPasses: ['eventId', 'status']
- bookingPasses: ['status', 'bookedAt']
```

### **Notification Indexes**
```
- notifications: ['userId', 'isRead', 'createdAt']
- notifications: ['type', 'createdAt']
```

### **Analytics Indexes**
```
- userAnalytics: ['userId', 'date']
- eventAnalytics: ['eventId', 'date'] 
- platformAnalytics: ['date']
```

### **Payment Indexes**
```
- transactions: ['userId', 'status']
- transactions: ['status', 'createdAt']
- payouts: ['hostId', 'status']
```

---

## 🔧 Platform Configuration Schema

### **Platform Settings**
```typescript
interface PlatformSettings {
  id: 'platform_config';
  general: {
    platformName: string;
    tagline: string;
    supportEmail: string;
    maxEventCapacity: number;
    defaultEventDuration: number;
    timezoneSupport: boolean;
  };
  features: {
    userRegistration: boolean;
    eventCreation: boolean;
    paymentProcessing: boolean;
    socialFeatures: boolean;
    analyticsTracking: boolean;
    pushNotifications: boolean;
  };
  security: {
    twoFactorRequired: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
  };
  content: {
    autoModeration: boolean;
    manualReview: boolean;
    allowUserReports: boolean;
    contentRetentionDays: number;
  };
  business: {
    commissionRate: number;
    minPayoutAmount: number;
    payoutSchedule: string;
    refundWindow: number;
    currency: string;
  };
  updatedAt: string;
  updatedBy: string;
}
```

### **Feature Flags**
```typescript
interface FeatureFlags {
  id: 'default_flags';
  notifications: { enabled: boolean; rolloutPercentage: number };
  analytics: { enabled: boolean; rolloutPercentage: number };
  payments: { enabled: boolean; rolloutPercentage: number };
  socialFeatures: { enabled: boolean; rolloutPercentage: number };
  advancedSearch: { enabled: boolean; rolloutPercentage: number };
  aiRecommendations: { enabled: boolean; rolloutPercentage: number };
  updatedAt: string;
}
```

---

## 🚀 Database Setup Commands

### **Initialize All Schemas**
```typescript
import { firestoreSetup } from './src/services/firestoreSetupService';

// Initialize all 60+ collections
await firestoreSetup.initializeAllSchemas();

// Verify schemas exist
await firestoreSetup.verifySchemas();

// Create required indexes
await firestoreSetup.createIndexes();
```

### **Collection Names Constants**
```typescript
export const COLLECTIONS = {
  // User Management
  USERS: 'users',
  USER_PROFILES: 'userProfiles',
  HOST_PROFILES: 'hostProfiles',
  USER_CONNECTIONS: 'userConnections',
  
  // Event Management
  EVENTS: 'events',
  EVENT_CATEGORIES: 'eventCategories',
  JOIN_REQUESTS: 'joinRequests',
  
  // Photo Collage System  
  EVENT_POSTS: 'eventPosts',
  EVENT_POST_MEDIA: 'eventPostMedia',
  EVENT_PHOTO_COLLAGES: 'eventPhotoCollages',
  EVENT_COLLAGE_PHOTOS: 'eventCollagePhotos',
  EVENT_CONTRIBUTORS: 'eventContributors',
  EVENT_PHOTO_COMMENTS: 'eventPhotoComments',
  
  // Booking System
  BOOKING_PASSES: 'bookingPasses',
  TICKETS: 'tickets',
  BOOKING_HISTORY: 'bookingHistory',
  
  // Notifications
  NOTIFICATIONS: 'notifications',
  PUSH_TOKENS: 'pushTokens',
  
  // Analytics
  USER_ANALYTICS: 'userAnalytics',
  EVENT_ANALYTICS: 'eventAnalytics',
  PLATFORM_ANALYTICS: 'platformAnalytics',
  
  // Payments
  PAYMENT_METHODS: 'paymentMethods',
  TRANSACTIONS: 'transactions',
  PAYOUTS: 'payouts',
  
  // Featured Events
  FEATURED_EVENTS: 'featuredEvents',
  PROMOTION_PACKAGES: 'promotionPackages',
  
  // System
  FEATURE_FLAGS: 'featureFlags',
  PLATFORM_SETTINGS: 'platformSettings'
} as const;
```

---

## 💡 Key Features

### **🔥 Unique Innovations**
1. **Collaborative Photo Collages** - Attendees contribute photos that auto-aggregate into event collages
2. **SMS-First Authentication** - Phone number based auth with OTP verification
3. **Multi-tier Event System** - Free events, paid events, premium promotions
4. **Real-time Moderation** - Auto + manual content moderation pipeline
5. **Host Analytics Dashboard** - Comprehensive event performance tracking
6. **Integrated Payment Flow** - Stripe integration with host payouts
7. **Social Activity Scoring** - User engagement levels affect recommendations

### **📱 Mobile-First Design**
- React Native with Expo framework
- Optimized for iOS and Android
- Offline capability with sync
- Push notification system
- QR code ticket system
- Camera integration for photo uploads

---

**Generated:** November 24, 2025  
**Platform:** Clique Event Social Platform  
**Database:** Google Cloud Firestore  
**Framework:** React Native + Expo + TypeScript