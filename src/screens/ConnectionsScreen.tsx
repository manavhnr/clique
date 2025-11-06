import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type ConnectionType = 'followers' | 'following';

interface Connection {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  isHost: boolean;
  isFollowing?: boolean;
  mutualConnections?: number;
  bio: string;
}

// Mock data - in a real app, this would come from an API
const connectionsData = {
  followers: [
    {
      id: '1',
      name: 'Arjun Sharma',
      username: 'arjun_events',
      profileImage: 'https://picsum.photos/150/150?random=1',
      isHost: true,
      mutualConnections: 5,
      bio: '🎵 Music lover & Event organizer',
    },
    {
      id: '2',
      name: 'Priya Patel',
      username: 'priya_foodie',
      profileImage: 'https://picsum.photos/150/150?random=2',
      isHost: false,
      mutualConnections: 8,
      bio: '🍕 Food enthusiast | Photographer',
    },
    {
      id: '3',
      name: 'Raj Kumar',
      username: 'raj_techie',
      profileImage: 'https://picsum.photos/150/150?random=3',
      isHost: true,
      mutualConnections: 12,
      bio: '💻 Tech entrepreneur | Startup founder',
    },
    {
      id: '4',
      name: 'Sneha Reddy',
      username: 'sneha_artist',
      profileImage: 'https://picsum.photos/150/150?random=4',
      isHost: false,
      mutualConnections: 3,
      bio: '🎨 Digital artist | Art teacher',
    },
  ],
  following: [
    {
      id: '5',
      name: 'Vikram Singh',
      username: 'vikram_fitness',
      profileImage: 'https://picsum.photos/150/150?random=5',
      isHost: true,
      isFollowing: true,
      bio: '💪 Fitness coach | Marathon runner',
    },
    {
      id: '6',
      name: 'Maya Kapoor',
      username: 'maya_dance',
      profileImage: 'https://picsum.photos/150/150?random=6',
      isHost: false,
      isFollowing: true,
      bio: '💃 Professional dancer | Choreographer',
    },
    {
      id: '7',
      name: 'Rohit Agarwal',
      username: 'rohit_musician',
      profileImage: 'https://picsum.photos/150/150?random=7',
      isHost: true,
      isFollowing: true,
      bio: '🎸 Musician | Music producer',
    },
  ],
};

export default function ConnectionsScreen({ route }: { route: any }) {
  const navigation = useNavigation<any>();
  const initialTab = route?.params?.tab || 'followers';
  
  const [activeTab, setActiveTab] = useState<ConnectionType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const connections = connectionsData[activeTab];
  
  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePersonPress = (personId: string) => {
    // Navigate to person's profile
    console.log('Navigate to profile:', personId);
  };

  const handleFollowToggle = (personId: string) => {
    // Toggle follow status
    console.log('Toggle follow for:', personId);
  };

  const handleRemoveFollower = (personId: string) => {
    // Remove follower
    console.log('Remove follower:', personId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with tabs */}
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
            onPress={() => setActiveTab('followers')}
          >
            <Text style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>
              {connectionsData.followers.length} Followers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'following' && styles.activeTab]}
            onPress={() => setActiveTab('following')}
          >
            <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
              {connectionsData.following.length} Following
            </Text>
          </TouchableOpacity>
        </View>
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
        {filteredConnections.map((connection) => (
          <TouchableOpacity
            key={connection.id}
            style={styles.connectionItem}
            onPress={() => handlePersonPress(connection.id)}
            activeOpacity={0.7}
          >
            <View style={styles.connectionLeft}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: connection.profileImage }} 
                  style={styles.profileImage} 
                />
                <View style={[
                  styles.statusBadge, 
                  connection.isHost ? styles.hostBadge : styles.memberBadge
                ]}>
                  <Ionicons 
                    name={connection.isHost ? "star" : "checkmark"} 
                    size={8} 
                    color="#FFFFFF" 
                  />
                </View>
              </View>

              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>{connection.name}</Text>
                <Text style={styles.connectionUsername}>@{connection.username}</Text>
                <Text style={styles.connectionBio} numberOfLines={1}>
                  {connection.bio}
                </Text>
                {connection.mutualConnections !== undefined && (
                  <View style={styles.mutualContainer}>
                    <Ionicons name="people" size={12} color="#6B7280" />
                    <Text style={styles.mutualText}>
                      {connection.mutualConnections} mutual connections
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.connectionActions}>
              {activeTab === 'followers' ? (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveFollower(connection.id)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.messageButton}>
                    <Ionicons name="chatbubble" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.followButton, connection.isFollowing && styles.followingButton]}
                    onPress={() => handleFollowToggle(connection.id)}
                  >
                    <Text style={[styles.followButtonText, connection.isFollowing && styles.followingButtonText]}>
                      {connection.isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.messageButton}>
                    <Ionicons name="chatbubble" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {filteredConnections.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No connections found' : `No ${activeTab}`}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery 
                ? 'Try adjusting your search' 
                : activeTab === 'followers' 
                  ? 'Share your profile to get followers'
                  : 'Discover people to follow in the Discover tab'
              }
            </Text>
          </View>
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

  // Header
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#111827',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '600',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },

  // Connections List
  scrollView: {
    flex: 1,
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  connectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostBadge: {
    backgroundColor: '#F59E0B',
  },
  memberBadge: {
    backgroundColor: '#10B981',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  connectionUsername: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  connectionBio: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  mutualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutualText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },

  // Actions
  connectionActions: {
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: '#374151',
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  messageButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});