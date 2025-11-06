import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

interface HostEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  image: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  attendees: number;
  maxCapacity: number;
  earnings: number;
  category: string;
}

// Mock data for host events - in real app this would come from Firestore
const mockHostEvents: HostEvent[] = [
  {
    id: '1',
    title: 'Rooftop Sunset Party 🌅',
    date: '15 Nov 2025',
    time: '6:00 PM',
    location: 'Sky Lounge, Bandra West',
    price: 1299,
    image: 'https://picsum.photos/400/300?random=1',
    status: 'published',
    attendees: 89,
    maxCapacity: 150,
    earnings: 115611,
    category: 'Music',
  },
  {
    id: '2',
    title: 'Wine Tasting Evening',
    date: '21 Nov 2025',
    time: '7:00 PM',
    location: 'Four Seasons, Worli',
    price: 1599,
    image: 'https://picsum.photos/400/300?random=8',
    status: 'published',
    attendees: 56,
    maxCapacity: 80,
    earnings: 89544,
    category: 'Food',
  },
  {
    id: '3',
    title: 'Art & Cocktails Night',
    date: '25 Nov 2025',
    time: '8:00 PM',
    location: 'Gallery Cafe, Fort',
    price: 899,
    image: 'https://picsum.photos/400/300?random=9',
    status: 'draft',
    attendees: 0,
    maxCapacity: 60,
    earnings: 0,
    category: 'Art',
  },
];

export default function HostDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [events, setEvents] = useState<HostEvent[]>(mockHostEvents);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'published' | 'draft'>('all');

  // Calculate dashboard stats
  const totalEarnings = events.reduce((sum, event) => sum + event.earnings, 0);
  const totalAttendees = events.reduce((sum, event) => sum + event.attendees, 0);
  const publishedEvents = events.filter(event => event.status === 'published').length;

  const filteredEvents = events.filter(event => {
    if (selectedTab === 'all') return true;
    return event.status === selectedTab;
  });

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const handleEditEvent = (eventId: string) => {
    navigation.navigate('CreateEvent', { eventId, mode: 'edit' });
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEvents(prev => prev.filter(event => event.id !== eventId));
            Alert.alert('Success', 'Event deleted successfully');
          }
        }
      ]
    );
  };

  const handlePublishEvent = (eventId: string) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId
        ? { ...event, status: 'published' as const }
        : event
    ));
    Alert.alert('Success', 'Event published successfully!');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // In real app, fetch events from Firestore
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#10B981';
      case 'draft': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Published';
      case 'draft': return 'Draft';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Host Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back, {user?.name}!</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>₹{totalEarnings.toLocaleString()}</Text>
            <Text style={styles.statsLabel}>Total Earnings</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{totalAttendees}</Text>
            <Text style={styles.statsLabel}>Total Attendees</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{publishedEvents}</Text>
            <Text style={styles.statsLabel}>Published Events</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.createEventButton} onPress={handleCreateEvent}>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.createEventText}>Create New Event</Text>
          </TouchableOpacity>
          
          <View style={styles.quickActionButtons}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="analytics" size={20} color="#6366F1" />
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="people" size={20} color="#6366F1" />
              <Text style={styles.quickActionText}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="card" size={20} color="#6366F1" />
              <Text style={styles.quickActionText}>Payouts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Tabs */}
        <View style={styles.tabsContainer}>
          <Text style={styles.sectionTitle}>Your Events</Text>
          <View style={styles.tabs}>
            {(['all', 'published', 'draft'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, selectedTab === tab && styles.activeTab]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No events found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {selectedTab === 'all' 
                  ? "You haven't created any events yet." 
                  : `No ${selectedTab} events found.`
                }
              </Text>
              {selectedTab === 'all' && (
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateEvent}>
                  <Text style={styles.emptyStateButtonText}>Create Your First Event</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredEvents.map((event) => (
              <TouchableOpacity 
                key={event.id} 
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}
              >
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitle}>
                      <Text style={styles.eventTitleText}>{event.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(event.status)}</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity style={styles.moreButton}>
                      <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                      <Text style={styles.eventDetailText}>{event.date} • {event.time}</Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="location-outline" size={16} color="#6B7280" />
                      <Text style={styles.eventDetailText}>{event.location}</Text>
                    </View>
                  </View>

                  <View style={styles.eventStats}>
                    <View style={styles.eventStat}>
                      <Text style={styles.eventStatNumber}>{event.attendees}/{event.maxCapacity}</Text>
                      <Text style={styles.eventStatLabel}>Attendees</Text>
                    </View>
                    <View style={styles.eventStat}>
                      <Text style={styles.eventStatNumber}>₹{event.earnings.toLocaleString()}</Text>
                      <Text style={styles.eventStatLabel}>Earnings</Text>
                    </View>
                    <View style={styles.eventStat}>
                      <Text style={styles.eventStatNumber}>₹{event.price}</Text>
                      <Text style={styles.eventStatLabel}>Ticket Price</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.eventActions}>
                    {event.status === 'draft' ? (
                      <TouchableOpacity
                        style={styles.publishButton}
                        onPress={() => handlePublishEvent(event.id)}
                      >
                        <Text style={styles.publishButtonText}>Publish</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.viewDetailsButton}>
                        <Text style={styles.viewDetailsButtonText}>View Details</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditEvent(event.id)}
                    >
                      <Ionicons name="create-outline" size={16} color="#6366F1" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteEvent(event.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  quickActions: {
    padding: 20,
  },
  createEventButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  createEventText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickActionText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
    marginTop: 4,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
  },
  eventsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 160,
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
    flex: 1,
  },
  eventTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  moreButton: {
    padding: 4,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  eventStats: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  eventStat: {
    flex: 1,
    alignItems: 'center',
  },
  eventStatNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  eventStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  publishButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});