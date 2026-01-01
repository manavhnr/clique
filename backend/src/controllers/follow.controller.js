const Follow = require('../models/follow.model');
const mongoose = require('mongoose');

/**
 * Get connections count for a user
 * @route GET /api/users/:userId/connections
 * @access Public
 */
const getConnectionsCount = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Get connections count
    const connectionsData = await Follow.getConnectionsCount(userId);

    res.status(200).json({
      success: true,
      data: connectionsData
    });

  } catch (error) {
    console.error('Error fetching connections count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connections count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Follow a user
 * @route POST /api/users/:userId/follow
 * @access Private (requires authentication)
 */
const followUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to follow
    const followerId = req.user?.id; // Current authenticated user

    if (!followerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Create follow relationship
    const follow = await Follow.createFollow(followerId, userId);

    res.status(201).json({
      success: true,
      message: 'Successfully followed user',
      data: {
        followId: follow._id,
        followerId: follow.followerId,
        followingId: follow.followingId,
        createdAt: follow.createdAt
      }
    });

  } catch (error) {
    console.error('Error following user:', error);

    if (error.message === 'Users cannot follow themselves') {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    if (error.message === 'Follow relationship already exists') {
      return res.status(409).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to follow user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Unfollow a user
 * @route DELETE /api/users/:userId/follow
 * @access Private (requires authentication)
 */
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to unfollow
    const followerId = req.user?.id; // Current authenticated user

    if (!followerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Remove follow relationship
    await Follow.removeFollow(followerId, userId);

    res.status(200).json({
      success: true,
      message: 'Successfully unfollowed user'
    });

  } catch (error) {
    console.error('Error unfollowing user:', error);

    if (error.message === 'Follow relationship does not exist') {
      return res.status(404).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to unfollow user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Check if current user follows target user
 * @route GET /api/users/:userId/follow/status
 * @access Private (requires authentication)
 */
const getFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params; // Target user
    const followerId = req.user?.id; // Current authenticated user

    if (!followerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Check follow status
    const isFollowing = await Follow.isFollowing(followerId, userId);

    res.status(200).json({
      success: true,
      data: {
        isFollowing,
        followerId,
        followingId: userId
      }
    });

  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check follow status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's followers list
 * @route GET /api/users/:userId/followers
 * @access Public
 */
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const followers = await Follow.find({ followingId: userId })
      .populate('followerId', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalCount = await Follow.countDocuments({ followingId: userId });

    res.status(200).json({
      success: true,
      data: {
        followers: followers.map(f => f.followerId),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          hasNext: pageNum * limitNum < totalCount,
          hasPrev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch followers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's following list
 * @route GET /api/users/:userId/following
 * @access Public
 */
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const following = await Follow.find({ followerId: userId })
      .populate('followingId', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalCount = await Follow.countDocuments({ followerId: userId });

    res.status(200).json({
      success: true,
      data: {
        following: following.map(f => f.followingId),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          hasNext: pageNum * limitNum < totalCount,
          hasPrev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch following',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getConnectionsCount,
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowers,
  getFollowing
};