import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { eventsService, EventData } from '../services/eventsService';

const { width, height } = Dimensions.get('window');

interface EventDetailsProps {
  route: {
    params: {
      eventId: string;
    };
  };
}

export default function EventDetailsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { eventId } = route.params as { eventId: string };
  
  const [selectedTicket, setSelectedTicket] = useState('regular');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setIsLoading(true);
      const eventData = await eventsService.getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = () => {
    if (event) {
      navigation.navigate('Booking', { eventId: event.id });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Event Not Found</Text>
          <Text style={styles.errorMessage}>The event you're looking for could not be found.</Text>
          <TouchableOpacity style={styles.backToEventsButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backToEventsText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Event Images Carousel */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.images[currentImageIndex] || 'https://picsum.photos/400/600?random=1' }} style={styles.eventImage} />
          <View style={styles.imageIndicators}>
            {event.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.indicator, index === currentImageIndex && styles.activeIndicator]}
                onPress={() => setCurrentImageIndex(index)}
              />
            ))}
          </View>
        </View>

        {/* Event Info */}
        <View style={styles.contentContainer}>
          {/* Title & Host */}
          <View style={styles.titleSection}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.hostInfo}>
              <Image source={{ uri: event.host.avatar || 'https://picsum.photos/100/100?random=21' }} style={styles.hostAvatar} />
              <View style={styles.hostDetails}>
                <View style={styles.hostNameContainer}>
                  <Text style={styles.hostName}>{event.host.name}</Text>
                  {event.host.isVerified && (
                    <Ionicons name="checkmark-circle" size={16} color="#6366F1" style={styles.verifiedIcon} />
                  )}
                </View>
                <Text style={styles.hostUsername}>@{event.host.username || 'host'}</Text>
                <View style={styles.hostStats}>
                  <View style={styles.hostStat}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.hostStatText}>{event.host.rating || 4.5}</Text>
                  </View>
                  <Text style={styles.hostStatSeparator}>•</Text>
                  <Text style={styles.hostStatText}>{event.host.eventsHosted || 0} events</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date, Time & Location */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>{event.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>{event.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <View style={styles.locationInfo}>
                <Text style={styles.detailText}>{event.location.name}</Text>
                <Text style={styles.locationAddress}>{event.location.address}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Amenities */}
          {event.amenities && event.amenities.length > 0 && (
            <View style={styles.amenitiesSection}>
              <Text style={styles.sectionTitle}>What's Included</Text>
              <View style={styles.amenitiesGrid}>
                {event.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Ticket Selection */}
          <View style={styles.ticketSection}>
            <Text style={styles.sectionTitle}>Select Ticket</Text>
            {Object.entries(event.pricing).map(([key, ticket]) => (
              <TouchableOpacity
                key={key}
                style={[styles.ticketOption, selectedTicket === key && styles.selectedTicket]}
                onPress={() => setSelectedTicket(key)}
              >
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketLabel}>{ticket.label}</Text>
                  <Text style={styles.ticketPrice}>₹{ticket.price}</Text>
                </View>
                <View style={[styles.ticketRadio, selectedTicket === key && styles.selectedRadio]}>
                  {selectedTicket === key && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Event Rules */}
          <View style={styles.rulesSection}>
            <Text style={styles.sectionTitle}>Event Rules</Text>
            {event.ageRestriction && (
              <View style={styles.ruleItem}>
                <Text style={styles.ruleLabel}>Age Restriction:</Text>
                <Text style={styles.ruleValue}>{event.ageRestriction}</Text>
              </View>
            )}
            {event.dressCode && (
              <View style={styles.ruleItem}>
                <Text style={styles.ruleLabel}>Dress Code:</Text>
                <Text style={styles.ruleValue}>{event.dressCode}</Text>
              </View>
            )}
            <View style={styles.ruleItem}>
              <Text style={styles.ruleLabel}>Capacity:</Text>
              <Text style={styles.ruleValue}>{event.capacity.total - event.capacity.booked} spots remaining</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Booking Bar */}
      <View style={styles.bookingBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.price}>₹{event.pricing[selectedTicket as keyof typeof event.pricing]?.price || 0}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
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
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  eventImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 4,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  hostUsername: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  hostStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  hostStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostStatText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  hostStatSeparator: {
    fontSize: 12,
    color: '#6B7280',
    marginHorizontal: 8,
  },
  followButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  amenitiesSection: {
    marginBottom: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
  },
  ticketSection: {
    marginBottom: 24,
  },
  ticketOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  selectedTicket: {
    borderColor: '#6366F1',
    backgroundColor: '#F8FAFF',
  },
  ticketInfo: {
    flex: 1,
  },
  ticketLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
    marginTop: 4,
  },
  ticketRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    borderColor: '#6366F1',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  rulesSection: {
    marginBottom: 100,
  },
  ruleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ruleLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  ruleValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  bookingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 34,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  bookButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 16,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backToEventsButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToEventsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});