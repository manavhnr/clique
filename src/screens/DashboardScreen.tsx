import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

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

  const renderPendingEventCard = (event: any) => (
    <View key={event.id} style={styles.eventCard}>
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={16} color="#F59E0B" />
            <Text style={[styles.statusText, { color: '#F59E0B' }]}>Pending</Text>
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
        <Text style={styles.requestText}>Request sent on {event.requestDate}</Text>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLiveEventCard = (event: any) => (
    <View key={event.id} style={styles.eventCard}>
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.statusText, { color: '#10B981' }]}>Approved</Text>
          </View>
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
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.qrButton}>
            <Ionicons name="qr-code" size={16} color="#FFFFFF" />
            <Text style={styles.qrButtonText}>Show QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share" size={16} color="#6366F1" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'past':
        return mockPastEvents.length > 0 ? (
          mockPastEvents.map(renderPastEventCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Past Events</Text>
            <Text style={styles.emptyText}>You haven't attended any events yet</Text>
          </View>
        );
      case 'pending':
        return mockPendingEvents.length > 0 ? (
          mockPendingEvents.map(renderPendingEventCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Pending Requests</Text>
            <Text style={styles.emptyText}>You don't have any pending event requests</Text>
          </View>
        );
      case 'live':
        return mockLiveEvents.length > 0 ? (
          mockLiveEvents.map(renderLiveEventCard)
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Events</Text>
        <Text style={styles.headerSubtitle}>Manage your event bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton('live', 'Live', mockLiveEvents.length)}
        {renderTabButton('pending', 'Pending', mockPendingEvents.length)}
        {renderTabButton('past', 'Past', mockPastEvents.length)}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {getTabContent()}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
});