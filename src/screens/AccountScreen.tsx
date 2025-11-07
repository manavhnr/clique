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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { DEFAULT_AVATAR } from '../constants/images';

const { width } = Dimensions.get('window');
const postSize = (width - 60) / 3;

// Mock data for user posts/events
// Mock data for user's contributed photos to event collages
const userContributions = [
  { 
    id: '1', 
    image: 'https://picsum.photos/400/400?random=1', 
    eventId: 'event_1',
    eventName: 'Rooftop Sunset Party', 
    eventHost: '@sarahj_events',
    contributedAt: '2 hours ago',
    totalPhotos: 28,
    totalContributors: 12,
    isFeaturePhoto: true // This photo is prominently displayed in the collage
  },
  { 
    id: '2', 
    image: 'https://picsum.photos/400/400?random=5', 
    eventId: 'event_2',
    eventName: 'Street Food Carnival', 
    eventHost: '@mumbai_foodie',
    contributedAt: '4 hours ago',
    totalPhotos: 24,
    totalContributors: 8,
    isFeaturePhoto: false
  },
  { 
    id: '3', 
    image: 'https://picsum.photos/400/400?random=9', 
    eventId: 'event_3',
    eventName: 'Indie Music Night', 
    eventHost: '@indie_blr',
    contributedAt: '6 hours ago',
    totalPhotos: 42,
    totalContributors: 15,
    isFeaturePhoto: true
  },
  { 
    id: '4', 
    image: 'https://picsum.photos/400/400?random=13', 
    eventId: 'event_4',
    eventName: 'Beach Volleyball Tournament', 
    eventHost: '@beach_sports',
    contributedAt: '1 day ago',
    totalPhotos: 35,
    totalContributors: 18,
    isFeaturePhoto: false
  },
  { 
    id: '5', 
    image: 'https://picsum.photos/400/400?random=17', 
    eventId: 'event_5',
    eventName: 'Art Gallery Opening', 
    eventHost: '@modern_art_gallery',
    contributedAt: '2 days ago',
    totalPhotos: 19,
    totalContributors: 7,
    isFeaturePhoto: true
  },
  { 
    id: '6', 
    image: 'https://picsum.photos/400/400?random=21', 
    eventId: 'event_6',
    eventName: 'Food Truck Festival', 
    eventHost: '@food_trucks_delhi',
    contributedAt: '3 days ago',
    totalPhotos: 67,
    totalContributors: 25,
    isFeaturePhoto: false
  },
  { 
    id: '7', 
    image: 'https://picsum.photos/400/400?random=25', 
    eventId: 'event_7',
    eventName: 'Tech Conference 2025', 
    eventHost: '@tech_conf',
    contributedAt: '1 week ago',
    totalPhotos: 156,
    totalContributors: 89,
    isFeaturePhoto: true
  },
  { 
    id: '8', 
    image: 'https://picsum.photos/400/400?random=29', 
    eventId: 'event_8',
    eventName: 'Comedy Night Special', 
    eventHost: '@laugh_out_loud',
    contributedAt: '1 week ago',
    totalPhotos: 12,
    totalContributors: 4,
    isFeaturePhoto: false
  },
  { 
    id: '9', 
    image: 'https://picsum.photos/400/400?random=33', 
    eventId: 'event_9',
    eventName: 'Dance Workshop', 
    eventHost: '@dance_academy',
    contributedAt: '2 weeks ago',
    totalPhotos: 31,
    totalContributors: 16,
    isFeaturePhoto: true
  }
];

