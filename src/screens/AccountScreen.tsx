import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import type { Post } from '../services/postService';
import { getHomepagePosts } from '../services/postService';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { DEFAULT_AVATAR } from '../constants/images';
import { API_CONFIG } from '../constants/api';
import { connectionsService } from '../services/connectionsService';

const { width } = Dimensions.get('window');
const postSize = (width - 60) / 3;

interface AccountScreenParams {
  userId?: string;
  userName?: string;
}

export default function AccountScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { user, logout, becomeHost } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [profileUser, setProfileUser] = useState(user);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [connectionsData, setConnectionsData] = useState<{
    followers: number;
    following: number;
    connections: number;
  } | null>(null);
  const [loadingConnections, setLoadingConnections] = useState(true);
  
  const params = route.params as AccountScreenParams | undefined;
  const isOwnProfile = !params?.userId || params.userId === user?.id;
  const targetUserId = params?.userId || user?.id;
  
  // Profile context detection
  const profileUserId = params?.userId || user?.id;
  const authUserId = user?.id;
  const isViewingOwnProfile = profileUserId === authUserId;

  const displayUser = profileUser || user;
  const displayName = isViewingOwnProfile ? displayUser?.name || 'User Name' : params?.userName || displayUser?.name || 'User';

  // Enhanced stats calculation with conditional display
  const postsCount = userPosts.filter(post => post.authorId === (isViewingOwnProfile ? user?.id : profileUserId)).length;
  const eventsHosted = displayUser?.isHost ? Math.floor(Math.random() * 20) + 5 : 0;
  const totalAttendees = displayUser?.isHost ? Math.floor(Math.random() * 500) + 100 : 0;
  const hostRating = displayUser?.isHost ? (4.2 + Math.random() * 0.6) : 0;
  const followersCount = connectionsData?.followers ?? 0;
  const followingCount = connectionsData?.following ?? 0;
  
  // Fetch user's posts on mount
  useEffect(() => {
    const loadUserPosts = async () => {
      try {
        setLoadingPosts(true);
        const posts = await getHomepagePosts();
        // Filter posts by the profile user (own posts or target user's posts)
        const targetUserId = isViewingOwnProfile ? user?.id : profileUserId;
        const userSpecificPosts = posts.filter(post => post.authorId === targetUserId);
        setUserPosts(userSpecificPosts);
      } catch (error) {
        console.error('Error loading user posts:', error);
        setUserPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadUserPosts();
  }, [user?.id, profileUserId, isViewingOwnProfile]);
  
  // Fetch connections data
  useEffect(() => {
    const fetchConnectionsData = async () => {
      if (!profileUserId) return;
      
      try {
        setLoadingConnections(true);
        const data = await connectionsService.getConnectionsCount(profileUserId);
        setConnectionsData(data);
      } catch (error) {
        // Service handles fallbacks gracefully, so this should rarely happen
        console.warn('Connections service failed unexpectedly, using default values');
        setConnectionsData({ followers: 0, following: 0, connections: 0 });
      } finally {
        setLoadingConnections(false);
      }
    };
    
    fetchConnectionsData();
  }, [profileUserId]);
  
  // Stats visibility logic
  const statsToShow = [];
  if (isViewingOwnProfile) {
    if (postsCount > 0) statsToShow.push({ key: 'cliques', value: postsCount, label: 'Cliques', icon: 'images-outline' });
    
    // Always show connections count from API data or loading state
    if (loadingConnections) {
      statsToShow.push({ key: 'connections', value: '...', label: 'Connections', icon: 'people-outline' });
    } else if (connectionsData !== null) {
      statsToShow.push({ key: 'connections', value: connectionsData.connections, label: 'Connections', icon: 'people-outline' });
    }
    
    if (eventsHosted > 0) statsToShow.push({ key: 'events', value: eventsHosted, label: 'Events', icon: 'calendar-outline' });
  } else {
    if (eventsHosted > 0) statsToShow.push({ key: 'hosted', value: eventsHosted, label: 'Events Hosted', icon: 'calendar-outline' });
    if (totalAttendees > 0) statsToShow.push({ key: 'attendees', value: totalAttendees, label: 'Attendees', icon: 'people-outline' });
    if (displayUser?.isHost && hostRating > 0) statsToShow.push({ key: 'rating', value: hostRating.toFixed(1), label: 'Host Rating', icon: 'star-outline' });
  }

  const handleBecomeHost = async () => {
    const result = await becomeHost();
    if (result.success) {
      Alert.alert('Success', 'You are now a host! You can create events.');
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleStartConversation = async () => {
    if (!user?.id || !targetUserId || startingConversation) return;
    
    setStartingConversation(true);
    try {
      const conversationId = await chatService.startConversation(user.id, targetUserId);
      navigation.navigate('Chat', {
        conversationId,
        otherUserId: targetUserId,
        otherUserName: displayName,
        otherUserAvatar: displayUser?.avatar,
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setStartingConversation(false);
    }
  };

  const handleFollowToggle = () => {
    setFollowing(!following);
    // TODO: Implement actual follow/unfollow logic
  };

  const handleShareProfile = () => {
    Alert.alert('Share Profile', 'Profile sharing will be implemented soon!');
  };

  const handleChatPress = () => {
    navigation.navigate('ChatList');
  };

  const handleStatPress = (statKey: string) => {
    if (statKey === 'connections' && profileUserId) {
      const initialTab = connectionsData && connectionsData.connections === 0 ? 'suggestions' : 'followers';
      navigation.navigate('Connections', {
        userId: profileUserId,
        userName: displayName,
        initialTab,
      });
    }
    // Add other stat navigation logic here if needed
  };

  const renderEventCards = () => {
    if (loadingPosts) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6366F1" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      );
    }

    if (userPosts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="image-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>
            {isViewingOwnProfile ? 'No posts yet' : 'No posts to show'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isViewingOwnProfile 
              ? 'Start sharing your event memories!' 
              : 'This user hasn\'t shared any posts yet.'}
          </Text>
        </View>
      );
    }
    
    // Show user's actual posts as event cards
    const postsToShow = userPosts.slice(0, 6);
    
    return (
      <View style={styles.eventCardsContainer}>
        {postsToShow.map((post, index) => {
          const firstImageUrl = post.mediaUrls && post.mediaUrls.length > 0 
            ? post.mediaUrls[0] 
            : `https://picsum.photos/400/400?random=${index + 1}`;
          
          return (
            <TouchableOpacity 
              key={post.postId} 
              style={styles.eventCard} 
              onPress={() => {
                // Navigate to post details or event details if eventId exists
                if (post.eventId) {
                  navigation.navigate('EventDetails', { eventId: post.eventId });
                } else {
                  // Navigate to post detail view
                  Alert.alert('Post Details', 'Post detail view coming soon!');
                }
              }}
              activeOpacity={0.8}
            >
              <Image source={{ uri: firstImageUrl }} style={styles.eventCardImage} />
              
              <View style={styles.eventCardContent}>
                <Text style={styles.eventCardTitle} numberOfLines={2}>
                  {post.text || `Post by ${displayUser?.name || 'User'}`}
                </Text>
                
                <View style={styles.eventCardDetails}>
                  <View style={styles.eventCardDetailRow}>
                    <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                    <Text style={styles.eventCardDetailText}>
                      {post.createdAt.toDate().toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.eventCardDetailRow}>
                    <Ionicons name="heart-outline" size={12} color="#6B7280" />
                    <Text style={styles.eventCardDetailText}>{post.likeCount} likes</Text>
                  </View>
                </View>
                
                <View style={styles.eventCardFooter}>
                  <Text style={styles.eventCardPrice}>
                    {post.eventId ? 'Event Post' : 'Personal Post'}
                  </Text>
                  {post.mediaUrls && post.mediaUrls.length > 1 && (
                    <View style={styles.featuredBadge}>
                      <Ionicons name="images-outline" size={10} color="#6366F1" />
                      <Text style={styles.featuredText}>+{post.mediaUrls.length - 1}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Chat Icon */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clique</Text>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={handleChatPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Enhanced Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: displayUser?.avatar || DEFAULT_AVATAR }}
                style={styles.profileImage}
              />
              <View style={[styles.statusRing, displayUser?.isHost ? styles.hostRing : styles.memberRing]}>
                <Ionicons 
                  name={displayUser?.isHost ? "star" : "checkmark"} 
                  size={14} 
                  color="#FFFFFF" 
                />
              </View>
            </View>
            
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{displayName}</Text>
                {displayUser?.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={styles.verificationBadge} />
                )}
                {displayUser?.isHost && (
                  <View style={styles.hostBadge}>
                    <Ionicons name="star" size={10} color="#FFFFFF" />
                    <Text style={styles.hostBadgeText}>Host</Text>
                  </View>
                )}
              </View>
              <Text style={styles.usernameText}>@{displayUser?.username || 'username'}</Text>
              {displayUser?.city && (
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color="#6B7280" />
                  <Text style={styles.locationText}>{displayUser.city}</Text>
                </View>
              )}
            </View>

            {isOwnProfile && (
              <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
                <Ionicons name="settings" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Enhanced Bio with 2-line limit */}
          <Text style={styles.bioText} numberOfLines={2}>
            {isViewingOwnProfile
              ? `🎉 Event enthusiast ${displayUser?.isHost ? '& Host' : ''} • ✨ Living life one event at a time!`
              : `${displayUser?.socialActivityLevel || 'Active'} event goer ${displayUser?.isHost ? '& professional host' : ''} 🎉`
            }
          </Text>

          {/* Interest Tags (if available) */}
          {displayUser?.isHost && (
            <View style={styles.interestTags}>
              <View style={styles.interestTag}>
                <Text style={styles.interestTagText}>Event Hosting</Text>
              </View>
              <View style={styles.interestTag}>
                <Text style={styles.interestTagText}>Community Building</Text>
              </View>
            </View>
          )}

          {/* Conditional Stats - only show non-zero values */}
          {statsToShow.length > 0 && (
            <View style={styles.statsRow}>
              {statsToShow.map((stat) => (
                <TouchableOpacity 
                  key={stat.key} 
                  style={styles.statCard}
                  onPress={() => handleStatPress(stat.key)}
                  activeOpacity={stat.key === 'connections' ? 0.7 : 1}
                >
                  <Ionicons name={stat.icon as any} size={16} color="#6366F1" style={styles.statIcon} />
                  <Text style={styles.statNumber}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Conditional Action Buttons */}
        <View style={styles.actionSection}>
          {isViewingOwnProfile ? (
            <>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="person-circle-outline" size={18} color="#6B7280" />
                <Text style={styles.primaryButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              
              <View style={styles.secondaryButtons}>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleShareProfile}>
                  <Ionicons name="share-social-outline" size={18} color="#6366F1" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => navigation.navigate('ChatList')}
                >
                  <Ionicons name="chatbubble-outline" size={18} color="#6366F1" />
                </TouchableOpacity>
                {!displayUser?.isHost && (
                  <TouchableOpacity style={styles.becomeHostButton} onPress={handleBecomeHost}>
                    <Ionicons name="star" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.primaryButton, styles.messageButton]}
                onPress={handleStartConversation}
                disabled={startingConversation}
              >
                <Ionicons 
                  name={startingConversation ? "hourglass-outline" : "chatbubble-outline"} 
                  size={18} 
                  color="#FFFFFF" 
                />
                <Text style={styles.messageButtonText}>
                  {startingConversation ? 'Starting...' : 'Message'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.secondaryButtons}>
                <TouchableOpacity 
                  style={[styles.secondaryButton, following && styles.followingButton]} 
                  onPress={handleFollowToggle}
                >
                  <Ionicons 
                    name={following ? "person-remove-outline" : "person-add-outline"} 
                    size={18} 
                    color={following ? "#EF4444" : "#6366F1"} 
                  />
                </TouchableOpacity>
                {displayUser?.isHost && (
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={() => Alert.alert('View Events', 'Browse this host\'s events')}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#6366F1" />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>

        {/* Conditional Content Tabs */}
        <View style={styles.contentSwitcher}>
          {isViewingOwnProfile ? (
            <>
              <TouchableOpacity 
                style={[styles.switcherTab, activeTab === 'posts' && styles.activeSwitcherTab]}
                onPress={() => setActiveTab('posts')}
              >
                <Ionicons name="grid-outline" size={16} color={activeTab === 'posts' ? '#0F172A' : '#64748B'} />
                <Text style={[styles.switcherText, activeTab === 'posts' && styles.activeSwitcherText]}>
                  My Cliques
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.switcherTab, activeTab === 'saved' && styles.activeSwitcherTab]}
                onPress={() => setActiveTab('saved')}
              >
                <Ionicons name="bookmark-outline" size={16} color={activeTab === 'saved' ? '#0F172A' : '#64748B'} />
                <Text style={[styles.switcherText, activeTab === 'saved' && styles.activeSwitcherText]}>
                  Saved Events
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.switcherTab, activeTab === 'posts' && styles.activeSwitcherTab]}
                onPress={() => setActiveTab('posts')}
              >
                <Ionicons name="calendar-outline" size={16} color={activeTab === 'posts' ? '#0F172A' : '#64748B'} />
                <Text style={[styles.switcherText, activeTab === 'posts' && styles.activeSwitcherText]}>
                  Hosted Events
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.switcherTab, activeTab === 'saved' && styles.activeSwitcherTab]}
                onPress={() => setActiveTab('saved')}
              >
                <Ionicons name="time-outline" size={16} color={activeTab === 'saved' ? '#0F172A' : '#64748B'} />
                <Text style={[styles.switcherText, activeTab === 'saved' && styles.activeSwitcherText]}>
                  Upcoming Events
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Event Cards */}
        <View style={styles.postsContainer}>
          {renderEventCards()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  
  // Header Card
  headerCard: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
  },
  statusRing: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostRing: {
    backgroundColor: '#F59E0B',
  },
  memberRing: {
    backgroundColor: '#10B981',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 6,
  },
  verificationBadge: {
    marginRight: 6,
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 2,
  },
  usernameText: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366F1',
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Action Section
  actionSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageButton: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  followingButton: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  becomeHostButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Content Switcher
  contentSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 3,
  },
  switcherTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 9,
    gap: 6,
  },
  activeSwitcherTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  switcherText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  activeSwitcherText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  
  // Event Cards Container
  eventCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  eventCard: {
    width: (width - 64) / 2, // 2 cards per row with margins
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  eventCardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  eventCardContent: {
    padding: 12,
  },
  eventCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    lineHeight: 18,
  },
  eventCardDetails: {
    marginBottom: 8,
  },
  eventCardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventCardDetailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  eventCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventCardPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#F59E0B',
    marginLeft: 2,
  },
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Posts Container
  postsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
  },
});