import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Sample events data - in a real app, this would come from an API
const nearbyEvents = [
  {
    id: '1',
    title: 'Summer Music Festival',
    date: 'July 25, 2025',
    time: '6:00 PM',
    location: 'Phoenix Mall, Mumbai',
    price: 299,
    category: 'Music',
    icon: 'musical-notes',
    color: '#8B5CF6',
    distance: '2.1 km',
    attendees: 156,
    description: 'Join us for an amazing evening of live music featuring top artists from across the country.',
  },
  {
    id: '2',
    title: 'Tech Conference 2025',
    date: 'August 15, 2025',
    time: '9:00 AM',
    location: 'World Trade Center, Bangalore',
    price: 599,
    category: 'Technology',
    icon: 'desktop',
    color: '#3B82F6',
    distance: '5.3 km',
    attendees: 342,
    description: 'Connect with industry leaders and learn about the latest technology trends.',
  },
  {
    id: '3',
    title: 'Food Festival',
    date: 'August 20, 2025',
    time: '12:00 PM',
    location: 'Central Park, Delhi',
    price: 149,
    category: 'Food',
    icon: 'restaurant',
    color: '#EF4444',
    distance: '1.8 km',
    attendees: 89,
    description: 'Taste delicious food from over 50 vendors and enjoy live cooking demonstrations.',
  },
  {
    id: '4',
    title: 'Comedy Night',
    date: 'July 28, 2025',
    time: '8:00 PM',
    location: 'Hard Rock Cafe, Bangalore',
    price: 199,
    category: 'Entertainment',
    icon: 'happy',
    color: '#F59E0B',
    distance: '3.2 km',
    attendees: 67,
    description: 'Laugh out loud with the funniest comedians in town. A night full of entertainment.',
  },
  {
    id: '5',
    title: 'Art Exhibition',
    date: 'August 5, 2025',
    time: '10:00 AM',
    location: 'National Gallery, Mumbai',
    price: 99,
    category: 'Art',
    icon: 'color-palette',
    color: '#10B981',
    distance: '4.1 km',
    attendees: 23,
    description: 'Explore contemporary art from emerging and established artists.',
  },
  {
    id: '6',
    title: 'Dance Workshop',
    date: 'August 10, 2025',
    time: '4:00 PM',
    location: 'Dance Academy, Chennai',
    price: 249,
    category: 'Dance',
    icon: 'musical-note',
    color: '#EC4899',
    distance: '2.7 km',
    attendees: 34,
    description: 'Learn from professional dancers in this intensive workshop session.',
  },
];

// Sample people data - in a real app, this would come from an API
const nearbyPeople = [
  {
    id: '1',
    name: 'Arjun Sharma',
    username: 'arjun_events',
    bio: '🎵 Music lover & Event organizer | Mumbai',
    profileImage: 'https://picsum.photos/150/150?random=1',
    isHost: true,
    followers: 1200,
    following: 340,
    events: 15,
    rating: 4.8,
    distance: '1.2 km',
    mutualConnections: 5,
    interests: ['Music', 'Technology'],
    recentActivity: 'Hosted "Summer Beats Festival" 2 days ago',
  },
  {
    id: '2',
    name: 'Priya Patel',
    username: 'priya_foodie',
    bio: '🍕 Food enthusiast | Photographer | Bangalore',
    profileImage: 'https://picsum.photos/150/150?random=2',
    isHost: false,
    followers: 850,
    following: 920,
    events: 3,
    rating: 4.6,
    distance: '2.8 km',
    mutualConnections: 8,
    interests: ['Food', 'Photography'],
    recentActivity: 'Attended "Street Food Festival" 1 day ago',
  },
  {
    id: '3',
    name: 'Raj Kumar',
    username: 'raj_techie',
    bio: '💻 Tech entrepreneur | Startup founder | Delhi',
    profileImage: 'https://picsum.photos/150/150?random=3',
    isHost: true,
    followers: 2100,
    following: 180,
    events: 8,
    rating: 4.9,
    distance: '3.5 km',
    mutualConnections: 12,
    interests: ['Technology', 'Business'],
    recentActivity: 'Hosting "AI Conference 2025" next week',
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    username: 'sneha_artist',
    bio: '🎨 Digital artist | Art teacher | Chennai',
    profileImage: 'https://picsum.photos/150/150?random=4',
    isHost: false,
    followers: 650,
    following: 420,
    events: 6,
    rating: 4.7,
    distance: '1.8 km',
    mutualConnections: 3,
    interests: ['Art', 'Design'],
    recentActivity: 'Shared artwork from "Modern Art Expo"',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    username: 'vikram_fitness',
    bio: '💪 Fitness coach | Marathon runner | Pune',
    profileImage: 'https://picsum.photos/150/150?random=5',
    isHost: true,
    followers: 980,
    following: 210,
    events: 12,
    rating: 4.8,
    distance: '4.2 km',
    mutualConnections: 7,
    interests: ['Fitness', 'Sports'],
    recentActivity: 'Organized "Morning Run Club" yesterday',
  },
];

export default function DiscoverScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('events');

  const categories = ['All', 'Music', 'Technology', 'Food', 'Entertainment', 'Art', 'Dance'];

  const filteredEvents = nearbyEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPeople = nearbyPeople.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           person.interests.some(interest => interest === selectedCategory);
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>
            {activeTab === 'events' ? 'Find amazing events near you' : 'Connect with people around you'}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'events' && styles.activeTab]}
            onPress={() => setActiveTab('events')}
          >
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color={activeTab === 'events' ? '#FFFFFF' : '#6B7280'} 
            />
            <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
              Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'people' && styles.activeTab]}
            onPress={() => setActiveTab('people')}
          >
            <Ionicons 
              name="people-outline" 
              size={20} 
              color={activeTab === 'people' ? '#FFFFFF' : '#6B7280'} 
            />
            <Text style={[styles.tabText, activeTab === 'people' && styles.activeTabText]}>
              People
            </Text>
          </TouchableOpacity>
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
                  <View style={[styles.eventIconContainer, { backgroundColor: event.color }]}>
                    <Ionicons name={event.icon as any} size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.distanceTag}>
                    <Text style={styles.distanceText}>{event.distance}</Text>
                  </View>
                </View>

                <View style={styles.eventInfo}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventPrice}>₹{event.price}</Text>
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
                        {event.location}
                      </Text>
                    </View>
                    <View style={styles.attendeesContainer}>
                      <Ionicons name="people-outline" size={14} color="#6B7280" />
                      <Text style={styles.attendeesText}>{event.attendees} going</Text>
                    </View>
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
    height: 120,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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