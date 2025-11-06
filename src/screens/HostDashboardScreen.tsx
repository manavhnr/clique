import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { eventsService, EventData } from '../services/eventsService';

export default function HostDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'published' | 'draft'>('all');

  // Load host events and invitations
  useEffect(() => {
    loadHostData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHostData();
    }, [])
  );

  const loadHostData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load events hosted by this user
      const hostEvents = await eventsService.getEventsByHost(user.id);
      setEvents(hostEvents);
      
      // Load invitations for all host events
      const allInvitations: any[] = [];
      for (const event of hostEvents) {
        const eventInvitations = await eventsService.getEventInvitations(event.id);
        allInvitations.push(...eventInvitations);
      }
      setInvitations(allInvitations);
    } catch (error) {
      console.error('Error loading host data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHostData();
    setRefreshing(false);
  };

  // Calculate dashboard stats from real data
  const publishedEvents = events.filter(event => event.status === 'published').length;
  const totalAttendees = events.reduce((sum, event) => sum + (event.capacity.booked || 0), 0);
  const totalEarnings = events.reduce((sum, event) => {
    const bookedCount = event.capacity.booked || 0;
    const eventEarnings = bookedCount * event.pricing.regular.price;
    return sum + eventEarnings;
  }, 0);

  // Pending invitations that need host approval
  const pendingInvitations = invitations.filter(invitation => invitation.status === 'pending');

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

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await eventsService.deleteEvent(eventId);
              if (result.success) {
                Alert.alert('Success', 'Event deleted successfully');
                loadHostData(); // Reload data
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  const handlePublishEvent = async (eventId: string) => {
    try {
      const result = await eventsService.updateEventStatus(eventId, 'published');
      if (result.success) {
        Alert.alert('Success', 'Event published successfully!');
        loadHostData(); // Reload data
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to publish event');
    }
  };

  const handleInvitationResponse = async (invitationId: string, response: 'accepted' | 'declined') => {
    try {
      const result = await eventsService.respondToInvitation(invitationId, response);
      if (result.success) {
        Alert.alert('Success', result.message);
        loadHostData(); // Reload data
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to respond to invitation');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Host Dashboard</Text>
          <Text style={styles.subtitle}>Manage your events and track performance</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>{publishedEvents}</Text>
            <Text style={styles.statLabel}>Active Events</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{totalAttendees}</Text>
            <Text style={styles.statLabel}>Total Attendees</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="wallet-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>₹{totalEarnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
        </View>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Invitations ({pendingInvitations.length})</Text>
            {pendingInvitations.slice(0, 3).map((invitation) => (
              <View key={invitation.id} style={styles.invitationCard}>
                <View style={styles.invitationInfo}>
                  <Text style={styles.invitationEmail}>{invitation.attendeeEmail}</Text>
                  <Text style={styles.invitationName}>
                    {invitation.attendeeName || 'Unnamed User'}
                  </Text>
                  {invitation.message && (
                    <Text style={styles.invitationMessage} numberOfLines={2}>
                      {invitation.message}
                    </Text>
                  )}
                </View>
                <View style={styles.invitationActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleInvitationResponse(invitation.id, 'accepted')}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleInvitationResponse(invitation.id, 'declined')}
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCreateEvent}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="add-circle-outline" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.actionButtonText}>Create Event</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('HostApplication')}
            >
              <View style={styles.actionButtonIcon}>
                <Ionicons name="analytics-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionButtonText}>View Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="chatbubble-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionButtonText}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Events Filter Tabs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Events ({events.length})</Text>
          </View>
          
          <View style={styles.filterTabs}>
            {(['all', 'published', 'draft'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, selectedTab === tab && styles.activeFilterTab]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.filterTabText, selectedTab === tab && styles.activeFilterTabText]}>
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
                  ? 'Create your first event to get started'
                  : `No ${selectedTab} events yet`
                }
              </Text>
              <TouchableOpacity style={styles.createEventButton} onPress={handleCreateEvent}>
                <Text style={styles.createEventButtonText}>Create Event</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}
              >
                <View style={styles.eventHeader}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>{event.date} • {event.time}</Text>
                    <Text style={styles.eventLocation}>{event.location.name}</Text>
                  </View>
                  <View style={styles.eventActions}>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleEditEvent(event.id)}
                    >
                      <Ionicons name="create-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleDeleteEvent(event.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.eventStats}>
                  <View style={styles.eventStat}>
                    <Text style={styles.eventStatValue}>
                      {event.capacity.booked}/{event.capacity.total}
                    </Text>
                    <Text style={styles.eventStatLabel}>Attendees</Text>
                  </View>
                  <View style={styles.eventStat}>
                    <Text style={styles.eventStatValue}>
                      ₹{((event.capacity.booked || 0) * event.pricing.regular.price).toLocaleString()}
                    </Text>
                    <Text style={styles.eventStatLabel}>Earnings</Text>
                  </View>
                  <View style={styles.eventStat}>
                    <View style={[
                      styles.statusBadge, 
                      event.status === 'published' && styles.publishedStatus,
                      event.status === 'draft' && styles.draftStatus,
                      event.status === 'cancelled' && styles.cancelledStatus,
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        event.status === 'published' && styles.publishedStatusText,
                        event.status === 'draft' && styles.draftStatusText,
                        event.status === 'cancelled' && styles.cancelledStatusText,
                      ]}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                {event.status === 'draft' && (
                  <TouchableOpacity
                    style={styles.publishButton}
                    onPress={() => handlePublishEvent(event.id)}
                  >
                    <Text style={styles.publishButtonText}>Publish Event</Text>
                  </TouchableOpacity>
                )}
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
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
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
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonIcon: {
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#8B5CF6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  invitationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invitationInfo: {
    flex: 1,
    marginRight: 12,
  },
  invitationEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  invitationName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  invitationMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  invitationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  eventsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    borderColor: '#E5E7EB',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionIcon: {
    padding: 8,
    marginLeft: 4,
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  eventStat: {
    alignItems: 'center',
  },
  eventStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  eventStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publishedStatus: {
    backgroundColor: '#D1FAE5',
  },
  draftStatus: {
    backgroundColor: '#FEF3C7',
  },
  cancelledStatus: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  publishedStatusText: {
    color: '#065F46',
  },
  draftStatusText: {
    color: '#92400E',
  },
  cancelledStatusText: {
    color: '#991B1B',
  },
  publishButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 24,
  },
  createEventButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createEventButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});