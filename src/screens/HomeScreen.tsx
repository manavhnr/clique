import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

// Mock data for Instagram-style event feed with collaborative collages
const feedPosts = [
  {
    id: '1',
    host: {
      id: 'user_1',
      name: 'Sarah Johnson',
      username: 'sarahj_events',
      avatar: 'https://picsum.photos/100/100?random=21',
      isVerified: true
    },
    event: {
      title: 'Rooftop Sunset Party 🌅',
      description: 'What an unforgettable evening with amazing city views, craft cocktails, and live DJ sets! Perfect vibes were definitely achieved ✨ Thanks to everyone who came!',
      date: '2024-11-13',
      time: '6:00 PM',
      location: 'Bandra West, Mumbai',
      price: '₹1,500',
      category: 'Party'
    },
    collage: {
      photos: [
        {
          id: 'photo_1',
          url: 'https://picsum.photos/400/400?random=1',
          contributorId: 'user_5',
          contributorName: 'Alex Chen',
          contributorUsername: 'alexc_photos',
          contributorAvatar: 'https://picsum.photos/50/50?random=25'
        },
        {
          id: 'photo_2',
          url: 'https://picsum.photos/400/400?random=2',
          contributorId: 'user_6',
          contributorName: 'Maya Patel',
          contributorUsername: 'maya_captures',
          contributorAvatar: 'https://picsum.photos/50/50?random=26'
        },
        {
          id: 'photo_3',
          url: 'https://picsum.photos/400/400?random=3',
          contributorId: 'user_7',
          contributorName: 'Raj Singh',
          contributorUsername: 'raj_moments',
          contributorAvatar: 'https://picsum.photos/50/50?random=27'
        },
        {
          id: 'photo_4',
          url: 'https://picsum.photos/400/400?random=4',
          contributorId: 'user_8',
          contributorName: 'Emma Wilson',
          contributorUsername: 'emma_snaps',
          contributorAvatar: 'https://picsum.photos/50/50?random=28'
        }
      ],
      totalContributors: 12,
      totalPhotos: 28
    },
    stats: {
      likes: 247,
      comments: 28,
      attendees: 156
    },
    timePosted: '1 day ago',
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '2',
    host: {
      id: 'user_2',
      name: 'Mumbai Food Tours',
      username: 'mumbai_foodie',
      avatar: 'https://picsum.photos/100/100?random=22',
      isVerified: false
    },
    event: {
      title: 'Street Food Carnival 🍛',
      description: 'We explored authentic Mumbai street food with local guides! From vada pav to kulfi, we tasted it all in one amazing food walk 🥘 Such a delicious adventure!',
      date: '2024-11-10',
      time: '11:00 AM',
      location: 'Connaught Place, Delhi',
      price: '₹800',
      category: 'Food & Drink'
    },
    collage: {
      photos: [
        {
          id: 'photo_5',
          url: 'https://picsum.photos/400/400?random=5',
          contributorId: 'user_9',
          contributorName: 'Priya Sharma',
          contributorUsername: 'priya_foodie',
          contributorAvatar: 'https://picsum.photos/50/50?random=29'
        },
        {
          id: 'photo_6',
          url: 'https://picsum.photos/400/400?random=6',
          contributorId: 'user_10',
          contributorName: 'David Kumar',
          contributorUsername: 'david_eats',
          contributorAvatar: 'https://picsum.photos/50/50?random=30'
        },
        {
          id: 'photo_7',
          url: 'https://picsum.photos/400/400?random=7',
          contributorId: 'user_11',
          contributorName: 'Lisa Brown',
          contributorUsername: 'lisa_tastes',
          contributorAvatar: 'https://picsum.photos/50/50?random=31'
        },
        {
          id: 'photo_8',
          url: 'https://picsum.photos/400/400?random=8',
          contributorId: 'user_12',
          contributorName: 'Arjun Mehta',
          contributorUsername: 'arjun_food',
          contributorAvatar: 'https://picsum.photos/50/50?random=32'
        }
      ],
      totalContributors: 8,
      totalPhotos: 24
    },
    stats: {
      likes: 189,
      comments: 42,
      attendees: 89
    },
    timePosted: '3 days ago',
    isLiked: true,
    isBookmarked: true
  },
  {
    id: '3',
    host: {
      id: 'user_3',
      name: 'Indie Collective',
      username: 'indie_blr',
      avatar: 'https://picsum.photos/100/100?random=23',
      isVerified: true
    },
    event: {
      title: 'Indie Music Night 🎵',
      description: 'We discovered fresh indie artists and emerging bands in an intimate venue. Great music, good vibes, and amazing company! 🎸 The energy was incredible!',
      date: '2024-11-08',
      time: '7:30 PM',
      location: 'Koramangala, Bangalore',
      price: '₹600',
      category: 'Music'
    },
    collage: {
      photos: [
        {
          id: 'photo_9',
          url: 'https://picsum.photos/400/400?random=9',
          contributorId: 'user_13',
          contributorName: 'Sam Rodriguez',
          contributorUsername: 'sam_music',
          contributorAvatar: 'https://picsum.photos/50/50?random=33'
        },
        {
          id: 'photo_10',
          url: 'https://picsum.photos/400/400?random=10',
          contributorId: 'user_14',
          contributorName: 'Anita Desai',
          contributorUsername: 'anita_vibes',
          contributorAvatar: 'https://picsum.photos/50/50?random=34'
        },
        {
          id: 'photo_11',
          url: 'https://picsum.photos/400/400?random=11',
          contributorId: 'user_15',
          contributorName: 'Tom Jackson',
          contributorUsername: 'tom_beats',
          contributorAvatar: 'https://picsum.photos/50/50?random=35'
        },
        {
          id: 'photo_12',
          url: 'https://picsum.photos/400/400?random=12',
          contributorId: 'user_16',
          contributorName: 'Kavya Nair',
          contributorUsername: 'kavya_sound',
          contributorAvatar: 'https://picsum.photos/50/50?random=36'
        }
      ],
      totalContributors: 15,
      totalPhotos: 42
    },
    stats: {
      likes: 312,
      comments: 67,
      attendees: 201
    },
    timePosted: '5 days ago',
    isLiked: false,
    isBookmarked: false
  }
];

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Instagram-style Feed */}
        {feedPosts.map((post) => (
          <View key={post.id} style={styles.postContainer}>
            {/* Post Header */}
            <View style={styles.postHeader}>
              <View style={styles.hostInfo}>
                <Image source={{ uri: post.host.avatar }} style={styles.hostAvatar} />
                <View style={styles.hostDetails}>
                  <View style={styles.hostNameContainer}>
                    <Text style={styles.hostName}>{post.host.name}</Text>
                    {post.host.isVerified && (
                      <Ionicons name="checkmark-circle" size={16} color="#6366F1" style={styles.verifiedIcon} />
                    )}
                  </View>
                  <Text style={styles.hostUsername}>@{post.host.username}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Collaborative Collage */}
            <View style={styles.collageContainer}>
              <View style={styles.collageGrid}>
                {post.collage.photos.slice(0, 4).map((photo, index) => (
                  <TouchableOpacity 
                    key={photo.id} 
                    style={[
                      styles.collagePhoto,
                      index === 0 && styles.topLeft,
                      index === 1 && styles.topRight,
                      index === 2 && styles.bottomLeft,
                      index === 3 && styles.bottomRight,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: photo.url }} style={styles.collageImage} />
                    
                    {/* Contributor Attribution */}
                    <View style={styles.contributorOverlay}>
                      <Image source={{ uri: photo.contributorAvatar }} style={styles.contributorAvatar} />
                    </View>
                    
                    {/* More Photos Indicator (only on last photo if there are more) */}
                    {index === 3 && post.collage.totalPhotos > 4 && (
                      <View style={styles.morePhotosOverlay}>
                        <Text style={styles.morePhotosText}>+{post.collage.totalPhotos - 4}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Contributors Info */}
              <View style={styles.contributorsInfo}>
                <View style={styles.contributorAvatars}>
                  {post.collage.photos.slice(0, 3).map((photo) => (
                    <Image 
                      key={photo.contributorId} 
                      source={{ uri: photo.contributorAvatar }} 
                      style={styles.contributorAvatarSmall} 
                    />
                  ))}
                  {post.collage.totalContributors > 3 && (
                    <View style={styles.moreContributors}>
                      <Text style={styles.moreContributorsText}>+{post.collage.totalContributors - 3}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.contributorsText}>
                  {post.collage.totalContributors} contributors • {post.collage.totalPhotos} photos
                </Text>
              </View>
            </View>

            {/* Post Actions */}
            <View style={styles.postActions}>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons 
                    name={post.isLiked ? "heart" : "heart-outline"} 
                    size={24} 
                    color={post.isLiked ? "#EF4444" : "#111827"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={24} color="#111827" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="paper-plane-outline" size={24} color="#111827" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.bookmarkButton}>
                <Ionicons 
                  name={post.isBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={post.isBookmarked ? "#111827" : "#111827"} 
                />
              </TouchableOpacity>
            </View>

            {/* Post Stats */}
            <View style={styles.postStats}>
              <Text style={styles.likesText}>{post.stats.likes} likes</Text>
            </View>

            {/* Event Details */}
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>
                <Text style={styles.hostNameInline}>@{post.host.username}</Text>
                {' '}{post.event.title}
              </Text>
              <Text style={styles.eventDescription}>{post.event.description}</Text>
              
              <View style={styles.eventMeta}>
                <View style={styles.eventMetaRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.metaText}>{post.event.date} at {post.event.time}</Text>
                </View>
                <View style={styles.eventMetaRow}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                  <Text style={styles.metaText}>{post.event.location}</Text>
                </View>
                <View style={styles.eventMetaRow}>
                  <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                  <Text style={styles.metaText}>{post.event.price}</Text>
                </View>
              </View>
            </View>

            {/* Comments Preview */}
            <TouchableOpacity style={styles.commentsSection}>
              <Text style={styles.viewCommentsText}>View all {post.stats.comments} comments</Text>
            </TouchableOpacity>

            {/* Time Posted */}
            <Text style={styles.timePosted}>{post.timePosted}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
});