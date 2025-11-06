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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

type ConnectionType = 'followers' | 'following';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isHost: boolean;
  profileSetup: boolean;
  bio?: string;
  profileImage?: string;
}

export default function ConnectionsScreen({ route }: { route: any }) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const initialTab = route?.params?.tab || 'followers';
  
  const [activeTab, setActiveTab] = useState<ConnectionType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // In a real app, you would have a connections collection
      // For now, we'll load other users as potential connections
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const allUsers = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(u => u.id !== user.id); // Exclude current user

      // For demo purposes, split users into followers and following
      const midpoint = Math.ceil(allUsers.length / 2);
      setFollowers(allUsers.slice(0, midpoint));
      setFollowing(allUsers.slice(midpoint));
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const connections = activeTab === 'followers' ? followers : following;
  
  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (connection.bio && connection.bio.toLowerCase().includes(searchQuery.toLowerCase()))
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading connections...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        {filteredConnections.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No matching connections' : `No ${activeTab} yet`}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery 
                ? 'Try adjusting your search'
                : `Discover and connect with other users`
              }
            </Text>
          </View>
        ) : (
          filteredConnections.map((connection) => (
            <TouchableOpacity
              key={connection.id}
              style={styles.connectionCard}
              onPress={() => handlePersonPress(connection.id)}
              activeOpacity={0.7}
            >
              <View style={styles.connectionHeader}>
                <View style={styles.connectionImageContainer}>
                  <Image 
                    source={{ 
                      uri: connection.profileImage || 'https://picsum.photos/150/150?random=' + connection.id 
                    }} 
                    style={styles.connectionImage} 
                  />
                  {connection.isHost && (
                    <View style={styles.hostBadge}>
                      <Ionicons name="star" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionName}>{connection.name}</Text>
                  <Text style={styles.connectionEmail}>{connection.email}</Text>
                  {connection.bio && (
                    <Text style={styles.connectionBio} numberOfLines={2}>
                      {connection.bio}
                    </Text>
                  )}
                  {connection.isHost && (
                    <View style={styles.hostTag}>
                      <Text style={styles.hostTagText}>Host</Text>
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
                      style={styles.followButton}
                      onPress={() => handleFollowToggle(connection.id)}
                    >
                      <Text style={styles.followButtonText}>Following</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageButton}>
                      <Ionicons name="chatbubble" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
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
  },
  connectionEmail: {
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
  },
  removeButton: {
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