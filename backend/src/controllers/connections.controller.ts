import { Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';

// Helper function to get Firestore instance (lazy initialization)
const getDb = () => getFirestore();

interface ConnectionsResponse {
  followers: number;
  following: number;
  connections: number;
}

interface FollowRequest {
  targetUserId: string;
}

interface FollowStatus {
  isFollowing: boolean;
}

interface FollowersListResponse {
  followers: Array<{
    userId: string;
    followedAt: string;
  }>;
  hasMore: boolean;
  nextCursor?: string;
}

interface FollowingListResponse {
  following: Array<{
    userId: string;
    followedAt: string;
  }>;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * GET /api/users/:userId/connections
 * Get the total connections count for a user (followers + following)
 */
export const getConnectionsCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const sanitizedUserId = userId.trim();

    if (!sanitizedUserId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Execute both queries in parallel for better performance
    const [followersSnapshot, followingSnapshot] = await Promise.all([
      // Count users who follow this user (followers)
      getDb().collection('follows')
        .where('followingId', '==', sanitizedUserId)
        .get(),
      
      // Count users this user follows (following)
      getDb().collection('follows')
        .where('followerId', '==', sanitizedUserId)
        .get()
    ]);

    const followers = followersSnapshot.size;
    const following = followingSnapshot.size;
    const connections = followers + following;

    const response: ConnectionsResponse = {
      followers,
      following,
      connections
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching connections count:', error);
    res.status(500).json({ 
      error: 'Failed to fetch connections count',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

/**
 * POST /api/users/:userId/follow
 * Follow another user
 */
export const followUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const followerId = req.params.userId; // User who wants to follow
    const { targetUserId }: FollowRequest = req.body; // User to be followed

    // Input validation
    if (!followerId || !targetUserId) {
      res.status(400).json({ error: 'Both followerId and targetUserId are required' });
      return;
    }

    if (followerId === targetUserId) {
      res.status(400).json({ error: 'Cannot follow yourself' });
      return;
    }

    const sanitizedFollowerId = followerId.trim();
    const sanitizedTargetUserId = targetUserId.trim();

    // Check if the relationship already exists
    const existingFollowSnapshot = await getDb().collection('follows')
      .where('followerId', '==', sanitizedFollowerId)
      .where('followingId', '==', sanitizedTargetUserId)
      .get();

    if (!existingFollowSnapshot.empty) {
      res.status(409).json({ error: 'Already following this user' });
      return;
    }

    // Create the follow relationship
    const followDocRef = await getDb().collection('follows').add({
      followerId: sanitizedFollowerId,
      followingId: sanitizedTargetUserId,
      createdAt: new Date(),
      status: 'active'
    });

    console.log(`✅ User ${sanitizedFollowerId} now follows ${sanitizedTargetUserId} (doc: ${followDocRef.id})`);

    res.status(201).json({ 
      success: true,
      message: 'Successfully followed user',
      followId: followDocRef.id
    });

  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ 
      error: 'Failed to follow user',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

/**
 * DELETE /api/users/:userId/follow
 * Unfollow a user
 */
export const unfollowUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const followerId = req.params.userId; // User who wants to unfollow
    const { targetUserId }: FollowRequest = req.body; // User to be unfollowed

    // Input validation
    if (!followerId || !targetUserId) {
      res.status(400).json({ error: 'Both followerId and targetUserId are required' });
      return;
    }

    const sanitizedFollowerId = followerId.trim();
    const sanitizedTargetUserId = targetUserId.trim();

    // Find the follow relationship
    const followSnapshot = await getDb().collection('follows')
      .where('followerId', '==', sanitizedFollowerId)
      .where('followingId', '==', sanitizedTargetUserId)
      .get();

    if (followSnapshot.empty) {
      res.status(404).json({ error: 'Not currently following this user' });
      return;
    }

    // Delete the follow relationship(s) using batch
    const batch = getDb().batch();
    followSnapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    console.log(`✅ User ${sanitizedFollowerId} unfollowed ${sanitizedTargetUserId}`);

    res.json({ 
      success: true,
      message: 'Successfully unfollowed user'
    });

  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ 
      error: 'Failed to unfollow user',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

/**
 * GET /api/users/:userId/follow-status/:targetUserId
 * Check if a user is following another user
 */
export const getFollowStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const targetUserId = req.params.targetUserId;

    if (!userId || !targetUserId) {
      res.status(400).json({ error: 'Both userId and targetUserId are required' });
      return;
    }

    const sanitizedUserId = userId.trim();
    const sanitizedTargetUserId = targetUserId.trim();

    // Check if the follow relationship exists
    const followSnapshot = await getDb().collection('follows')
      .where('followerId', '==', sanitizedUserId)
      .where('followingId', '==', sanitizedTargetUserId)
      .where('status', '==', 'active')
      .get();

    const response: FollowStatus = {
      isFollowing: !followSnapshot.empty
    };

    res.json(response);

  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ 
      error: 'Failed to check follow status',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

/**
 * GET /api/users/:userId/followers
 * Get list of users who follow this user
 */
export const getFollowers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const cursor = req.query.cursor as string;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const sanitizedUserId = userId.trim();
    const limitNum = Math.min(Math.max(limit, 1), 100); // Ensure limit is between 1 and 100

    let query = getDb().collection('follows')
      .where('followingId', '==', sanitizedUserId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(limitNum);

    const snapshot = await query.get();
    
    const followers: Array<{
      userId: string;
      followedAt: string;
    }> = [];

    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      followers.push({
        userId: data.followerId,
        followedAt: data.createdAt.toISOString()
      });
    });

    const response: FollowersListResponse = {
      followers,
      hasMore: false, // Simplified for now
      nextCursor: undefined
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch followers',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

/**
 * GET /api/users/:userId/following
 * Get list of users that this user follows
 */
export const getFollowing = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const cursor = req.query.cursor as string;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const sanitizedUserId = userId.trim();
    const limitNum = Math.min(Math.max(limit, 1), 100); // Ensure limit is between 1 and 100

    let query = getDb().collection('follows')
      .where('followerId', '==', sanitizedUserId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(limitNum);

    const snapshot = await query.get();
    
    const following: Array<{
      userId: string;
      followedAt: string;
    }> = [];

    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      following.push({
        userId: data.followingId,
        followedAt: data.createdAt.toISOString()
      });
    });

    const response: FollowingListResponse = {
      following,
      hasMore: false, // Simplified for now
      nextCursor: undefined
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({ 
      error: 'Failed to fetch following list',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};