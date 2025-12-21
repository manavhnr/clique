import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { 
  getHomepagePosts,
  likePost,
  unlikePost,
  fetchUserLikedState,
  createPost
} from '../services/postService';
import { createSamplePost } from '../utils/createSamplePost';
import { debugPostSystem, initializeSampleData } from '../utils/debugPosts';
import CommentBottomSheet from '../components/CommentBottomSheetNew';
import type { Post } from '../types/posts';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  
  // State management
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLikedPosts, setUserLikedPosts] = useState<Set<string>>(new Set());
  
  // Image popup state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  
  // Comments modal state
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');

  // Load posts on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getHomepagePosts();
      
      if (fetchedPosts.length === 0 && user?.id) {
        setPosts([]);
        return;
      }
      
      setPosts(fetchedPosts);
      
      // Load user's liked posts
      if (user?.id && fetchedPosts.length > 0) {
        const likedPostsSet = new Set<string>();
        for (const post of fetchedPosts) {
          try {
            const isLiked = await fetchUserLikedState(post.postId, user.id);
            if (isLiked) {
              likedPostsSet.add(post.postId);
            }
          } catch (error) {
            console.warn(`Failed to check liked state for post ${post.postId}`);
          }
        }
        setUserLikedPosts(likedPostsSet);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLikePress = async (postId: string) => {
    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please log in to like posts.');
      return;
    }

    try {
      const isCurrentlyLiked = userLikedPosts.has(postId);
      
      if (isCurrentlyLiked) {
        // Unlike post
        await unlikePost(postId, user.id);
        setUserLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        
        // Update local post stats
        setPosts(prev => prev.map(post => 
          post.postId === postId 
            ? { ...post, likeCount: Math.max(0, post.likeCount - 1) }
            : post
        ));
      } else {
        // Like post
        await likePost(postId, user.id);
        setUserLikedPosts(prev => new Set(prev).add(postId));
        
        // Update local post stats
        setPosts(prev => prev.map(post => 
          post.postId === postId 
            ? { ...post, likeCount: post.likeCount + 1 }
            : post
        ));
      }
      
    } catch (error) {
      console.error('Error handling like:', error);
      
      // Reset local state and refresh on error
      await loadPosts();
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already liked')) {
        Alert.alert('Already Liked', 'You have already liked this post.');
      } else if (errorMessage.includes('not liked')) {
        Alert.alert('Not Liked', 'You have not liked this post yet.');
      } else {
        Alert.alert('Error', 'Failed to update like. Please try again.');
      }
    }
  };

  const handleCommentPress = (postId: string) => {
    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please log in to view comments.');
      return;
    }
    setSelectedPostId(postId);
    setCommentsModalVisible(true);
  };

  const handleSharePress = (postId: string) => {
    Alert.alert('Share', 'Share feature coming soon!');
  };

  const handleBookmarkPress = (postId: string) => {
    Alert.alert('Bookmark', 'Bookmark feature coming soon!');
  };

  const handleCreateSamplePost = async () => {
    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please log in to create posts.');
      return;
    }

    Alert.alert(
      'Post Actions',
      'Choose an action:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Simple Test Post',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('Creating simple test post...');
              
              // Create a very basic post
              const postId = await createPost(
                user.id,
                null,
                'This is a test post from Clique! 🎉 Testing the like functionality.',
                ['https://picsum.photos/400/400?random=1'],
                'public'
              );
              
              console.log('Created post with ID:', postId);
              
              Alert.alert('Success', `Test post created! ID: ${postId.substring(0, 8)}...`);
              await loadPosts(); // Refresh the feed
            } catch (error) {
              console.error('Error creating test post:', error);
              Alert.alert('Error', 'Failed to create test post. Check console for details.');
            } finally {
              setLoading(false);
            }
          }
        },
        {
          text: 'Create Multiple Posts',
          onPress: async () => {
            try {
              setLoading(true);
              await initializeSampleData(user.id);
              Alert.alert('Success', 'Sample posts created!');
              await loadPosts(); // Refresh the feed
            } catch (error) {
              Alert.alert('Error', 'Failed to create posts. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        },
        {
          text: 'Debug System',
          onPress: async () => {
            try {
              await debugPostSystem(user.id);
              
              // Also debug the database state
              if (posts.length > 0) {
                console.log('Posts available for debugging:', posts.length);
              }
              
              Alert.alert('Debug Complete', 'Check console for detailed debug information.');
            } catch (error) {
              Alert.alert('Error', 'Debug failed. Check console for details.');
            }
          }
        },
        {
          text: 'Test Like First Post',
          onPress: async () => {
            if (posts.length === 0) {
              Alert.alert('No Posts', 'Create a post first.');
              return;
            }
            
            const firstPost = posts[0];
            console.log('🧪 Testing like functionality on first post:', firstPost.postId);
            await handleLikePress(firstPost.postId);
          }
        }
      ]
    );
  };

  const handleChatPress = () => {
    navigation.navigate('ChatList');
  };

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Chat Icon */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clique</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.createPostButton}
            onPress={handleCreateSamplePost}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={handleChatPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Real Firestore Posts Feed */}
        {posts.map((post) => (
          <View key={post.postId} style={styles.postContainer}>
            {/* Post Header */}
            <View style={styles.postHeader}>
              <View style={styles.hostInfo}>
                <Image 
                  source={{ uri: 'https://picsum.photos/100/100?random=21' }} 
                  style={styles.hostAvatar} 
                />
                <View style={styles.hostDetails}>
                  <View style={styles.hostNameContainer}>
                    <Text style={styles.hostName}>User {post.authorId.slice(0, 8)}</Text>
                    <Ionicons name="checkmark-circle" size={16} color="#6366F1" style={styles.verifiedIcon} />
                  </View>
                  <Text style={styles.hostUsername}>@user_{post.authorId.slice(0, 6)}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Post Media */}
            <View style={styles.collageContainer}>
              {post.mediaUrls.length > 0 ? (
                <View style={styles.collageGrid}>
                  {post.mediaUrls.slice(0, 4).map((url, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.collagePhoto,
                        index === 0 && styles.topLeft,
                        index === 1 && styles.topRight,
                        index === 2 && styles.bottomLeft,
                        index === 3 && styles.bottomRight,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleImagePress(url)}
                    >
                      <Image source={{ uri: url }} style={styles.collageImage} />
                      
                      {/* More Photos Indicator */}
                      {index === 3 && post.mediaUrls.length > 4 && (
                        <View style={styles.morePhotosOverlay}>
                          <Text style={styles.morePhotosText}>+{post.mediaUrls.length - 4}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noMediaContainer}>
                  <Text style={styles.noMediaText}>📸 No photos shared yet</Text>
                </View>
              )}
            </View>

            {/* Post Actions */}
            <View style={styles.postActions}>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleLikePress(post.postId)}
                >
                  <Ionicons 
                    name={userLikedPosts.has(post.postId) ? "heart" : "heart-outline"} 
                    size={24} 
                    color={userLikedPosts.has(post.postId) ? "#EF4444" : "#111827"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleCommentPress(post.postId)}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#111827" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleSharePress(post.postId)}
                >
                  <Ionicons name="paper-plane-outline" size={24} color="#111827" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.bookmarkButton}
                onPress={() => handleBookmarkPress(post.postId)}
              >
                <Ionicons name="bookmark-outline" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Post Stats */}
            <View style={styles.postStats}>
              <Text style={styles.likesText}>{post.likeCount} likes</Text>
              <Text style={styles.statsText}>
                {post.commentCount} comments • {post.shareCount} shares
              </Text>
            </View>

            {/* Post Content */}
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>
                <Text style={styles.hostNameInline}>@user_{post.authorId.slice(0, 6)}</Text>
                {' '}{post.text.length > 50 ? `${post.text.slice(0, 50)}...` : post.text}
              </Text>
              {post.text.length > 50 && (
                <Text style={styles.eventDescription}>{post.text}</Text>
              )}
            </View>

            {/* Comments Preview */}
            {post.commentCount > 0 && (
              <TouchableOpacity 
                style={styles.commentsSection}
                onPress={() => handleCommentPress(post.postId)}
              >
                <Text style={styles.viewCommentsText}>View all {post.commentCount} comments</Text>
              </TouchableOpacity>
            )}

            {/* Time Posted */}
            <Text style={styles.timePosted}>
              {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Recently'}
            </Text>
          </View>
        ))}

        {posts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="camera-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No posts to show yet</Text>
            <Text style={styles.emptySubtext}>Start following people or create your first post!</Text>
          </View>
        )}
      </ScrollView>

      {/* Image Popup Modal */}
      {selectedImage && (
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeImageModal}
        >
          <TouchableOpacity 
            style={styles.imageModalOverlay}
            activeOpacity={1}
            onPress={closeImageModal}
          >
            <View style={styles.imageModalContainer}>
              <Image 
                source={{ uri: selectedImage }}
                style={styles.expandedImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Comments Modal */}
      <CommentBottomSheet
        visible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        postId={selectedPostId}
        userId={user?.id || ''}
        postAuthorId={posts.find(p => p.postId === selectedPostId)?.authorId || ''}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createPostButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  chatButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    color: '#000000',
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  emptyText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  noMediaContainer: {
    width: width,
    height: 200,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMediaText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  // Instagram-style post styles
  postContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  hostDetails: {
    flex: 1,
  },
  hostNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 4,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  hostUsername: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  // Collaborative Collage Styles
  collageContainer: {
    backgroundColor: '#000000',
  },
  collageGrid: {
    width: width,
    height: width,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  collagePhoto: {
    width: width / 2,
    height: width / 2,
    position: 'relative',
  },
  topLeft: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000000',
  },
  topRight: {
    borderBottomWidth: 1,
    borderColor: '#000000',
  },
  bottomLeft: {
    borderRightWidth: 1,
    borderColor: '#000000',
  },
  bottomRight: {
    // No borders needed
  },
  collageImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contributorOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  contributorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  morePhotosOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contributorsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  contributorAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contributorAvatarSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginLeft: -4,
  },
  moreContributors: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -4,
  },
  moreContributorsText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  contributorsText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  eventImage: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 16,
    padding: 4,
  },
  bookmarkButton: {
    padding: 4,
  },
  postStats: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statsText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  eventDetails: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  eventTitle: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    marginBottom: 4,
  },
  hostNameInline: {
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventMeta: {
    gap: 6,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  viewCommentsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  timePosted: {
    fontSize: 10,
    color: '#9CA3AF',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContainer: {
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedImage: {
    width: '100%',
    height: '100%',
  },
});