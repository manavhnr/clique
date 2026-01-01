import mongoose from 'mongoose';

export interface IFollow {
  followerId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IFollowMethods {
  // Instance methods can be added here if needed
}

export interface IFollowModel extends mongoose.Model<IFollow, {}, IFollowMethods> {
  getConnectionsCount(userId: string): Promise<{
    followers: number;
    following: number;
    connections: number;
  }>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  createFollow(followerId: string, followingId: string): Promise<IFollow>;
  removeFollow(followerId: string, followingId: string): Promise<any>;
}

const followSchema = new mongoose.Schema<IFollow, IFollowModel, IFollowMethods>({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false // We're using custom createdAt
});

// Compound index for efficient queries
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Index for follower count queries
followSchema.index({ followingId: 1, createdAt: -1 });

// Index for following count queries
followSchema.index({ followerId: 1, createdAt: -1 });

// Prevent self-following
followSchema.pre('save', function(next) {
  if (this.followerId.equals(this.followingId)) {
    const error = new Error('Users cannot follow themselves');
    (error as any).code = 'SELF_FOLLOW_ERROR';
    return next(error);
  }
  next();
});

// Static method to get connections count
followSchema.statics.getConnectionsCount = async function(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [followersResult, followingResult] = await Promise.all([
    this.countDocuments({ followingId: userObjectId }),
    this.countDocuments({ followerId: userObjectId })
  ]);

  return {
    followers: followersResult,
    following: followingResult,
    connections: followersResult + followingResult
  };
};

// Static method to check if user A follows user B
followSchema.statics.isFollowing = async function(followerId: string, followingId: string) {
  if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
    return false;
  }

  const follow = await this.findOne({
    followerId: new mongoose.Types.ObjectId(followerId),
    followingId: new mongoose.Types.ObjectId(followingId)
  });

  return !!follow;
};

// Static method to create follow relationship
followSchema.statics.createFollow = async function(followerId: string, followingId: string) {
  if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
    throw new Error('Invalid user IDs');
  }

  if (followerId === followingId) {
    throw new Error('Users cannot follow themselves');
  }

  const followerObjectId = new mongoose.Types.ObjectId(followerId);
  const followingObjectId = new mongoose.Types.ObjectId(followingId);

  // Check if follow relationship already exists
  const existingFollow = await this.findOne({
    followerId: followerObjectId,
    followingId: followingObjectId
  });

  if (existingFollow) {
    throw new Error('Follow relationship already exists');
  }

  const follow = new this({
    followerId: followerObjectId,
    followingId: followingObjectId
  });

  return await follow.save();
};

// Static method to remove follow relationship
followSchema.statics.removeFollow = async function(followerId: string, followingId: string) {
  if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
    throw new Error('Invalid user IDs');
  }

  const result = await this.deleteOne({
    followerId: new mongoose.Types.ObjectId(followerId),
    followingId: new mongoose.Types.ObjectId(followingId)
  });

  if (result.deletedCount === 0) {
    throw new Error('Follow relationship does not exist');
  }

  return result;
};

export const Follow = mongoose.model<IFollow, IFollowModel>('Follow', followSchema);