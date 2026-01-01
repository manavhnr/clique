/**
 * Express.js implementation of personalized feed API
 * Alternative to Cloud Functions for traditional server deployment
 */

import express from 'express';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import connectionsRoutes from '../routes/connections.routes';
import { 
  FeedRequest, 
  PersonalizedFeedResponse, 
  FeedPost, 
  UserDocument, 
  PostDocument,
  FEED_CONFIG 
} from '../types/feed';
import {
  computeFollowScore,
  computeTopicScore,
  computeDistanceScore,
  computeFinalScore,
  validateLimit,
  isValidLocation,
  createCursor,
  parseCursor,
  calculateDistance
} from '../utils/feedUtils';

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const app = express();

// Middleware
app.use(express.json());

// Register routes
app.use('/api/users', connectionsRoutes);

// CORS middleware
app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

/**
 * POST /api/feed/personalized
 * Main endpoint for personalized feed generation
 */
app.post('/api/feed/personalized', async (req: any, res: any) => {
  try {
    const startTime = Date.now();
    const { userId, limit: requestedLimit, cursor, includeDebug }: FeedRequest = req.body;
    
    // Validate request
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const limit = validateLimit(requestedLimit);
    console.log(`🔍 Generating personalized feed for user: ${userId}, limit: ${limit}`);

    // Get user data
    const user = await getUserData(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate user location
    if (!isValidLocation(user.location)) {
      console.warn(`⚠️ User ${userId} has invalid location, distance scoring will be 0`);
    }

    // Parse cursor
    const cursorData = cursor ? parseCursor(cursor) : null;
    console.log(`📄 Cursor data:`, cursorData);

    // Generate feed using hybrid approach
    const feedPosts = await generateHybridFeed(user, limit * 2, cursorData);

    // Sort by score and timestamp
    feedPosts.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      
      const aTime = a.createdAt?.toMillis?.() || a.createdAt?._seconds * 1000 || 0;
      const bTime = b.createdAt?.toMillis?.() || b.createdAt?._seconds * 1000 || 0;
      return bTime - aTime;
    });

    // Apply pagination
    const finalPosts = feedPosts.slice(0, limit);
    const hasMore = feedPosts.length > limit;
    const nextCursor = hasMore && finalPosts.length > 0 
      ? createCursor(
          finalPosts[finalPosts.length - 1].score, 
          finalPosts[finalPosts.length - 1].createdAt,
          finalPosts[finalPosts.length - 1].id
        )
      : undefined;

    // Generate debug info
    const debugInfo = includeDebug ? generateDebugInfo(feedPosts) : undefined;

    const response: PersonalizedFeedResponse = {
      posts: finalPosts,
      nextCursor,
      hasMore,
      totalProcessed: feedPosts.length,
      debugInfo
    };

    const processingTime = Date.now() - startTime;
    console.log(`✅ Feed generated in ${processingTime}ms: ${finalPosts.length} posts, hasMore: ${hasMore}`);

    res.json(response);

  } catch (error) {
    console.error('❌ Error generating personalized feed:', error);
    res.status(500).json({ 
      error: 'Failed to generate personalized feed',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * GET /api/feed/health
 * Health check endpoint
 */
app.get('/api/feed/health', (req: any, res: any) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      firebase: 'connected',
      firestore: 'connected'
    }
  });
});

/**
 * Fetches user data from Firestore
 */
async function getUserData(userId: string): Promise<UserDocument | null> {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return null;

    const userData = userDoc.data() as Partial<UserDocument>;
    return {
      id: userId,
      following: userData.following || [],
      interests: userData.interests || [],
      location: userData.location || { lat: 0, lng: 0 },
      name: userData.name || '',
      username: userData.username || '',
      avatar: userData.avatar
    };
  } catch (error) {
    console.error(`❌ Error fetching user data for ${userId}:`, error);
    return null;
  }
}

/**
 * Hybrid feed generation strategy
 */
async function generateHybridFeed(
  user: UserDocument, 
  targetCount: number,
  cursorData?: { score: number; timestamp: number; postId: string } | null
): Promise<FeedPost[]> {
  const allPosts: FeedPost[] = [];
  
  // Get posts from followed users
  if (user.following.length > 0) {
    console.log(`📱 Fetching posts from ${user.following.length} followed users`);
    const followedPosts = await getPostsFromFollowedUsers(user, Math.ceil(targetCount * 0.6));
    allPosts.push(...followedPosts);
  }

  // Get topic-based posts
  console.log(`🏷️ Fetching topic-based posts`);
  const topicPosts = await getTopicBasedPosts(user, Math.ceil(targetCount * 0.3));
  allPosts.push(...topicPosts);

  // Get location-based posts
  if (isValidLocation(user.location)) {
    console.log(`📍 Fetching location-based posts`);
    const locationPosts = await getLocationBasedPosts(user, Math.ceil(targetCount * 0.3));
    allPosts.push(...locationPosts);
  }

  // Remove duplicates and compute scores
  const uniquePosts = removeDuplicatePosts(allPosts);
  return await computePostScores(uniquePosts, user);
}

