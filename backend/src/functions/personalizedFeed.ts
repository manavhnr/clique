/**
 * Firebase Cloud Functions implementation of personalized feed
 * Optimized for serverless deployment with Firestore queries
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
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

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Cloud Function: Get Personalized Feed
 * Combines follow-based, topic-based, and location-based scoring
 */
export const getPersonalizedFeed = functions.https.onCall(async (data: FeedRequest, context: any) => {
  try {
    // Validate authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { userId, limit: requestedLimit, cursor, includeDebug } = data;
    const limit = validateLimit(requestedLimit);

    console.log(`🔍 Generating personalized feed for user: ${userId}, limit: ${limit}`);

    // Get user data including following, interests, and location
    const user = await getUserData(userId);
    if (!user) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    // Validate user has location for distance-based scoring
    if (!isValidLocation(user.location)) {
      console.warn(`⚠️ User ${userId} has invalid location, distance scoring will be 0`);
    }

    // Parse cursor for pagination
    const cursorData = cursor ? parseCursor(cursor) : null;
    console.log(`📄 Cursor data:`, cursorData);

    // Get posts using hybrid approach (optimized queries + in-memory scoring)
    const feedPosts = await generateHybridFeed(user, limit * 2, cursorData); // Get extra for better selection

    // Sort by final score and apply pagination
    feedPosts.sort((a, b) => {
      // Primary sort: score descending
      if (b.score !== a.score) return b.score - a.score;
      
      // Secondary sort: timestamp descending (newer first)
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    // Apply limit and create response
    const finalPosts = feedPosts.slice(0, limit);
    const hasMore = feedPosts.length > limit;
    const nextCursor = hasMore && finalPosts.length > 0 
      ? createCursor(
          finalPosts[finalPosts.length - 1].score, 
          finalPosts[finalPosts.length - 1].createdAt,
          finalPosts[finalPosts.length - 1].id
        )
      : undefined;

    // Generate debug info if requested
    const debugInfo = includeDebug ? generateDebugInfo(feedPosts) : undefined;

    const response: PersonalizedFeedResponse = {
      posts: finalPosts,
      nextCursor,
      hasMore,
      totalProcessed: feedPosts.length,
      debugInfo
    };

    console.log(`✅ Feed generated: ${finalPosts.length} posts, hasMore: ${hasMore}`);
    return response;

  } catch (error) {
    console.error('❌ Error generating personalized feed:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to generate personalized feed');
  }
});

/**
 * Fetches user data including following, interests, and location
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
 * Hybrid approach: Structured queries + in-memory scoring
 * More efficient than fetching all posts
 */
async function generateHybridFeed(
  user: UserDocument, 
  targetCount: number,
  cursorData?: { score: number; timestamp: number; postId: string } | null
): Promise<FeedPost[]> {
  const allPosts: FeedPost[] = [];
  
  // Strategy 1: Get posts from followed users (highest priority)
  if (user.following.length > 0) {
    console.log(`📱 Fetching posts from ${user.following.length} followed users`);
    const followedPosts = await getPostsFromFollowedUsers(user, Math.ceil(targetCount * 0.6));
    allPosts.push(...followedPosts);
  }

  // Strategy 2: Get recent posts and filter by topics (medium priority)
  console.log(`🏷️ Fetching topic-based posts`);
  const topicPosts = await getTopicBasedPosts(user, Math.ceil(targetCount * 0.3));
  allPosts.push(...topicPosts);

  // Strategy 3: Get recent posts near user's location (lower priority)
  if (isValidLocation(user.location)) {
    console.log(`📍 Fetching location-based posts near (${user.location.lat}, ${user.location.lng})`);
    const locationPosts = await getLocationBasedPosts(user, Math.ceil(targetCount * 0.3));
    allPosts.push(...locationPosts);
  }

  // Remove duplicates and compute final scores
  const uniquePosts = removeDuplicatePosts(allPosts);
  return computePostScores(uniquePosts, user);
}

/**
 * Gets posts from users that the current user follows
 */
async function getPostsFromFollowedUsers(user: UserDocument, limit: number): Promise<FeedPost[]> {
  if (user.following.length === 0) return [];

  try {
    // Firestore 'in' queries are limited to 10 items, so we may need multiple queries
    const posts: FeedPost[] = [];
    const chunks = chunkArray(user.following, 10);

    for (const chunk of chunks) {
      const query = db.collection('posts')
        .where('ownerId', 'in', chunk)
        .orderBy('createdAt', 'desc')
        .limit(Math.ceil(limit / chunks.length));

      const snapshot = await query.get();
      snapshot.forEach((doc: any) => {
        posts.push({
          id: doc.id,
          ...doc.data() as PostDocument,
          score: 0, // Will be computed later
          followScore: 0,
          topicScore: 0,
          distanceScore: 0
        });
      });
    }

    return posts;
  } catch (error) {
    console.error('❌ Error fetching posts from followed users:', error);
    return [];
  }
}

/**
 * Gets posts that match user's interests
 */
async function getTopicBasedPosts(user: UserDocument, limit: number): Promise<FeedPost[]> {
  if (user.interests.length === 0) return [];

  try {
    // Get recent posts that have topics matching user interests
    const posts: FeedPost[] = [];
    
    // Since we can't do complex topic matching in Firestore, get recent posts and filter
    const query = db.collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(limit * 3); // Get more to filter down

    const snapshot = await query.get();
    let count = 0;

    snapshot.forEach(doc => {
      if (count >= limit) return;
      
      const postData = doc.data() as PostDocument;
      const topicScore = computeTopicScore(user.interests, postData.topics || []);
      
      // Only include posts with some topic relevance
      if (topicScore > 0) {
        posts.push({
          id: doc.id,
          ...postData,
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
    console.error('❌ Error fetching topic-based posts:', error);
    return [];
  }
}

/**
 * Gets posts near the user's location
 * Note: This is simplified - in production, you'd use geohashing for efficiency
 */
async function getLocationBasedPosts(user: UserDocument, limit: number): Promise<FeedPost[]> {
  try {
    // For demo, get recent posts and filter by distance
    // In production, use geohashing or Firestore's geoquery capabilities
    const query = db.collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(limit * 2); // Get more to filter by distance

    const snapshot = await query.get();
    const posts: FeedPost[] = [];
    let count = 0;

    snapshot.forEach(doc => {
      if (count >= limit) return;
      
      const postData = doc.data() as PostDocument;
      
      if (postData.location && isValidLocation(postData.location)) {
        const distance = calculateDistance(
          user.location.lat,
          user.location.lng,
          postData.location.lat,
          postData.location.lng
        );

        // Only include posts within reasonable distance
        if (distance <= FEED_CONFIG.MAX_DISTANCE_KM) {
          posts.push({
            id: doc.id,
            ...postData,
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
    console.error('❌ Error fetching location-based posts:', error);
    return [];
  }
}

/**
 * Removes duplicate posts and enriches with owner info
 */
function removeDuplicatePosts(posts: FeedPost[]): FeedPost[] {
  const seen = new Set<string>();
  return posts.filter(post => {
    if (seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  });
}

/**
 * Computes final scores for all posts
 */
async function computePostScores(posts: FeedPost[], user: UserDocument): Promise<FeedPost[]> {
  // Enrich posts with owner information in batches
  await enrichPostsWithOwnerInfo(posts);

  // Compute scores for each post
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

/**
 * Enriches posts with owner information using batch reads
 */
async function enrichPostsWithOwnerInfo(posts: FeedPost[]): Promise<void> {
  const ownerIds = [...new Set(posts.map(post => post.ownerId))];
  const ownerData = new Map<string, any>();

  // Batch read owner information
  for (let i = 0; i < ownerIds.length; i += 10) { // Firestore batch limit
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

  // Enrich posts with owner data
  posts.forEach(post => {
    const owner = ownerData.get(post.ownerId);
    if (owner) {
      post.ownerName = owner.name;
      post.ownerUsername = owner.username;
      post.ownerAvatar = owner.avatar;
    }
  });
}

/**
 * Generates debug information for feed analysis
 */
function generateDebugInfo(posts: FeedPost[]) {
  const followBased = posts.filter(p => p.followScore > 0).length;
  const topicBased = posts.filter(p => p.topicScore > 0).length;
  const locationBased = posts.filter(p => p.distanceScore > 0).length;
  const averageScore = posts.reduce((sum, p) => sum + p.score, 0) / posts.length;

  return {
    followBasedCount: followBased,
    topicBasedCount: topicBased,
    locationBasedCount: locationBased,
    averageScore: Number(averageScore.toFixed(3))
  };
}

/**
 * Utility function to chunk an array
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}