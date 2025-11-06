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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { eventsService, EventData } from '../services/eventsService';

const { width } = Dimensions.get('window');

export default function DiscoverScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [nearbyEvents, setNearbyEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['All', 'Music', 'Food & Dining', 'Art & Culture', 'Technology', 'Business', 'Entertainment'];

  // Load events
  useEffect(() => {
    loadEvents();
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
      setNearbyEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const filteredEvents = nearbyEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const handlePersonPress = (personId: string) => {
    // Navigate to person's profile - you can implement this navigation
    console.log('Navigate to profile:', personId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Find amazing events near you</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events, locations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
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
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content List */}
        <View style={styles.contentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'events' 
                ? `${filteredEvents.length} Events Near You`
                : `${filteredPeople.length} People Near You`
              }
            </Text>
            <TouchableOpacity>
              <Ionicons name="options" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {activeTab === 'events' ? (
            // Events List
            filteredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}
                activeOpacity={0.7}
              >
                <View style={styles.eventImageContainer}>
                  <Image source={{ uri: event.images[0] || 'https://picsum.photos/400/300?random=1' }} style={styles.eventImage} />
                  <View style={styles.eventImageOverlay}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.ratingText}>{event.reviews.rating || 4.5}</Text>
                    </View>
                  </View>
                  <View style={styles.distanceTag}>
                    <Text style={styles.distanceText}>2.5 km</Text>
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
            ))
          ) : (
            // People List
            filteredPeople.map((person) => (
              <TouchableOpacity
                key={person.id}
                style={styles.personCard}
                onPress={() => handlePersonPress(person.id)}
                activeOpacity={0.7}
              >
                <View style={styles.personHeader}>
                  <View style={styles.personImageContainer}>
                    <Image source={{ uri: person.profileImage }} style={styles.personImage} />
                    <View style={[styles.personStatusBadge, person.isHost ? styles.hostBadge : styles.memberBadge]}>
                      <Ionicons 
                        name={person.isHost ? "star" : "checkmark"} 
                        size={8} 
                        color="#FFFFFF" 
                      />
                    </View>
                  </View>

                  <View style={styles.personInfo}>
                    <View style={styles.personNameRow}>
                      <Text style={styles.personName}>{person.name}</Text>
                      <View style={styles.distanceTag}>
                        <Text style={styles.distanceText}>{person.distance}</Text>
                      </View>
                    </View>
                    <Text style={styles.personUsername}>@{person.username}</Text>
                    <Text style={styles.personBio} numberOfLines={2}>{person.bio}</Text>
                  </View>
                </View>

                <View style={styles.personStats}>
                  <View style={styles.personStat}>
                    <Text style={styles.personStatNumber}>{person.followers}</Text>
                    <Text style={styles.personStatLabel}>Followers</Text>
                  </View>
                  <View style={styles.personStat}>
                    <Text style={styles.personStatNumber}>{person.events}</Text>
                    <Text style={styles.personStatLabel}>Events</Text>
                  </View>
                  <View style={styles.personStat}>
                    <Text style={styles.personStatNumber}>{person.rating}</Text>
                    <Text style={styles.personStatLabel}>Rating</Text>
                  </View>
                </View>

                <View style={styles.personFooter}>
                  <View style={styles.mutualConnections}>
                    <Ionicons name="people" size={14} color="#6B7280" />
                    <Text style={styles.mutualText}>{person.mutualConnections} mutual connections</Text>
                  </View>
                  <View style={styles.personActions}>
                    <TouchableOpacity style={styles.connectButton}>
                      <Text style={styles.connectButtonText}>Connect</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageButton}>
                      <Ionicons name="chatbubble" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.recentActivity}>{person.recentActivity}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {((activeTab === 'events' && filteredEvents.length === 0) || 
          (activeTab === 'people' && filteredPeople.length === 0)) && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'events' ? 'No events found' : 'No people found'}
            </Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#111827',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  // Tab Switcher
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#111827',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
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
    fontWeight: 'bold',
    color: '#111827',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  eventImageContainer: {
    height: 180,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  eventIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  eventPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    flex: 1,
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
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  hostLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  hostName: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Person Card Styles
  personCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  personImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  personImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
  },
  personStatusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
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
  personInfo: {
    flex: 1,
  },
  personNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  personUsername: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  personBio: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  personStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  personStat: {
    alignItems: 'center',
  },
  personStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  personStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  personFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mutualConnections: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mutualText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  personActions: {
    flexDirection: 'row',
    gap: 8,
  },
  connectButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  connectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentActivity: {
    fontSize: 12,
    color: '#8B5CF6',
    fontStyle: 'italic',
  },
});