async function getPostsFromFollowedUsers(user: UserDocument, limit: number): Promise<FeedPost[]> {
  if (user.following.length === 0) return [];

  try {
    const posts: FeedPost[] = [];
    const chunks = chunkArray(user.following, 10); // Firestore 'in' limit

    for (const chunk of chunks) {
      const query = db.collection('posts')
        .where('ownerId', 'in', chunk)
        .orderBy('createdAt', 'desc')
        .limit(Math.ceil(limit / chunks.length));

      const snapshot = await query.get();
      snapshot.forEach((doc: any) => {
        const data = doc.data() as PostDocument;
        posts.push({
          ...data,
          id: doc.id,
          score: 0,
          followScore: 0,
          topicScore: 0,
          distanceScore: 0
        });
      });
    }

    return posts;
  } catch (error) {
    console.error('❌ Error fetching followed posts:', error);
    return [];
  }
}

async function getTopicBasedPosts(user: UserDocument, limit: number): Promise<FeedPost[]> {
  if (user.interests.length === 0) return [];

  try {
    const posts: FeedPost[] = [];
    const query = db.collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(limit * 3);

    const snapshot = await query.get();
    let count = 0;

    snapshot.forEach((doc: any) => {
      if (count >= limit) return;
      
      const data = doc.data() as PostDocument;
      const topicScore = computeTopicScore(user.interests, data.topics || []);
      
      if (topicScore > 0) {
        posts.push({
          ...data,
          id: doc.id,
          score: 0,
          followScore: 0,
          topicScore: 0,
          distanceScore: 0
        });
        count++;
      }
    });

    return posts;
  } catch (error) {
    console.error('❌ Error fetching topic posts:', error);
    return [];
  }
}

async function getLocationBasedPosts(user: UserDocument, limit: number): Promise<FeedPost[]> {
  try {
    const query = db.collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(limit * 2);

    const snapshot = await query.get();
    const posts: FeedPost[] = [];
    let count = 0;

    snapshot.forEach((doc: any) => {
      if (count >= limit) return;
      
      const data = doc.data() as PostDocument;
      
      if (data.location && isValidLocation(data.location)) {
        const distance = calculateDistance(
          user.location.lat,
          user.location.lng,
          data.location.lat,
          data.location.lng
        );

        if (distance <= FEED_CONFIG.MAX_DISTANCE_KM) {
          posts.push({
            ...data,
            id: doc.id,
            score: 0,
            followScore: 0,
            topicScore: 0,
            distanceScore: 0,
            distance
          });
          count++;
        }
      }
    });

    return posts;
  } catch (error) {
    console.error('❌ Error fetching location posts:', error);
    return [];
  }
}

function removeDuplicatePosts(posts: FeedPost[]): FeedPost[] {
  const seen = new Set<string>();
  return posts.filter(post => {
    if (seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  });
}

async function computePostScores(posts: FeedPost[], user: UserDocument): Promise<FeedPost[]> {
  await enrichPostsWithOwnerInfo(posts);

  return posts.map(post => {
    const followScore = computeFollowScore(user.following, post.ownerId);
    const topicScore = computeTopicScore(user.interests, post.topics || []);
    const distanceScore = isValidLocation(user.location) && isValidLocation(post.location)
      ? computeDistanceScore(user.location, post.location)
      : 0;
    
    const finalScore = computeFinalScore(followScore, topicScore, distanceScore);

    return {
      ...post,
      followScore,
      topicScore,
      distanceScore,
      score: finalScore
    };
  });
}

async function enrichPostsWithOwnerInfo(posts: FeedPost[]): Promise<void> {
  const ownerIds = [...new Set(posts.map(post => post.ownerId))];
  const ownerData = new Map<string, any>();

  for (let i = 0; i < ownerIds.length; i += 10) {
    const batch = ownerIds.slice(i, i + 10);
    const userDocs = await Promise.all(
      batch.map(id => db.collection('users').doc(id).get())
    );

    userDocs.forEach((doc: any, index: number) => {
      if (doc.exists) {
        const userData = doc.data();
        ownerData.set(batch[index], {
          name: userData?.name || 'Unknown',
          username: userData?.username || '',
          avatar: userData?.avatar
        });
      }
    });
  }

  posts.forEach(post => {
    const owner = ownerData.get(post.ownerId);
    if (owner) {
      post.ownerName = owner.name;
      post.ownerUsername = owner.username;
      post.ownerAvatar = owner.avatar;
    }
  });
}

function generateDebugInfo(posts: FeedPost[]) {
  const followBased = posts.filter(p => p.followScore > 0).length;
  const topicBased = posts.filter(p => p.topicScore > 0).length;
  const locationBased = posts.filter(p => p.distanceScore > 0).length;
  const averageScore = posts.length > 0 
    ? posts.reduce((sum, p) => sum + p.score, 0) / posts.length 
    : 0;

  return {
    followBasedCount: followBased,
    topicBasedCount: topicBased,
    locationBasedCount: locationBased,
    averageScore: Number(averageScore.toFixed(3))
  };
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Personalized Feed API server running on port ${PORT}`);
});

export default app;