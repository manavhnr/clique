import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { eventsService } from '../services/eventsService';
import { UserBooking } from '../types/booking';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

// Mock data for events
const mockPastEvents = [
  {
    id: '1',
    title: 'Rooftop Music Festival',
    date: 'Oct 25, 2025',
    location: 'Bandra West, Mumbai',
    image: 'https://picsum.photos/400/200?random=20',
    status: 'attended',
    rating: 5,
  },
  {
    id: '2',
    title: 'Food & Wine Carnival',
    date: 'Oct 18, 2025',
    location: 'Connaught Place, Delhi',
    image: 'https://picsum.photos/400/200?random=21',
    status: 'attended',
    rating: 4,
  },
];

const mockPendingEvents = [
  {
    id: '3',
    title: 'Tech Conference 2025',
    date: 'Nov 15, 2025',
    location: 'Koramangala, Bangalore',
    image: 'https://picsum.photos/400/200?random=22',
    status: 'pending',
    requestDate: 'Nov 1, 2025',
  },
  {
    id: '4',
    title: 'Art Gallery Opening',
    date: 'Nov 20, 2025',
    location: 'Juhu, Mumbai',
    image: 'https://picsum.photos/400/200?random=23',
    status: 'pending',
    requestDate: 'Oct 30, 2025',
  },
];

