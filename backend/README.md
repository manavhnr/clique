# 🚀 Clique Personalized Feed Implementation

## Complete Production-Ready Backend for Social Events Feed

This implementation provides a sophisticated personalized feed system that combines **follow-based**, **topic-based**, and **location-based** ranking for optimal user engagement.

---

## 📁 File Structure

```
backend/
├── src/
│   ├── types/
│   │   └── feed.ts                 # TypeScript interfaces
│   ├── utils/
│   │   └── feedUtils.ts            # Core scoring algorithms
│   ├── functions/
│   │   └── personalizedFeed.ts     # Firebase Cloud Functions
│   ├── api/
│   │   └── feedServer.ts           # Express.js server
│   └── schemas/
│       └── firestoreSchema.ts      # Database schemas & samples
├── functions/
│   └── package.json                # Cloud Functions dependencies
├── api/
│   └── package.json                # Express server dependencies
└── tsconfig.json                   # TypeScript config

frontend/
└── src/hooks/
    └── usePersonalizedFeed.ts      # React Native integration
```

---

## 🧠 Algorithm Overview

### Weighted Scoring Formula:
```
Final Score = (Follow × 0.6) + (Topic × 0.25) + (Distance × 0.15)
```

### 1. **Follow-Based Feed (60% weight)**
- Posts from users in the `following` array get maximum score
- Creates strong social graph connections
- Ensures content from friends appears first

### 2. **Topic-Based Feed (25% weight)**
- Matches post `topics` with user `interests`
- Score = `matched_topics / total_user_interests`
- Enables content discovery based on preferences

### 3. **Location-Based Feed (15% weight)**
- Uses Haversine formula for distance calculation
- Inverse normalization: closer = higher score
- Promotes hyperlocal content discovery

---

## 🔥 Firebase Setup

### 1. **Cloud Functions Deployment**

```bash
# Navigate to functions directory
cd backend/functions/

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Firebase
firebase deploy --only functions
```

### 2. **Express Server Setup**

```bash
# Navigate to API directory
cd backend/api/

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev

# Production build and start
npm run build && npm start
```

### 3. **Environment Variables (.env)**

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Server Configuration
PORT=3000
NODE_ENV=production

# API Configuration
API_VERSION=v1
MAX_REQUESTS_PER_MINUTE=100
```

---

## 📊 Firestore Schema

### Users Collection
```javascript
{
  id: "user_123",
  name: "Sarah Johnson",
  username: "sarahj_events",
  following: ["user_456", "user_789"],
  interests: ["music", "food", "nightlife", "art"],
  location: {
    lat: 40.7128,
    lng: -74.0060,
    city: "New York"
  },
  isHost: true,
  isLocationPublic: true
}
```

### Posts Collection
```javascript
{
  id: "post_abc123",
  ownerId: "user_123",
  content: "Amazing rooftop party last night! 🎵",
  topics: ["music", "party", "nightlife", "rooftop"],
  location: {
    lat: 40.7505,
    lng: -73.9934,
    name: "Sky Bar NYC"
  },
  images: ["https://example.com/image1.jpg"],
  likes: 45,
  createdAt: "2025-12-05T22:30:00Z",
  visibility: "public"
}
```

---

## 📱 React Native Integration

### Basic Usage
```typescript
import { usePersonalizedFeed } from '../hooks/usePersonalizedFeed';

export default function HomeScreen() {
  const { posts, loading, error, hasMore, loadMore, refresh } = usePersonalizedFeed({
    userId: user.id,
    limit: 20,
    includeDebug: true
  });

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      onEndReached={loadMore}
      onRefresh={refresh}
      refreshing={loading}
    />
  );
}
```

### Advanced Analytics
```typescript
import { useFeedAnalytics } from '../hooks/usePersonalizedFeed';

const { analytics, loadAnalytics } = useFeedAnalytics(user.id);

