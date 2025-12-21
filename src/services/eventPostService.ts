// Event Post and Photo Collage Database Service
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { 
  Event,
  EventPost, 
  EventPostMedia,
  EventPhotoCollage,
  EventCollagePhoto,
  EventContributor,
  EventPhotoComment,
  UserEventActivity,
  COLLECTIONS
} from '../types/events';

export class EventPostService {
  // Create a new event post with photos
  static async createEventPost(
    userId: string,
    eventId: string,
    content: { text: string; hashtags: string[]; mentions: string[] },
    mediaFiles: File[] = []
  ): Promise<string> {
    try {
      const batch = writeBatch(db);
      const timestamp = new Date().toISOString();

      // Create the post document
      const postRef = doc(collection(db, COLLECTIONS.EVENT_POSTS));
      const postData: Omit<EventPost, 'id'> = {
        userId,
        eventId,
        content,
        media: [],
        stats: {
          replies: 0,
          retweets: 0,
          likes: 0,
          bookmarks: 0
        },
        interactions: {
          likedBy: [],
          retweetedBy: [],
          bookmarkedBy: [],
          repliedBy: []
        },
        createdAt: timestamp,
        updatedAt: timestamp,
        isDeleted: false,
        visibility: 'public'
      };

      batch.set(postRef, postData);

      // Upload and process media files
      const mediaData: EventPostMedia[] = [];
      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        
        // Upload file to storage (implement your file upload logic)
        const mediaUrl = await this.uploadMediaFile(file, eventId, userId);
        
        const mediaDoc: Omit<EventPostMedia, 'id'> = {
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: mediaUrl,
          aspectRatio: 16/9, // Calculate from actual file
          width: 1920, // Get from actual file
          height: 1080, // Get from actual file
          fileSize: file.size,
          mimeType: file.type,
          eventId,
          contributorId: userId,
          contributorName: '', // Get from user profile
          contributorUsername: '', // Get from user profile
          uploadedAt: timestamp,
          isApproved: true, // Auto-approve for now
          moderationStatus: 'approved'
        };

        const mediaRef = doc(collection(db, COLLECTIONS.EVENT_POST_MEDIA));
        batch.set(mediaRef, mediaDoc);
        mediaData.push({ ...mediaDoc, id: mediaRef.id });

        // Add to event photo collage
        await this.addPhotoToEventCollage(eventId, userId, mediaRef.id, mediaUrl);
      }

      // Update post with media references
      const mediaIds = mediaData.map(m => m.id);
      batch.update(postRef, { media: mediaIds });

      // Update event photo stats
      if (mediaData.length > 0) {
        const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
        batch.update(eventRef, {
          totalPhotos: increment(mediaData.length),
          updatedAt: timestamp
        });
      }

      await batch.commit();
      return postRef.id;
    } catch (error) {
      console.error('Error creating event post:', error);
      throw error;
    }
  }

  // Add photo to event collage
  static async addPhotoToEventCollage(
    eventId: string,
    userId: string,
    mediaId: string,
    mediaUrl: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      const timestamp = new Date().toISOString();

      // Check if collage exists, create if not
      const collageRef = doc(db, COLLECTIONS.EVENT_PHOTO_COLLAGES, eventId);
      const collageSnap = await getDoc(collageRef);

      if (!collageSnap.exists()) {
        // Create new collage
        const eventSnap = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId));
        const eventData = eventSnap.data() as Event;

        const collageData: Omit<EventPhotoCollage, 'id'> = {
          eventId,
          eventTitle: eventData.title,
          eventDate: eventData.date,
          hostId: eventData.hostId,
          photos: [],
          contributors: [],
          stats: {
            totalPhotos: 0,
            totalContributors: 0,
            totalLikes: 0,
            totalViews: 0
          },
          settings: {
            isPublic: true,
            allowGuestContributions: false,
            requireApproval: false,
            maxPhotosPerUser: 10
          },
          createdAt: timestamp,
          updatedAt: timestamp
        };

        batch.set(collageRef, collageData);
      }

      // Add photo to collage
      const photoRef = doc(collection(db, COLLECTIONS.EVENT_COLLAGE_PHOTOS));
      const photoData: Omit<EventCollagePhoto, 'id'> = {
        eventId,
        mediaId,
        url: mediaUrl,
        aspectRatio: 16/9, // Get from actual media
        contributorId: userId,
        contributor: {
          id: userId,
          name: '', // Get from user profile
          username: '', // Get from user profile
        },
        uploadedAt: timestamp,
        likes: 0,
        likedBy: [],
        comments: [],
        tags: [],
        isDeleted: false,
        moderationStatus: 'approved',
        timestamp: timestamp
      };

      batch.set(photoRef, photoData);

      // Update collage stats
      batch.update(collageRef, {
        'stats.totalPhotos': increment(1),
        updatedAt: timestamp
      });

      // Add/update contributor
      await this.updateEventContributor(eventId, userId);

      await batch.commit();
    } catch (error) {
      console.error('Error adding photo to collage:', error);
      throw error;
    }
  }

  // Update event contributor info
  static async updateEventContributor(eventId: string, userId: string): Promise<void> {
    const contributorId = `${eventId}_${userId}`;
    const contributorRef = doc(db, COLLECTIONS.EVENT_CONTRIBUTORS, contributorId);
    const contributorSnap = await getDoc(contributorRef);

    const timestamp = new Date().toISOString();

    if (contributorSnap.exists()) {
      // Update existing contributor
      await updateDoc(contributorRef, {
        'contributionStats.photosCount': increment(1),
        'contributionStats.lastPhotoAt': timestamp,
        updatedAt: timestamp
      });
    } else {
      // Create new contributor
      const contributorData: Omit<EventContributor, 'id'> = {
        userId,
        eventId,
        user: {
          id: userId,
          name: '', // Get from user profile
          username: '', // Get from user profile
        },
        contributionStats: {
          photosCount: 1,
          likesReceived: 0,
          firstPhotoAt: timestamp,
          lastPhotoAt: timestamp
        },
        role: 'attendee',
        joinedAt: timestamp,
        isActive: true
      };

      await updateDoc(contributorRef, contributorData);

      // Update collage contributor count
      const collageRef = doc(db, COLLECTIONS.EVENT_PHOTO_COLLAGES, eventId);
      await updateDoc(collageRef, {
        'stats.totalContributors': increment(1)
      });
    }
  }

  // Get event photo collage
  static async getEventPhotoCollage(eventId: string): Promise<{
    collage: EventPhotoCollage;
    photos: EventCollagePhoto[];
    contributors: EventContributor[];
  } | null> {
    try {
      // Get collage info
      const collageSnap = await getDoc(doc(db, COLLECTIONS.EVENT_PHOTO_COLLAGES, eventId));
      if (!collageSnap.exists()) {
        return null;
      }

      const collage = { id: collageSnap.id, ...collageSnap.data() } as EventPhotoCollage;

      // Get photos
      const photosQuery = query(
        collection(db, COLLECTIONS.EVENT_COLLAGE_PHOTOS),
        where('eventId', '==', eventId),
        where('isDeleted', '==', false),
        where('moderationStatus', '==', 'approved'),
        orderBy('uploadedAt', 'desc')
      );
      const photosSnap = await getDocs(photosQuery);
      const photos = photosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EventCollagePhoto[];

      // Get contributors
      const contributorsQuery = query(
        collection(db, COLLECTIONS.EVENT_CONTRIBUTORS),
        where('eventId', '==', eventId),
        where('isActive', '==', true),
        orderBy('contributionStats.photosCount', 'desc')
      );
      const contributorsSnap = await getDocs(contributorsQuery);
      const contributors = contributorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EventContributor[];

      return { collage, photos, contributors };
    } catch (error) {
      console.error('Error getting event photo collage:', error);
      throw error;
    }
  }

  // Get event feed (posts)
  static async getEventFeed(
    userId?: string,
    lastPostId?: string,
    limitCount: number = 20
  ): Promise<{
    posts: EventPost[];
    hasMore: boolean;
    nextCursor?: string;
  }> {
    try {
      let feedQuery = query(
        collection(db, COLLECTIONS.EVENT_POSTS),
        where('isDeleted', '==', false),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(limitCount + 1)
      );

      if (lastPostId) {
        const lastPostSnap = await getDoc(doc(db, COLLECTIONS.EVENT_POSTS, lastPostId));
        if (lastPostSnap.exists()) {
          feedQuery = query(feedQuery, startAfter(lastPostSnap));
        }
      }

      const feedSnap = await getDocs(feedQuery);
      const posts = feedSnap.docs.slice(0, limitCount).map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as EventPost[];

      const hasMore = feedSnap.docs.length > limitCount;
      const nextCursor = hasMore ? feedSnap.docs[limitCount - 1].id : undefined;

      return { posts, hasMore, nextCursor };
    } catch (error) {
      console.error('Error getting event feed:', error);
      throw error;
    }
  }

  // Like/Unlike post
  static async togglePostLike(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, COLLECTIONS.EVENT_POSTS, postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        throw new Error('Post not found');
      }

      const postData = postSnap.data() as EventPost;
      const isLiked = postData.interactions.likedBy.includes(userId);

      if (isLiked) {
        // Unlike
        await updateDoc(postRef, {
          'stats.likes': increment(-1),
          'interactions.likedBy': arrayRemove(userId),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Like
        await updateDoc(postRef, {
          'stats.likes': increment(1),
          'interactions.likedBy': arrayUnion(userId),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error toggling post like:', error);
      throw error;
    }
  }

  // Like/Unlike photo in collage
  static async togglePhotoLike(photoId: string, userId: string): Promise<void> {
    try {
      const photoRef = doc(db, COLLECTIONS.EVENT_COLLAGE_PHOTOS, photoId);
      const photoSnap = await getDoc(photoRef);
      
      if (!photoSnap.exists()) {
        throw new Error('Photo not found');
      }

      const photoData = photoSnap.data() as EventCollagePhoto;
      const isLiked = photoData.likedBy.includes(userId);

      if (isLiked) {
        // Unlike
        await updateDoc(photoRef, {
          likes: increment(-1),
          likedBy: arrayRemove(userId)
        });
      } else {
        // Like
        await updateDoc(photoRef, {
          likes: increment(1),
          likedBy: arrayUnion(userId)
        });
      }

      // Update contributor stats
      const contributorRef = doc(db, COLLECTIONS.EVENT_CONTRIBUTORS, `${photoData.eventId}_${photoData.contributorId}`);
      await updateDoc(contributorRef, {
        'contributionStats.likesReceived': increment(isLiked ? -1 : 1)
      });

    } catch (error) {
      console.error('Error toggling photo like:', error);
      throw error;
    }
  }

  // Helper function to upload media file (implement based on your storage solution)
  private static async uploadMediaFile(file: File, eventId: string, userId: string): Promise<string> {
    // Implement file upload to Firebase Storage or your preferred storage solution
    // Return the URL of the uploaded file
    const timestamp = Date.now();
    const fileName = `events/${eventId}/photos/${userId}_${timestamp}_${file.name}`;
    
    // TODO: Implement actual file upload
    // For now, return a placeholder URL
    return `https://storage.example.com/${fileName}`;
  }

  // Get event statistics
  static async getEventStats(eventId: string): Promise<{
    totalPhotos: number;
    totalContributors: number;
    totalLikes: number;
    totalPosts: number;
  }> {
    try {
      const collageSnap = await getDoc(doc(db, COLLECTIONS.EVENT_PHOTO_COLLAGES, eventId));
      
      if (!collageSnap.exists()) {
        return {
          totalPhotos: 0,
          totalContributors: 0,
          totalLikes: 0,
          totalPosts: 0
        };
      }

      const collageData = collageSnap.data() as EventPhotoCollage;
      
      // Get total posts count
      const postsQuery = query(
        collection(db, COLLECTIONS.EVENT_POSTS),
        where('eventId', '==', eventId),
        where('isDeleted', '==', false)
      );
      const postsSnap = await getDocs(postsQuery);

      return {
        totalPhotos: collageData.stats.totalPhotos,
        totalContributors: collageData.stats.totalContributors,
        totalLikes: collageData.stats.totalLikes,
        totalPosts: postsSnap.size
      };
    } catch (error) {
      console.error('Error getting event stats:', error);
      throw error;
    }
  }
}

export default EventPostService;