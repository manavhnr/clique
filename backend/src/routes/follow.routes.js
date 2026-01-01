const express = require('express');
const router = express.Router();
const {
  getConnectionsCount,
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowers,
  getFollowing
} = require('../controllers/follow.controller');

// Middleware for authentication (optional - implement based on your auth system)
// const auth = require('../middleware/auth');

/**
 * @route   GET /api/users/:userId/connections
 * @desc    Get connections count (followers + following) for a user
 * @access  Public
 */
router.get('/:userId/connections', getConnectionsCount);

/**
 * @route   POST /api/users/:userId/follow
 * @desc    Follow a user
 * @access  Private
 * @note    Requires authentication middleware
 */
// router.post('/:userId/follow', auth, followUser);
router.post('/:userId/follow', followUser); // Remove auth middleware if not implemented

/**
 * @route   DELETE /api/users/:userId/follow
 * @desc    Unfollow a user
 * @access  Private
 * @note    Requires authentication middleware
 */
// router.delete('/:userId/follow', auth, unfollowUser);
router.delete('/:userId/follow', unfollowUser); // Remove auth middleware if not implemented

/**
 * @route   GET /api/users/:userId/follow/status
 * @desc    Check if current user follows target user
 * @access  Private
 * @note    Requires authentication middleware
 */
// router.get('/:userId/follow/status', auth, getFollowStatus);
router.get('/:userId/follow/status', getFollowStatus); // Remove auth middleware if not implemented

/**
 * @route   GET /api/users/:userId/followers
 * @desc    Get user's followers list with pagination
 * @access  Public
 */
router.get('/:userId/followers', getFollowers);

/**
 * @route   GET /api/users/:userId/following
 * @desc    Get user's following list with pagination
 * @access  Public
 */
router.get('/:userId/following', getFollowing);

module.exports = router;