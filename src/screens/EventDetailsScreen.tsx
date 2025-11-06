import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Sample event data - in a real app, this would be fetched from an API based on eventId
const getEventDetails = (eventId: string) => {
  const events = {
    '1': {
      id: '1',
      title: 'Summer Music Festival',
      date: 'July 25, 2025',
      time: '6:00 PM',
      location: 'Phoenix Mall, Mumbai',
      fullAddress: 'Phoenix Mall, Kurla West, Mumbai, Maharashtra 400070',
      price: 299,
      category: 'Music',
      icon: 'musical-notes',
      color: '#8B5CF6',
      distance: '2.1 km',
      attendees: 156,
      rating: 4.8,
      description: 'Join us for an amazing evening of live music featuring top artists from across the country. Experience the magic of live performances in an open-air venue with food stalls, merchandise booths, and a vibrant atmosphere.',
      highlights: [
        'Live performances by 8 renowned artists',
        'Food and beverage stalls',
        'Merchandise and photo booths',
        'Free parking available',
        'Age restriction: 16+ only'
      ],
      organizer: 'Mumbai Music Events',
      tags: ['Music', 'Live Performance', 'Outdoor', 'Family Friendly'],
    },
    '2': {
      id: '2',
      title: 'Tech Conference 2025',
      date: 'August 15, 2025',
      time: '9:00 AM',
      location: 'World Trade Center, Bangalore',
      fullAddress: 'World Trade Center, Brigade Gateway Campus, Rajajinagar, Bangalore 560055',
      price: 599,
      category: 'Technology',
      icon: 'desktop',
      color: '#3B82F6',
      distance: '5.3 km',
      attendees: 342,
      rating: 4.9,
      description: 'Connect with industry leaders and learn about the latest technology trends. This comprehensive conference features keynote speakers, panel discussions, networking sessions, and hands-on workshops.',
      highlights: [
        'Keynote by tech industry leaders',
        'Interactive workshops and demos',
        'Networking lunch included',
        'Conference materials provided',
        'Certificate of participation'
      ],
      organizer: 'Tech Events India',
      tags: ['Technology', 'Networking', 'Professional', 'Learning'],
    },
    // Add more events as needed...
  };
  
  return events[eventId as keyof typeof events] || events['1'];
};

export default function EventDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId } = route.params || { eventId: '1' };
  
  const event = getEventDetails(eventId);

  const handleBookNow = () => {
    navigation.navigate('Booking', { eventId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={[styles.eventIconContainer, { backgroundColor: event.color }]}>
            <Ionicons name={event.icon as any} size={48} color="#FFFFFF" />
          </View>
          
          <View style={styles.eventHeaderInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventCategory}>{event.category}</Text>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>{event.rating}</Text>
              <Text style={styles.attendeesText}>({event.attendees} going)</Text>
            </View>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Event Details</Text>
            
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={20} color="#6366F1" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{event.date}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="time" size={20} color="#6366F1" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="location" size={20} color="#6366F1" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
                <Text style={styles.detailSubValue}>{event.fullAddress}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="navigate" size={20} color="#6366F1" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>{event.distance} away</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Highlights */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Event Highlights</Text>
            {event.highlights.map((highlight, index) => (
              <View key={index} style={styles.highlightItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>

          {/* Tags */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {event.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Organizer */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Organizer</Text>
            <View style={styles.organizerContainer}>
              <View style={styles.organizerIcon}>
                <Ionicons name="business" size={20} color="#6366F1" />
              </View>
              <Text style={styles.organizerName}>{event.organizer}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Booking Section */}
      <View style={styles.bookingContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceValue}>₹{event.price}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
  eventHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  eventIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventHeaderInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 8,
  },
  attendeesText: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsContainer: {
    paddingHorizontal: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  detailText: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  detailSubValue: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  organizerName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  bookingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  bookButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});