const mockLiveEvents = [
  {
    id: '5',
    title: 'New Year Bash 2026',
    date: 'Dec 31, 2025',
    time: '9:00 PM',
    location: 'Marine Drive, Mumbai',
    image: 'https://picsum.photos/400/200?random=24',
    status: 'approved',
    qrCode: 'QR123456',
  },
  {
    id: '6',
    title: 'Comedy Night Special',
    date: 'Nov 12, 2025',
    time: '8:00 PM',
    location: 'Phoenix Mall, Pune',
    image: 'https://picsum.photos/400/200?random=25',
    status: 'approved',
    qrCode: 'QR789012',
  },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('live');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    
    // Set up real-time subscription
    const unsubscribe = eventsService.subscribeToUserBookings(user.id, (bookings) => {
      console.log('📋 User bookings updated:', bookings);
      setUserBookings(bookings);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [user]);

  // Refresh bookings when screen comes into focus (backup method)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        // The real-time subscription handles updates, but we can force refresh here if needed
        console.log('📱 Dashboard screen focused - real-time subscription is active');
      }
    }, [user])
  );

  const loadUserBookings = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const bookings = await eventsService.getUserBookings(user.id);
      setUserBookings(bookings);
    } catch (error) {
      console.error('Error loading user bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowQR = (event: any) => {
    setSelectedEvent(event);
    setShowQRModal(true);
  };

  const handleChatPress = () => {
    Alert.alert('Chat Feature', 'Chat will be added soon!');
  };

  const handleCancelRequest = async (requestId: string) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this event request?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await eventsService.cancelBookingRequest(requestId);
              if (result.success) {
                loadUserBookings(); // Refresh the list
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Error cancelling request:', error);
              Alert.alert('Error', 'Failed to cancel request');
            }
          },
        },
      ]
    );
  };

  const handlePayment = async (requestId: string) => {
    Alert.alert(
      'Complete Payment',
      'Proceed with payment to confirm your booking?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Pay Now',
          style: 'default',
          onPress: async () => {
            try {
              console.log('🔄 Processing payment for request:', requestId);
              const result = await eventsService.processPayment(requestId);
              
              if (result.success) {
                Alert.alert(
                  'Payment Successful!', 
                  `${result.message}\n\nQR Code: ${result.qrCode}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => loadUserBookings() // Refresh the list
                    }
                  ]
                );
              } else {
                Alert.alert('Payment Failed', result.message);
              }
            } catch (error) {
              console.error('Error processing payment:', error);
              Alert.alert('Error', 'Payment failed. Please try again.');
            }
          },
        },
      ]
    );
  };

  const generateQRData = (event: any) => {
    return JSON.stringify({
      eventId: event.id,
      eventTitle: event.title,
      qrCode: event.qrCode,
      userId: user?.id,
      userName: user?.name || user?.username,
      timestamp: Date.now(),
    });
  };

  const renderTabButton = (tabKey: string, label: string, count: number) => (
    <TouchableOpacity
      key={tabKey}
      style={[styles.tabButton, activeTab === tabKey && styles.activeTabButton]}
      onPress={() => setActiveTab(tabKey)}
    >
      <Text style={[styles.tabLabel, activeTab === tabKey && styles.activeTabLabel]}>
        {label}
      </Text>
      <View style={[styles.countBadge, activeTab === tabKey && styles.activeCountBadge]}>
        <Text style={[styles.countText, activeTab === tabKey && styles.activeCountText]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPastEventCard = (event: any) => (
    <View key={event.id} style={styles.eventCard}>
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.statusText}>Attended</Text>
          </View>
        </View>
        <View style={styles.eventMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{event.date}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Your Rating:</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={16}
                color={star <= event.rating ? '#F59E0B' : '#E5E7EB'}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderPendingEventCard = (booking: UserBooking) => (
    <View key={booking.id} style={styles.eventCard}>
      <Image 
        source={{ 
          uri: booking.eventDetails.images?.[0] || 'https://picsum.photos/400/200?random=22' 
        }} 
        style={styles.eventImage} 
      />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{booking.eventDetails.title}</Text>
          {booking.status === 'pending' ? (
            <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={16} color="#F59E0B" />
              <Text style={[styles.statusText, { color: '#F59E0B' }]}>Pending</Text>
            </View>
          ) : booking.status === 'payment_pending' ? (
            <View style={[styles.statusBadge, { backgroundColor: '#F8FAFF' }]}>
              <Ionicons name="card" size={16} color="#6366F1" />
              <Text style={[styles.statusText, { color: '#6366F1' }]}>Payment Due</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.eventMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{booking.eventDetails.date}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{booking.eventDetails.location.name}</Text>
          </View>
        </View>
        
        {booking.status === 'pending' ? (
          <Text style={styles.requestText}>
            Request sent on {new Date(booking.requestedAt).toLocaleDateString()}
          </Text>
        ) : (
          <Text style={styles.requestText}>
            Approved on {booking.respondedAt ? new Date(booking.respondedAt).toLocaleDateString() : 'N/A'}
          </Text>
        )}
        
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketText}>{booking.ticketTier} - ₹{booking.price}</Text>
        </View>
        
        {booking.status === 'pending' ? (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelRequest(booking.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        ) : booking.status === 'payment_pending' ? (
          <View style={styles.paymentActions}>
            <TouchableOpacity 
              style={styles.payButton}
              onPress={() => handlePayment(booking.id)}
            >
              <Ionicons name="card-outline" size={16} color="#FFFFFF" />
              <Text style={styles.payButtonText}>Pay ₹{booking.price}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelPaymentButton}
              onPress={() => handleCancelRequest(booking.id)}
            >
              <Text style={styles.cancelPaymentButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderLiveEventCard = (event: any) => (
    <View key={event.id} style={styles.eventCard}>
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.status === 'approved' ? (
            <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="checkmark" size={16} color="#D97706" />
              <Text style={[styles.statusText, { color: '#D97706' }]}>Approved</Text>
            </View>
          ) : event.status === 'payment_pending' ? (
            <View style={[styles.statusBadge, { backgroundColor: '#F8FAFF' }]}>
              <Ionicons name="card" size={16} color="#6366F1" />
              <Text style={[styles.statusText, { color: '#6366F1' }]}>Payment Due</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={[styles.statusText, { color: '#10B981' }]}>Confirmed</Text>
            </View>
          )}
        </View>
        <View style={styles.eventMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{event.date} • {event.time}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
        </View>
        
        {(event.status === 'approved' || event.status === 'payment_pending') ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.payNowButton}
              onPress={() => handlePayment(event.id)}
            >
              <Ionicons name="card" size={16} color="#FFFFFF" />
              <Text style={styles.payNowButtonText}>Pay Now - ₹{event.price}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={() => handleShowQR(event)}
            >
              <Ionicons name="qr-code" size={16} color="#FFFFFF" />
              <Text style={styles.qrButtonText}>Show QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share" size={16} color="#6366F1" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {event.status === 'paid' && event.qrCode && (
          <View style={styles.qrInfo}>
            <View>
              <Text style={styles.qrLabel}>QR Code: {event.qrCode.substring(0, 12)}...</Text>
              <Text style={styles.validityText}>Valid for event entry</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  // Filter bookings by status
  const pendingBookings = userBookings.filter(booking => booking.status === 'pending');
  const approvedBookings = userBookings.filter(booking => 
    booking.status === 'approved' || booking.status === 'payment_pending' || booking.status === 'paid'
  );
  const pastBookings = userBookings.filter(booking => booking.status === 'rejected' || 
    (booking.status === 'paid' && new Date(booking.eventDetails.date) < new Date())
  );

  const getTabContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your events...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'past':
        return pastBookings.length > 0 ? (
          pastBookings.map(booking => renderPastEventCard({
            id: booking.id,
            title: booking.eventDetails.title,
            date: booking.eventDetails.date,
            location: booking.eventDetails.location.name,
            image: booking.eventDetails.images?.[0] || 'https://picsum.photos/400/200?random=20',
            status: 'attended',
            rating: 5,
          }))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Past Events</Text>
            <Text style={styles.emptyText}>You haven't attended any events yet</Text>
          </View>
        );
      case 'pending':
        return pendingBookings.length > 0 ? (
          pendingBookings.map(renderPendingEventCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Pending Requests</Text>
            <Text style={styles.emptyText}>You don't have any pending event requests</Text>
          </View>
        );
      case 'live':
        return approvedBookings.length > 0 ? (
          approvedBookings.map(booking => renderLiveEventCard({
            id: booking.id,
            title: booking.eventDetails.title,
            date: booking.eventDetails.date,
            time: booking.eventDetails.time,
            location: booking.eventDetails.location.name,
            image: booking.eventDetails.images?.[0] || 'https://picsum.photos/400/200?random=24',
            status: booking.status, // Pass actual status (payment_pending or paid)
            qrCode: booking.qrCode || null,
            price: booking.price,
            ticketTier: booking.ticketTier,
          }))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Upcoming Events</Text>
            <Text style={styles.emptyText}>You don't have any confirmed events</Text>
          </View>
        );
      default:
        return null;
    }
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

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton('live', 'Live', approvedBookings.length)}
        {renderTabButton('pending', 'Pending', pendingBookings.length)}
        {renderTabButton('past', 'Past', pastBookings.length)}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {getTabContent()}
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Event QR Code</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowQRModal(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {selectedEvent && (
              <View style={styles.qrContainer}>
                <Text style={styles.eventNameText}>{selectedEvent.title}</Text>
                <Text style={styles.eventDateText}>{selectedEvent.date} • {selectedEvent.time}</Text>
                
                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={generateQRData(selectedEvent)}
                    size={200}
                    color="#111827"
                    backgroundColor="#FFFFFF"
                  />
                </View>
                
                <Text style={styles.qrInstructions}>
                  Show this QR code at the event entrance for entry
                </Text>
                
                <View style={styles.qrInfo}>
                  <Text style={styles.qrLabel}>QR Code:</Text>
                  <Text style={styles.qrValue}>{selectedEvent.qrCode}</Text>
                </View>
                
                <Text style={styles.validityText}>
                  Valid for entry on event day only
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  activeTabButton: {
    backgroundColor: '#6366F1',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  activeTabLabel: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  activeCountText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  eventMeta: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  requestText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  ticketInfo: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  ticketText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  qrButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  shareButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxWidth: 350,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  qrContainer: {
    alignItems: 'center',
  },
  eventNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  eventDateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  qrCodeWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  qrInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  qrValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  validityText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Payment styles
  paymentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  payButton: {
    flex: 2,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelPaymentButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPaymentButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  // Live event pay now button
  payNowButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  payNowButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});