export default function AccountScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, logout, becomeHost } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  
  // Calculate real user stats
  const postsCount = userContributions.length; // Number of posts/cliques (default: 0 if no contributions)
  const followersCount = 0; // TODO: Add to user profile when implemented (default: 0)
  const followingCount = 0; // TODO: Add to user profile when implemented (default: 0)
  const totalSocials = followersCount + followingCount; // Sum of followers + following
  const userRating = "-.-"; // TODO: Add to user profile when implemented (default: "-.-")

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleBecomeHost = async () => {
    const result = await becomeHost();
    if (result.success) {
      Alert.alert('Success', 'You are now a host! You can create events.');
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const renderPostGrid = () => {
    return (
      <View style={styles.postsGrid}>
        {userContributions.map((contribution, index) => (
          <TouchableOpacity key={contribution.id} style={styles.postItem} activeOpacity={0.9}>
            <Image source={{ uri: contribution.image }} style={styles.postImage} />
            
            {/* Feature photo indicator */}
            {contribution.isFeaturePhoto && (
              <View style={styles.featurePhotoOverlay}>
                <Ionicons name="star" size={12} color="#FFD700" />
              </View>
            )}
            
            {/* Collage indicator */}
            <View style={styles.collageIndicatorOverlay}>
              <Ionicons name="grid" size={10} color="#FFFFFF" />
              <Text style={styles.collageCountText}>{contribution.totalPhotos}</Text>
            </View>
            
            {/* Contributors count */}
            <View style={styles.contributorsCountOverlay}>
              <Ionicons name="people" size={10} color="#FFFFFF" />
              <Text style={styles.contributorsCountText}>{contribution.totalContributors}</Text>
            </View>
            
            {/* Event name overlay */}
            <View style={styles.eventNameOverlay}>
              <Text style={styles.eventNameText} numberOfLines={1}>
                {contribution.eventName}
              </Text>
              <Text style={styles.eventHostText} numberOfLines={1}>
                by {contribution.eventHost}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: user?.avatar || DEFAULT_AVATAR }}
                style={styles.profileImage}
              />
              <View style={[styles.statusRing, user?.isHost ? styles.hostRing : styles.memberRing]}>
                <Ionicons 
                  name={user?.isHost ? "star" : "checkmark"} 
                  size={12} 
                  color="#FFFFFF" 
                />
              </View>
            </View>
            
            <View style={styles.headerInfo}>
              <Text style={styles.displayName}>{user?.name || 'User Name'}</Text>
              <Text style={styles.usernameText}>@{user?.username || 'username'}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color="#6B7280" />
                <Text style={styles.locationText}>{user?.city || 'Mumbai, India'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.bioText}>
            🎉 Event enthusiast {user?.isHost ? '& Host' : ''} • ✨ Living life one event at a time!
          </Text>

          {/* Stats Cards Row */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statNumber}>{postsCount}</Text>
              <Text style={styles.statLabel}>Cliques</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => navigation.navigate('Connections', { tab: 'followers' })}
            >
              <Text style={styles.statNumber}>{totalSocials}</Text>
              <Text style={styles.statLabel}>Socials</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statNumber}>{userRating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="person-circle" size={18} color="#6B7280" />
            <Text style={styles.primaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryButtons}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="share-social" size={18} color="#6366F1" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="chatbubble" size={18} color="#6366F1" />
            </TouchableOpacity>
            {!user?.isHost && (
              <TouchableOpacity style={styles.becomeHostButton} onPress={handleBecomeHost}>
                <Ionicons name="star" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content Switcher */}
        <View style={styles.contentSwitcher}>
          <TouchableOpacity 
            style={[styles.switcherTab, activeTab === 'posts' && styles.activeSwitcherTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.switcherText, activeTab === 'posts' && styles.activeSwitcherText]}>
              My Cliques
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.switcherTab, activeTab === 'saved' && styles.activeSwitcherTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Text style={[styles.switcherText, activeTab === 'saved' && styles.activeSwitcherText]}>
              Saved Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid with Cards */}
        <View style={styles.postsContainer}>
          {renderPostGrid()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
  },
  statusRing: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
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
  displayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
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
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  
  // Action Section
  actionSection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  becomeHostButton: {
    width: 40,
    height: 40,
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
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 3,
  },
  switcherTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  activeSwitcherTab: {
    backgroundColor: '#FFFFFF',
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
  
  // Posts Container
  postsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    minHeight: 300,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  postItem: {
    width: (postSize - 52) / 3,
    height: (postSize - 52) / 3,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postTypeOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsCountOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  // New overlay styles for collaborative collages
  featurePhotoOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collageIndicatorOverlay: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 2,
  },
  collageCountText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contributorsCountOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 2,
  },
  contributorsCountText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  friendsCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventNameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  eventNameText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventHostText: {
    fontSize: 6,
    fontWeight: '400',
    color: '#D1D5DB',
    marginTop: 1,
  },
});