// Results:
// {
//   totalPosts: 156,
//   averageScore: 0.425,
//   followBasedCount: 45,
//   topicBasedCount: 78,
//   locationBasedCount: 23,
//   topTopics: [{"topic": "music", "count": 34}],
//   topLocations: [{"location": "NYC", "count": 12}]
// }
```

---

## ⚡ Performance Optimizations

### 1. **Structured Firestore Queries**
- Avoids fetching all posts from database
- Uses composite indexes for efficient filtering
- Batch operations for user data enrichment

### 2. **Hybrid Query Strategy**
```typescript
// Strategy breakdown:
- 60% from followed users (high relevance)
- 30% from topic matching (discovery)
- 30% from location proximity (hyperlocal)
// Total: ~120% to ensure good selection before final scoring
```

### 3. **Required Firestore Indexes**
```javascript
// Essential composite indexes:
posts: [ownerId ASC, createdAt DESC]
posts: [topics ARRAY, createdAt DESC]
posts: [visibility ASC, isActive ASC, createdAt DESC]
```

### 4. **Pagination & Cursors**
- Score-based cursors: `{score}_{timestamp}_{postId}`
- Consistent ordering across pages
- Prevents duplicate content on refresh

---

## 🧪 Testing & Validation

### 1. **Local Testing**

```bash
# Start Firebase emulators
firebase emulators:start --only functions,firestore

# Test Express server locally
npm run dev

# Run unit tests
npm test
```

### 2. **Sample API Calls**

```bash
# Cloud Functions
curl -X POST \
  https://us-central1-your-project.cloudfunctions.net/getPersonalizedFeed \
  -H 'Content-Type: application/json' \
  -d '{"data": {"userId": "user_123", "limit": 20}}'

# Express API
curl -X POST http://localhost:3000/api/feed/personalized \
  -H 'Content-Type: application/json' \
  -d '{"userId": "user_123", "limit": 20, "includeDebug": true}'
```

### 3. **Expected Response Format**

```json
{
  "posts": [
    {
      "id": "post_abc123",
      "content": "Amazing party! 🎵",
      "score": 0.85,
      "followScore": 1,
      "topicScore": 0.75,
      "distanceScore": 0.9,
      "ownerName": "Sarah Johnson",
      "ownerUsername": "sarahj_events",
      "distance": 2.3
    }
  ],
  "nextCursor": "0.85_1701829800000_post_abc123",
  "hasMore": true,
  "totalProcessed": 156,
  "debugInfo": {
    "followBasedCount": 45,
    "topicBasedCount": 78,
    "locationBasedCount": 23,
    "averageScore": 0.425
  }
}
```

---

## 🔒 Security & Best Practices

### 1. **Authentication**
- Validate Firebase Auth tokens
- User-scoped data access
- Rate limiting (100 requests/minute recommended)

### 2. **Privacy Controls**
- Respect `isLocationPublic` user settings
- Honor `visibility` post settings
- Implement block/mute functionality

### 3. **Data Validation**
- Validate location coordinates (-90≤lat≤90, -180≤lng≤180)
- Sanitize user inputs
- Limit array sizes (interests: max 20, following: max 5000)

---

## 🚀 Deployment Checklist

- [ ] Set up Firestore composite indexes
- [ ] Configure Firebase security rules
- [ ] Set environment variables
- [ ] Test with sample data
- [ ] Monitor performance metrics
- [ ] Set up error logging (Sentry/LogRocket)
- [ ] Configure CDN for image assets
- [ ] Implement caching layer (Redis) for production scale

---

## 🔄 Next Steps & Enhancements

1. **Machine Learning Integration**
   - User behavior tracking
   - Click-through rate optimization
   - Content quality scoring

2. **Advanced Features**
   - Real-time feed updates
   - A/B testing for scoring weights
   - Content prefetching

3. **Scale Optimizations**
   - Redis caching layer
   - Background job processing
   - CDN integration for media

---

## 📞 Support & Documentation

- **GitHub**: Repository with full source code
- **Firebase Console**: Monitor function performance
- **Error Tracking**: Integrated with your preferred service
- **Analytics**: Built-in debug information for feed optimization

This implementation is production-ready and can handle significant scale. The modular design allows easy customization of scoring algorithms and integration of additional ranking factors as your app grows.

---

**🎯 Ready to drop into your Clique app and start testing personalized feeds immediately!**