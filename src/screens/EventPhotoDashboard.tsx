import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Mock data for event photo collage
const mockEventPhotos = [
  {
    id: '1',
    url: 'https://picsum.photos/400/600?random=1',
    contributor: {
      id: 'user_1',
      name: 'Sarah Johnson',
      username: 'sarahj_events',
      avatar: 'https://picsum.photos/100/100?random=21',
    },
    timestamp: '2 hours ago',
    likes: 23,
    isLiked: false,
  },
  {
    id: '2',
    url: 'https://picsum.photos/400/500?random=2',
    contributor: {
      id: 'user_5',
      name: 'Alex Chen',
      username: 'alexc_photos',
      avatar: 'https://picsum.photos/100/100?random=25',
    },
    timestamp: '3 hours ago',
    likes: 45,
    isLiked: true,
  },
  {
    id: '3',
    url: 'https://picsum.photos/400/700?random=3',
    contributor: {
      id: 'user_6',
      name: 'Maya Patel',
      username: 'maya_captures',
      avatar: 'https://picsum.photos/100/100?random=26',
    },
    timestamp: '4 hours ago',
    likes: 67,
    isLiked: false,
  },
  {
    id: '4',
    url: 'https://picsum.photos/400/450?random=4',
    contributor: {
      id: 'user_7',
      name: 'Raj Singh',
      username: 'raj_moments',
      avatar: 'https://picsum.photos/100/100?random=27',
    },
    timestamp: '5 hours ago',
    likes: 34,
    isLiked: true,
  },
  // Add more photos...
  {
    id: '5',
    url: 'https://picsum.photos/400/550?random=5',
    contributor: {
      id: 'user_8',
      name: 'Emma Wilson',
      username: 'emma_snaps',
      avatar: 'https://picsum.photos/100/100?random=28',
    },
    timestamp: '6 hours ago',
    likes: 89,
    isLiked: false,
  },
  {
    id: '6',
    url: 'https://picsum.photos/400/480?random=6',
    contributor: {
      id: 'user_9',
      name: 'Priya Sharma',
      username: 'priya_foodie',
      avatar: 'https://picsum.photos/100/100?random=29',
    },
    timestamp: '7 hours ago',
    likes: 56,
    isLiked: false,
  },
];

export default function EventPhotoDashboard() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId, eventTitle, totalPhotos, totalContributors } = route.params;
  
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');

  const renderPhotoItem = ({ item, index }: { item: any; index: number }) => {
    const isOdd = index % 2 === 1;
    const photoHeight = isOdd ? 180 + (index % 3) * 40 : 160 + (index % 2) * 60;

    return (
      <TouchableOpacity
        style={[
          styles.photoItem,
          { height: viewMode === 'masonry' ? photoHeight : 200 },
        ]}
        onPress={() => setSelectedPhoto(item)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.url }} style={styles.photo} />
        
        {/* Photo Overlay Info */}
        <View style={styles.photoOverlay}>
          <View style={styles.contributorInfo}>
            <Image source={{ uri: item.contributor.avatar }} style={styles.contributorAvatar} />
            <Text style={styles.contributorName}>{item.contributor.name}</Text>
          </View>
          
          <View style={styles.photoStats}>
            <TouchableOpacity style={styles.likeButton}>
              <Ionicons 
                name={item.isLiked ? "heart" : "heart-outline"} 
                size={16} 
                color={item.isLiked ? "#F91880" : "#FFFFFF"} 
              />
              <Text style={styles.likeCount}>{item.likes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F1419" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{eventTitle}</Text>
          <Text style={styles.headerSubtitle}>
            {totalPhotos} photos from {totalContributors} contributors
          </Text>
        </View>
        
        <TouchableOpacity style={styles.viewModeButton} onPress={() => 
          setViewMode(viewMode === 'grid' ? 'masonry' : 'grid')
        }>
          <Ionicons 
            name={viewMode === 'grid' ? "grid-outline" : "apps-outline"} 
            size={24} 
            color="#0F1419" 
          />
        </TouchableOpacity>
      </View>

      {/* Event Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="images-outline" size={16} color="#536471" />
          <Text style={styles.statText}>{totalPhotos} Photos</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color="#536471" />
          <Text style={styles.statText}>{totalContributors} Contributors</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="heart-outline" size={16} color="#536471" />
          <Text style={styles.statText}>1.2k Likes</Text>
        </View>
      </View>

      {/* Photo Grid */}
      <FlatList
        data={mockEventPhotos}
        renderItem={renderPhotoItem}
        numColumns={2}
        contentContainerStyle={styles.photoGrid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        key={viewMode} // Force re-render when view mode changes
      />

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <Modal visible={!!selectedPhoto} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalOverlay} 
              onPress={() => setSelectedPhoto(null)}
              activeOpacity={1}
            >
              <View style={styles.modalContent}>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedPhoto(null)}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <Image source={{ uri: selectedPhoto.url }} style={styles.modalPhoto} />
                
                <View style={styles.modalInfo}>
                  <View style={styles.modalContributor}>
                    <Image 
                      source={{ uri: selectedPhoto.contributor.avatar }} 
                      style={styles.modalContributorAvatar} 
                    />
                    <View>
                      <Text style={styles.modalContributorName}>
                        {selectedPhoto.contributor.name}
                      </Text>
                      <Text style={styles.modalContributorHandle}>
                        @{selectedPhoto.contributor.username} • {selectedPhoto.timestamp}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.modalLikeButton}>
                    <Ionicons 
                      name={selectedPhoto.isLiked ? "heart" : "heart-outline"} 
                      size={20} 
                      color={selectedPhoto.isLiked ? "#F91880" : "#FFFFFF"} 
                    />
                    <Text style={styles.modalLikeCount}>{selectedPhoto.likes}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF3F4',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F1419',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#536471',
    marginTop: 2,
  },
  viewModeButton: {
    padding: 8,
    marginLeft: 8,
  },
  
  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF3F4',
    backgroundColor: '#F7F9FA',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#536471',
    marginLeft: 4,
    fontWeight: '600',
  },
  
  // Photo Grid
  photoGrid: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  photoItem: {
    width: (width - 24) / 2,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  contributorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contributorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  contributorName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  photoStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    zIndex: 1,
    padding: 8,
  },
  modalPhoto: {
    width: '100%',
    height: undefined,
    aspectRatio: 3/4,
    borderRadius: 12,
  },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  modalContributor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalContributorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  modalContributorName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContributorHandle: {
    color: '#8B949E',
    fontSize: 12,
    marginTop: 2,
  },
  modalLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalLikeCount: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '600',
  },
});