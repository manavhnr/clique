import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventsService } from '../services/eventsService';
import { DEFAULT_AVATAR } from '../constants/images';

interface UserProfileViewProps {
  route: {
    params: {
      userId: string;
      userName?: string;
    };
  };
  navigation: any;
}

interface UserProfile {
  id: string;
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  isHost: boolean;
  city?: string;
  age?: number;
  socialActivityLevel?: string;
  joinedDate?: string;
  followers?: number;
  following?: number;
  posts?: number;
}

interface Post {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  timestamp: string;
}

const { width, height } = Dimensions.get('window');

const UserProfileViewScreen: React.FC<UserProfileViewProps> = ({ route, navigation }) => {
  const { userId, userName } = route.params;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'activity' | 'about'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    console.log('🔍 Viewing user profile:', { userId, userName });
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading user profile for userId:', userId);
      
      const profile = await eventsService.getUserProfileById(userId);
      console.log('📋 User profile data:', profile);
      
      if (profile) {
        setUserProfile({
          ...profile,
          followers: profile.followers || Math.floor(Math.random() * 500) + 50,
          following: profile.following || Math.floor(Math.random() * 300) + 20,
          posts: profile.posts || Math.floor(Math.random() * 50) + 10,
          bio: profile.bio || `Hey! I'm ${profile.name || profile.username}. Love connecting with new people and exploring amazing events! 🎉`,
          joinedDate: profile.joinedDate || 'November 2024',
        });
        
        // Generate sample posts for demo
        generateSamplePosts();
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSamplePosts = () => {
    const samplePosts: Post[] = [
      {
        id: '1',
        imageUrl: 'https://picsum.photos/400/400?random=1',
        likes: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 20) + 2,
        timestamp: '2 days ago',
      },
      {
        id: '2',
        imageUrl: 'https://picsum.photos/400/400?random=2',
        likes: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 20) + 2,
        timestamp: '5 days ago',
      },
      {
        id: '3',
        imageUrl: 'https://picsum.photos/400/400?random=3',
        likes: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 20) + 2,
        timestamp: '1 week ago',
      },
      {
        id: '4',
        imageUrl: 'https://picsum.photos/400/400?random=4',
        likes: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 20) + 2,
        timestamp: '1 week ago',
      },
      {
        id: '5',
        imageUrl: 'https://picsum.photos/400/400?random=5',
        likes: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 20) + 2,
        timestamp: '2 weeks ago',
      },
      {
        id: '6',
        imageUrl: 'https://picsum.photos/400/400?random=6',
        likes: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 20) + 2,
        timestamp: '3 weeks ago',
      },
    ];
    setPosts(samplePosts);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      <View style={styles.postOverlay}>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <Ionicons name="heart" size={16} color="#fff" />
            <Text style={styles.postStatText}>{item.likes}</Text>
          </View>
          <View style={styles.postStat}>
            <Ionicons name="chatbubble" size={16} color="#fff" />
            <Text style={styles.postStatText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <FlatList
            data={posts}
            renderItem={renderPost}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.postsGrid}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'activity':
        return (
          <View style={styles.tabContent}>
            <View style={styles.activityItem}>
              <Ionicons name="calendar-outline" size={24} color="#8B5CF6" />
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Attended College Mixer</Text>
                <Text style={styles.activityDate}>3 days ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="people-outline" size={24} color="#8B5CF6" />
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Made 5 new connections</Text>
                <Text style={styles.activityDate}>1 week ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="star-outline" size={24} color="#8B5CF6" />
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Received 4.8 rating</Text>
                <Text style={styles.activityDate}>2 weeks ago</Text>
              </View>
            </View>
          </View>
        );
      case 'about':
        return (
          <View style={styles.tabContent}>
            <View style={styles.aboutSection}>
              <Text style={styles.aboutLabel}>Location</Text>
              <Text style={styles.aboutValue}>{userProfile?.city || 'Not specified'}</Text>
            </View>
            <View style={styles.aboutSection}>
              <Text style={styles.aboutLabel}>Age</Text>
              <Text style={styles.aboutValue}>{userProfile?.age || 'Not specified'}</Text>
            </View>
            <View style={styles.aboutSection}>
              <Text style={styles.aboutLabel}>Social Activity</Text>
              <Text style={styles.aboutValue}>{userProfile?.socialActivityLevel || 'Active'}</Text>
            </View>
            <View style={styles.aboutSection}>
              <Text style={styles.aboutLabel}>Joined</Text>
              <Text style={styles.aboutValue}>{userProfile?.joinedDate}</Text>
            </View>
            {userProfile?.isHost && (
              <View style={styles.aboutSection}>
                <Text style={styles.aboutLabel}>Host Status</Text>
                <Text style={styles.aboutValue}>Verified Host</Text>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userProfile.username}</Text>
        <TouchableOpacity style={styles.moreIcon}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: userProfile.avatar || DEFAULT_AVATAR }} style={styles.avatar} />
            {userProfile.isHost && (
              <View style={styles.hostBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
              </View>
            )}
          </View>
          
          <Text style={styles.displayName}>
            {userProfile.name || userProfile.username}
          </Text>
          
          <Text style={styles.bio}>{userProfile.bio}</Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userProfile.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userProfile.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userProfile.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Connect</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons 
              name="grid-outline" 
              size={20} 
              color={activeTab === 'posts' ? '#8B5CF6' : '#6B7280'} 
            />
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
            onPress={() => setActiveTab('activity')}
          >
            <Ionicons 
              name="pulse-outline" 
              size={20} 
              color={activeTab === 'activity' ? '#8B5CF6' : '#6B7280'} 
            />
            <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
              Activity
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Ionicons 
              name="information-circle-outline" 
              size={20} 
              color={activeTab === 'about' ? '#8B5CF6' : '#6B7280'} 
            />
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              About
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  moreIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#8B5CF6',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#8B5CF6',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  hostBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  displayName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  followButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    padding: 16,
  },
  postsGrid: {
    padding: 16,
  },
  postContainer: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  postOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    padding: 8,
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    marginBottom: 12,
  },
  activityText: {
    marginLeft: 16,
    flex: 1,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  activityDate: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  aboutSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    marginBottom: 12,
  },
  aboutLabel: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  aboutValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UserProfileViewScreen;