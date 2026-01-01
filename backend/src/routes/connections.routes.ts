import { Router } from 'express';
import {
  getConnectionsCount,
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowers,
  getFollowing
} from '../controllers/connections.controller';

const router = Router();

// Middleware for authentication (implement based on your Firebase auth system)
// import { authenticateFirebaseToken } from '../middleware/auth';

/**
 * @route   GET /api/users/:userId/connections
 * @desc    Get connections count (followers + following) for a user using Firestore
 * @access  Public
 */
router.get('/:userId/connections', getConnectionsCount);

/**
 * @route   POST /api/users/:userId/follow
 * @desc    Follow a user using Firestore
 * @access  Private (requires Firebase authentication)
 */
// router.post('/:userId/follow', authenticateFirebaseToken, followUser);
router.post('/:userId/follow', followUser); // Remove auth middleware if not implemented

/**
 * @route   DELETE /api/users/:userId/follow
 * @desc    Unfollow a user using Firestore
 * @access  Private (requires Firebase authentication)
 */
// router.delete('/:userId/follow', authenticateFirebaseToken, unfollowUser);
router.delete('/:userId/follow', unfollowUser); // Remove auth middleware if not implemented

/**
 * @route   GET /api/users/:userId/follow/status
 * @desc    Check if current user follows target user using Firestore
 * @access  Private (requires Firebase authentication)
 */
// router.get('/:userId/follow/status', authenticateFirebaseToken, getFollowStatus);
router.get('/:userId/follow/status', getFollowStatus); // Remove auth middleware if not implemented

/**
 * @route   GET /api/users/:userId/followers
 * @desc    Get user's followers list with pagination using Firestore
 * @access  Public
 */
router.get('/:userId/followers', getFollowers);

/**
 * @route   GET /api/users/:userId/following
 * @desc    Get user's following list with pagination using Firestore
 * @access  Public
 */
router.get('/:userId/following', getFollowing);

export default router;