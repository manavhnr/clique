import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { eventsService, EventData } from '../services/eventsService';
import { searchUsers, UserSearchResult, toggleFollowUser } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { useEventDistances } from '../hooks/useEventDistances';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

export default function DiscoverScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [nearbyEvents, setNearbyEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<(EventData | UserSearchResult)[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchType, setSearchType] = useState<'events' | 'users'>('events');
  const [isSearching, setIsSearching] = useState(false);

  const categories = ['All', 'Music', 'Food & Dining', 'Art & Culture', 'Technology', 'Business', 'Entertainment'];

  // Use the distance calculation hook
  const { 
    eventsWithDistances, 
    locationLoading, 
    locationError, 
    refreshLocation,
    latitude,
    longitude
  } = useEventDistances(nearbyEvents);

  // Add test function to check users in database
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      const usersRef = collection(db, 'users');
      const testQuery = query(usersRef, limit(5));
      const querySnapshot = await getDocs(testQuery);
      
      console.log('Database test - found users:', querySnapshot.size);
      querySnapshot.forEach((doc) => {
        console.log('User:', doc.id, doc.data());
      });
      
      // If no users found, suggest creating test data
      if (querySnapshot.size === 0) {
        console.log('No users found in database. You may need to register some users first.');
        Alert.alert(
          'No Users Found', 
          'There are no users in the database to search. Register a new account or ask the developer to add test users.',
          [{ text: 'OK', onPress: () => {} }]
        );
      }
    } catch (error) {
      console.error('Database test error:', error);
      Alert.alert('Database Error', 'Could not connect to user database. Check your internet connection.');
    }
  };

  // Load events from Firebase
  useEffect(() => {
    loadEvents();
    // Test database on load
    testDatabaseConnection();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
    }, [])
  );

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const events = await eventsService.getPublishedEvents();
      console.log('📊 Loaded events:', events.length);
      
      // If no events exist, create sample events
      if (events.length === 0) {
        console.log('🔨 No events found, creating sample events...');
        await eventsService.createSampleEvents();
        // Reload events after creating samples
        const newEvents = await eventsService.getPublishedEvents();
        console.log('📊 Created sample events:', newEvents.length);
        setNearbyEvents(newEvents);
        return;
      }
      
      events.forEach((event, index) => {
        console.log(`Event ${index + 1}: ${event.title}`, {
          hasCoordinates: !!event.location.coordinates,
          coordinates: event.location.coordinates,
          location: event.location
        });
      });
      setNearbyEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadEvents(),
      refreshLocation()
    ]);
    setRefreshing(false);
  };

  const handleChatPress = () => {
    navigation.navigate('ChatList');
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setShowSearchResults(true);
    setIsSearching(true);
    
    try {
      if (searchType === 'users') {
        // Search real user database
        console.log('Searching users with query:', query);
        const users = await searchUsers(query, 20);
        console.log('Search results received:', users);
        setSearchResults(users);
      } else {
        // Search events (existing functionality)
        const filteredEvents = nearbyEvents.filter(event =>
          event.title?.toLowerCase().includes(query.toLowerCase()) ||
          event.description?.toLowerCase().includes(query.toLowerCase()) ||
          event.location?.name?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredEvents);
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollowUser = async (targetUserId: string) => {
    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please log in to follow users.');
      return;
    }

    try {
      const targetUser = searchResults.find(u => u.id === targetUserId) as UserSearchResult;
      if (!targetUser) return;

      const newFollowingStatus = await toggleFollowUser(user.id, targetUserId, targetUser.isFollowing || false);
      
      // Update local state
      setSearchResults(prev => 
        prev.map(result => {
          if ('username' in result && result.id === targetUserId) {
            return { ...result, isFollowing: newFollowingStatus };
          }
          return result;
        })
      );
    } catch (error) {
      console.error('Follow error:', error);
      Alert.alert('Error', 'Failed to update follow status. Please try again.');
    }
  };

  const handleUserProfile = (userId: string) => {
    Alert.alert('Profile', `Navigate to user profile: ${userId}`);
  };

  const handleMessageUser = async (targetUserId: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to send messages');
      return;
    }

    if (targetUserId === user.id) {
      Alert.alert('Error', 'You cannot message yourself');
      return;
    }

    try {
      const { chatService } = await import('../services/chatService');
      const conversationId = await chatService.startConversation(user.id, targetUserId);
      
      // Get target user info for navigation
      const targetUser = searchResults.find(result => 'username' in result && result.id === targetUserId) as any;
      
      navigation.navigate('Chat', {
        conversationId,
        otherUserId: targetUserId,
        otherUserName: targetUser?.name || targetUser?.username || 'User',
        otherUserAvatar: targetUser?.avatar,
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    }
  };

  const filteredEvents = eventsWithDistances.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
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

      {/* Debug Location Status - Remove in production */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            🧪 DEBUG - Location: {latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Not available'}
          </Text>
          <Text style={styles.debugText}>
            Events: {eventsWithDistances.length} | Loading: {locationLoading ? 'Yes' : 'No'}
          </Text>
          {locationError && (
            <Text style={styles.debugError}>Error: {locationError}</Text>
          )}
        </View>
      )}

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Location Status Indicator */}
        {locationError && (
          <View style={styles.locationErrorContainer}>
            <View style={styles.locationErrorContent}>
              <Ionicons name="location-outline" size={16} color="#EF4444" />
              <Text style={styles.locationErrorText}>
                {locationError}
              </Text>
              <TouchableOpacity
                style={styles.refreshLocationButton}
                onPress={refreshLocation}
              >
                <Text style={styles.refreshLocationText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          {/* Search Type Toggle */}
          <View style={styles.searchTypeContainer}>
            <TouchableOpacity
              style={[styles.searchTypeButton, searchType === 'events' && styles.activeSearchType]}
              onPress={() => {
                setSearchType('events');
                if (searchQuery) handleSearch(searchQuery);
              }}
            >
              <Text style={[styles.searchTypeText, searchType === 'events' && styles.activeSearchTypeText]}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.searchTypeButton, searchType === 'users' && styles.activeSearchType]}
              onPress={() => {
                setSearchType('users');
                if (searchQuery) handleSearch(searchQuery);
              }}
            >
              <Text style={[styles.searchTypeText, searchType === 'users' && styles.activeSearchTypeText]}>Users</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${searchType}...`}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.activeCategoryChip,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.activeCategoryChipText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Results */}
        {showSearchResults && (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.searchResultsTitle}>
              {isSearching ? 'Searching...' : `${searchResults.length} ${searchType} found`}
            </Text>
            
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchType === 'users' ? (
              // User Results
              searchResults.map((result) => {
                const userResult = result as UserSearchResult;
                return (
                  <TouchableOpacity 
                    key={userResult.id} 
                    style={styles.userCard}
                    onPress={() => handleUserProfile(userResult.id)}
                  >
                    <Image source={{ uri: userResult.avatar || 'https://picsum.photos/50/50?random=1' }} style={styles.userAvatar} />
                    <View style={styles.userInfo}>
                      <View style={styles.userHeader}>
                        <Text style={styles.userName}>{userResult.name}</Text>
                        <Text style={styles.userUsername}>@{userResult.username}</Text>
                      </View>
                      <Text style={styles.userBio}>{userResult.bio}</Text>
                      <Text style={styles.userFollowers}>{userResult.followers} followers</Text>
                    </View>
                    <View style={styles.userActions}>
                      <TouchableOpacity 
                        style={styles.messageButton}
                        onPress={() => handleMessageUser(userResult.id)}
                      >
                        <Ionicons name="chatbubble-outline" size={20} color="#6366F1" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.followButton, userResult.isFollowing && styles.followingButton]}
                        onPress={() => handleFollowUser(userResult.id)}
                      >
                        <Text style={[styles.followButtonText, userResult.isFollowing && styles.followingButtonText]}>
                          {userResult.isFollowing ? 'Following' : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              // Event Results (existing event cards)
              searchResults.map((result) => {
                const eventResult = result as EventData;
                return (
                  <TouchableOpacity
                    key={eventResult.id}
                    style={styles.eventCard}
                    onPress={() => navigation.navigate('EventDetails', { eventId: eventResult.id })}
                  >
                    <Image source={{ uri: eventResult.images?.[0] || 'https://picsum.photos/400/200?random=10' }} style={styles.eventImage} />
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{eventResult.title}</Text>
                      <Text style={styles.eventDescription} numberOfLines={2}>{eventResult.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
            
            {!isSearching && searchResults.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color="#D1D5DB" />
                <Text style={styles.noResultsText}>No {searchType} found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try adjusting your search terms
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        )}

        {/* Default User Search State */}
        {!showSearchResults && searchType === 'users' && (
          <View style={styles.defaultUserSearchContainer}>
            <View style={styles.defaultUserSearchContent}>
              <Ionicons name="people-outline" size={64} color="#9CA3AF" />
              <Text style={styles.defaultUserSearchTitle}>Discover People</Text>
              <Text style={styles.defaultUserSearchSubtitle}>
                Search for users by name or username to connect with like-minded people
              </Text>
            </View>
          </View>
        )}
        {!isLoading && !showSearchResults && searchType === 'events' && (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filteredEvents.length} Events Near You
              </Text>
              <TouchableOpacity>
                <Ionicons name="options" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {filteredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}
                activeOpacity={0.7}
              >
                <View style={styles.eventImageContainer}>
                  <Image 
                    source={{ uri: event.images[0] || 'https://picsum.photos/400/300?random=1' }} 
                    style={styles.eventImage} 
                  />
                  <View style={styles.eventImageOverlay}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.ratingText}>{event.reviews.rating || 4.5}</Text>
                    </View>
                  </View>
                  <View style={styles.distanceTag}>
                    <Text style={styles.distanceText}>
                      {event.distance?.formatted || 'Distance unavailable'}
                    </Text>
                  </View>
                </View>

                <View style={styles.eventInfo}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventPrice}>₹{event.pricing.regular.price}</Text>
                  </View>

                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>

                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailItem}>
                      <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                      <Text style={styles.eventDetailText}>{event.date}</Text>
                    </View>
                    <View style={styles.eventDetailItem}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.eventDetailText}>{event.time}</Text>
                    </View>
                  </View>

                  <View style={styles.eventFooter}>
                    <View style={styles.eventDetailItem}>
                      <Ionicons name="location-outline" size={14} color="#6B7280" />
                      <Text style={styles.eventDetailText} numberOfLines={1}>
                        {event.location.name}
                      </Text>
                    </View>
                    <View style={styles.attendeesContainer}>
                      <Ionicons name="people-outline" size={14} color="#6B7280" />
                      <Text style={styles.attendeesText}>{event.capacity.booked} going</Text>
                    </View>
                  </View>

                  <View style={styles.eventHost}>
                    <Text style={styles.hostLabel}>Hosted by</Text>
                    <Text style={styles.hostName}>{event.host.name}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State - only show when in events mode and no search results */}
        {!isLoading && !showSearchResults && searchType === 'events' && filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No events found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your search or category filter
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
  debugContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'monospace',
  },
  debugError: {
    fontSize: 12,
    color: '#DC2626',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  locationErrorContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  locationErrorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationErrorText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
    marginLeft: 8,
  },
  refreshLocationButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  refreshLocationText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeCategoryChip: {
    backgroundColor: '#8B5CF6',
  },
  categoryChipText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  eventImageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  distanceTag: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  eventInfo: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  eventDetailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  eventHost: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  hostName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
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
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Search functionality styles
  searchTypeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeSearchType: {
    backgroundColor: '#6366F1',
  },
  searchTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeSearchTypeText: {
    color: '#FFFFFF',
  },
  searchResultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  userUsername: {
    fontSize: 14,
    color: '#6B7280',
  },
  userBio: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userFollowers: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageButton: {
    width: 40,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#6366F1',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  // Default user search state
  defaultUserSearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  defaultUserSearchContent: {
    alignItems: 'center',
    maxWidth: 280,
  },
  defaultUserSearchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    textAlign: 'center',
  },
  defaultUserSearchSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});