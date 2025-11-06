import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface EventExperience {
  id: string;
  eventName: string;
  eventType: string;
  location: string;
  date: string;
  description: string;
  attendeeCount: number;
  rating: number;
  highlights: string[];
  priceRange: string;
  organizer: string;
  tags: string[];
  icon: string;
  color: string;
}

// Mock data for event experiences and recommendations
const eventExperiences: EventExperience[] = [
  {
    id: '1',
    eventName: 'Rooftop Networking Mixer',
    eventType: 'Business Networking',
    location: 'Downtown Skybar, Mumbai',
    date: 'Every Friday',
    description: 'Connect with like-minded professionals in a stunning rooftop setting with panoramic city views.',
    attendeeCount: 50,
    rating: 4.8,
    highlights: ['Stunning city views', 'Quality networking', 'Professional crowd', 'Great cocktails'],
    priceRange: '₹500 - ₹800',
    organizer: 'Business Connect Mumbai',
    tags: ['Networking', 'Business', 'Rooftop', 'Professional'],
    icon: 'business',
    color: '#6366F1',
  },
  {
    id: '2',
    eventName: 'Live Jazz Sessions',
    eventType: 'Music Performance',
    location: 'Blue Note Cafe, Bangalore',
    date: 'Every Wednesday',
    description: 'Intimate jazz performances featuring local and visiting musicians in a cozy cafe atmosphere.',
    attendeeCount: 80,
    rating: 4.9,
    highlights: ['Live performances', 'Intimate setting', 'Great acoustics', 'Craft cocktails'],
    priceRange: '₹300 - ₹500',
    organizer: 'Blue Note Entertainment',
    tags: ['Music', 'Jazz', 'Live Performance', 'Intimate'],
    icon: 'musical-notes',
    color: '#8B5CF6',
  },
  {
    id: '3',
    eventName: 'Weekend Food Truck Rally',
    eventType: 'Food Festival',
    location: 'Central Park, Delhi',
    date: 'Every Saturday',
    description: 'Diverse food trucks offering cuisines from around the world in a family-friendly park setting.',
    attendeeCount: 200,
    rating: 4.7,
    highlights: ['Diverse cuisines', 'Family friendly', 'Outdoor setting', 'Live music'],
    priceRange: '₹200 - ₹600',
    organizer: 'Delhi Food Collective',
    tags: ['Food', 'Family', 'Outdoor', 'Weekend'],
    icon: 'restaurant',
    color: '#EF4444',
  },
  {
    id: '4',
    eventName: 'Sunrise Beach Yoga',
    eventType: 'Wellness Activity',
    location: 'Juhu Beach, Mumbai',
    date: 'Daily at 6:00 AM',
    description: 'Start your day with peaceful yoga sessions on the beach, suitable for all levels.',
    attendeeCount: 25,
    rating: 4.6,
    highlights: ['Beach setting', 'All levels welcome', 'Morning energy', 'Peaceful atmosphere'],
    priceRange: '₹150 - ₹300',
    organizer: 'Beach Wellness Mumbai',
    tags: ['Yoga', 'Wellness', 'Beach', 'Morning'],
    icon: 'fitness',
    color: '#10B981',
  },
  {
    id: '5',
    eventName: 'Art Gallery Openings',
    eventType: 'Cultural Event',
    location: 'Multiple galleries, Bangalore',
    date: 'Monthly',
    description: 'Discover contemporary art from local and international artists in curated gallery spaces.',
    attendeeCount: 60,
    rating: 4.5,
    highlights: ['Contemporary art', 'Meet artists', 'Cultural experience', 'Art community'],
    priceRange: 'Free - ₹200',
    organizer: 'Bangalore Art Circuit',
    tags: ['Art', 'Culture', 'Gallery', 'Contemporary'],
    icon: 'color-palette',
    color: '#F59E0B',
  },
  {
    id: '6',
    eventName: 'Tech Startup Meetups',
    eventType: 'Technology',
    location: 'Various co-working spaces',
    date: 'Bi-weekly',
    description: 'Connect with entrepreneurs, developers, and innovators in the tech startup ecosystem.',
    attendeeCount: 75,
    rating: 4.7,
    highlights: ['Startup ecosystem', 'Networking', 'Learning sessions', 'Innovation'],
    priceRange: 'Free - ₹300',
    organizer: 'Tech Startup Community',
    tags: ['Technology', 'Startup', 'Innovation', 'Networking'],
    icon: 'rocket',
    color: '#3B82F6',
  },
];

export default function ExploreScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Set<string>>(new Set());

  const categories = ['All', 'Business', 'Music', 'Food', 'Wellness', 'Culture', 'Technology'];

  const filteredEvents = eventExperiences.filter((event) => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.eventType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.eventType.includes(selectedCategory) || event.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleBookmark = (eventId: string) => {
    const newBookmarks = new Set(bookmarkedEvents);
    if (bookmarkedEvents.has(eventId)) {
      newBookmarks.delete(eventId);
    } else {
      newBookmarks.add(eventId);
    }
    setBookmarkedEvents(newBookmarks);
  };

  const renderEventExperience = (event: EventExperience) => {
    const isBookmarked = bookmarkedEvents.has(event.id);

    return (
      <TouchableOpacity 
        key={event.id} 
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
        activeOpacity={0.7}
      >
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={[styles.eventIcon, { backgroundColor: event.color }]}>
            <Ionicons name={event.icon as any} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.eventMainInfo}>
            <Text style={styles.eventTitle}>{event.eventName}</Text>
            <Text style={styles.eventType}>{event.eventType}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => handleBookmark(event.id)}
            style={styles.bookmarkButton}
          >
            <Ionicons 
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
              size={20} 
              color={isBookmarked ? event.color : '#6B7280'} 
            />
          </TouchableOpacity>
        </View>

        {/* Event Details */}
        <View style={styles.eventDetails}>
          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{event.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{event.date}</Text>
            </View>
          </View>

          <Text style={styles.eventDescription} numberOfLines={3}>
            {event.description}
          </Text>

          {/* Event Stats */}
          <View style={styles.eventStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.statText}>{event.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>{event.attendeeCount} attendees</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="pricetag-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>{event.priceRange}</Text>
            </View>
          </View>

          {/* Event Highlights */}
          <View style={styles.highlightsContainer}>
            {event.highlights.slice(0, 3).map((highlight, index) => (
              <View key={index} style={styles.highlightTag}>
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>

          {/* Event Tags */}
          <View style={styles.tagsContainer}>
            {event.tags.slice(0, 4).map((tag, index) => (
              <Text key={index} style={styles.tag}>#{tag.toLowerCase()}</Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore Events</Text>
          <Text style={styles.headerSubtitle}>Discover amazing experiences in your city</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events, locations, types..."
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

        {/* Events List */}
        <View style={styles.eventsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {filteredEvents.length} Event Experience{filteredEvents.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity>
              <Ionicons name="filter" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {filteredEvents.map(renderEventExperience)}
        </View>

        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No experiences found</Text>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
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
  eventsContainer: {
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
    marginBottom: 20,
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
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventMainInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  eventType: {
    fontSize: 14,
    color: '#6B7280',
  },
  bookmarkButton: {
    padding: 8,
  },
  eventDetails: {
    padding: 16,
  },
  eventMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  eventDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  highlightTag: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0EA5E9',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  highlightText: {
    fontSize: 11,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 12,
    color: '#8B5CF6',
    marginRight: 8,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
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
});