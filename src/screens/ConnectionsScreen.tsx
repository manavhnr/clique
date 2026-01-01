import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  doc,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_AVATAR } from '../constants/images';

type ConnectionType = 'followers' | 'following' | 'suggestions';

interface User {
  uid: string;
  name: string;
  username: string;
  photoURL: string | null;
  isFollowing: boolean;
}



export default function ConnectionsScreen({ route }: { route: any }) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const userId = route?.params?.userId || user?.id;
  const userName = route?.params?.userName || user?.name;
  const initialTab = route?.params?.initialTab || 'followers';
  
  const [activeTab, setActiveTab] = useState<ConnectionType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionsCount, setConnectionsCount] = useState(0);

  const isOwnProfile = userId === user?.id;

  useEffect(() => {
    loadConnectionsData();
  }, [userId]);

  const loadConnectionsData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Fetch all users except current user
      const usersQuery = query(
        collection(db, 'users'),
        where('uid', '!=', userId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      // Fetch current user's following list
      const followingQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', userId)
      );
      const followingSnapshot = await getDocs(followingQuery);
      const followingIds = new Set(followingSnapshot.docs.map(doc => doc.data().followingId));
      
      // Fetch current user's followers list
      const followersQuery = query(
        collection(db, 'follows'),
        where('followingId', '==', userId)
      );
      const followersSnapshot = await getDocs(followersQuery);
      const followerIds = new Set(followersSnapshot.docs.map(doc => doc.data().followerId));
      
      // Process users and add follow status
      const users: User[] = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: data.uid,
          name: data.name || 'Unknown User',
          username: data.username || 'unknown',
          photoURL: data.photoURL || null,
          isFollowing: followingIds.has(data.uid)
        };
      });
      
      setAllUsers(users);
      
      // Set followers and following lists
      const followersUsers = users.filter(user => followerIds.has(user.uid));
      const followingUsers = users.filter(user => followingIds.has(user.uid));
      
      setFollowers(followersUsers);
      setFollowing(followingUsers);
      setConnectionsCount(followersUsers.length + followingUsers.length);
      
      // Debug logging
      console.log('📊 ConnectionsScreen Debug:');
      console.log('- Total users found:', users.length);
      console.log('- Followers:', followersUsers.length);
      console.log('- Following:', followingUsers.length);
      console.log('- Suggestions available:', users.filter(u => !u.isFollowing).length);
      
      // If no connections, show all users as suggestions
      if (followersUsers.length === 0 && followingUsers.length === 0) {
        setActiveTab('suggestions');
      }
      
    } catch (error) {
      console.error('Error loading connections:', error);
      Alert.alert('Error', 'Failed to load connections data');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayData = () => {
    let data: User[] = [];
    
    if (connectionsCount === 0 || activeTab === 'suggestions') {
      // Show all users (excluding already following) as suggestions
      data = allUsers.filter(user => !user.isFollowing);
    } else if (activeTab === 'followers') {
      data = followers;
    } else if (activeTab === 'following') {
      data = following;
    }

    // Filter by search query
    if (searchQuery) {
      data = data.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return data;
  };

  const handleToggleFollow = async (targetUser: User) => {
    if (!user?.id) return;

    try {
      if (targetUser.isFollowing) {
        // Unfollow: delete the follow document
        const followQuery = query(
          collection(db, 'follows'),
          where('followerId', '==', user.id),
          where('followingId', '==', targetUser.uid)
        );
        const followSnapshot = await getDocs(followQuery);
        
        if (!followSnapshot.empty) {
          await deleteDoc(followSnapshot.docs[0].ref);
          
          // Update local state immediately
          setAllUsers(prev => 
            prev.map(u => u.uid === targetUser.uid ? { ...u, isFollowing: false } : u)
          );
          setFollowing(prev => prev.filter(u => u.uid !== targetUser.uid));
          setConnectionsCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Follow: create a new follow document
        await addDoc(collection(db, 'follows'), {
          followerId: user.id,
          followingId: targetUser.uid,
          createdAt: serverTimestamp()
        });
        
        // Update local state immediately
        setAllUsers(prev => 
          prev.map(u => u.uid === targetUser.uid ? { ...u, isFollowing: true } : u)
        );
        setFollowing(prev => [...prev, { ...targetUser, isFollowing: true }]);
        setConnectionsCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handlePersonPress = (userUid: string) => {
    navigation.navigate('UserProfileView', { 
      userId: userUid,
      userName: getDisplayData().find(u => u.uid === userUid)?.name 
    });
  };

  const handleRemoveFollower = async (followerUid: string) => {
    if (!user?.id) return;

    Alert.alert(
      'Remove Follower',
      'Are you sure you want to remove this follower?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Find and delete the follow document where follower follows current user
              const followQuery = query(
                collection(db, 'follows'),
                where('followerId', '==', followerUid),
                where('followingId', '==', user.id)
              );
              const followSnapshot = await getDocs(followQuery);
              
              if (!followSnapshot.empty) {
                await deleteDoc(followSnapshot.docs[0].ref);
                
                // Update local state
                setFollowers(prev => prev.filter(f => f.uid !== followerUid));
                setConnectionsCount(prev => Math.max(0, prev - 1));
              }
            } catch (error) {
              console.error('Error removing follower:', error);
              Alert.alert('Error', 'Failed to remove follower');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading connections...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with tabs */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {connectionsCount === 0 ? 'Find Connections' : `${userName || 'User'}\'s Connections`}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        {connectionsCount === 0 ? (
          <TouchableOpacity
            style={[styles.tab, styles.activeTab]}
            onPress={() => setActiveTab('suggestions')}
          >
            <Text style={[styles.tabText, styles.activeTabText]}>
              Suggested Connections
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
              onPress={() => setActiveTab('followers')}
            >
              <Text style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>
                {followers.length} Followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'following' && styles.activeTab]}
              onPress={() => setActiveTab('following')}
            >
              <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
                {following.length} Following
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search connections..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Connections List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {getDisplayData().length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No matching connections' : 
                activeTab === 'suggestions' ? 
                  allUsers.length === 0 ? 'No users found' : 'All users followed' :
                  `No ${activeTab} yet`}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery 
                ? 'Try adjusting your search'
                : activeTab === 'suggestions'
                  ? allUsers.length === 0 
                    ? 'Be the first to join the community!' 
                    : 'You\'re following everyone available'
                  : `Discover and connect with other users`
              }
            </Text>
            {__DEV__ && (
              <Text style={[styles.emptyStateSubtitle, {marginTop: 10, fontSize: 12, fontFamily: 'monospace'}]}>
                Debug: {allUsers.length} total users, {allUsers.filter(u => !u.isFollowing).length} available to follow
              </Text>
            )}
          </View>
        ) : (
          getDisplayData().map((connection) => (
            <TouchableOpacity
              key={connection.uid}
              style={styles.connectionCard}
              onPress={() => handlePersonPress(connection.uid)}
              activeOpacity={0.7}
            >
              <View style={styles.connectionHeader}>
                <View style={styles.connectionImageContainer}>
                  <Image 
                    source={{ 
                      uri: connection.photoURL || DEFAULT_AVATAR 
                    }} 
                    style={styles.connectionImage} 
                  />
                </View>

                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionName}>{connection.name}</Text>
                  <Text style={styles.connectionUsername}>@{connection.username}</Text>
                </View>
              </View>

              <View style={styles.connectionActions}>
                {activeTab === 'followers' ? (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveFollower(connection.uid)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageButton}>
                      <Ionicons name="chatbubble" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ) : activeTab === 'following' ? (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.unfollowButton}
                      onPress={() => handleToggleFollow(connection)}
                    >
                      <Text style={styles.unfollowButtonText}>Unfollow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageButton}>
                      <Ionicons name="chatbubble" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Suggestions tab - show follow button for non-followed users
                  <TouchableOpacity 
                    style={styles.followButton}
                    onPress={() => handleToggleFollow(connection)}
                  >
                    <Text style={styles.followButtonText}>Follow</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  connectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  connectionImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  connectionImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  hostBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },  connectionUsername: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },  connectionEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  connectionBio: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
    marginBottom: 8,
  },
  hostTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  hostTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  connectionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },  unfollowButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  unfollowButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },  removeButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  messageButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});