import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { eventsService } from '../services/eventsService';
import { DEFAULT_AVATAR } from '../constants/images';

interface AttendeesListProps {
  route: {
    params: {
      eventId: string;
      eventTitle?: string;
    };
  };
}

interface Attendee {
  id: string;
  userId: string;
  userProfile: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    age?: number;
    city?: string;
    socialActivityLevel?: string;
  };
  ticketTier: string;
  price: number;
  requestedAt: string;
  approvedAt: string;
  qrCode: string;
}

const AttendeesListScreen: React.FC<AttendeesListProps> = ({ route }) => {
  const navigation = useNavigation<any>();
  const { eventId, eventTitle } = route.params;
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [eventId]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [eventId])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load event details
      const eventData = await eventsService.getEventById(eventId);
      setEvent(eventData);
      
      // Load attendees
      const attendeesData = await eventsService.getEventAttendees(eventId);
      setAttendees(attendeesData);
      
      console.log('📋 Loaded event attendees:', {
        eventTitle: eventData?.title,
        attendeesCount: attendeesData.length,
        attendees: attendeesData.map(a => ({
          name: a.userProfile.name,
          tier: a.ticketTier,
          approvedAt: a.approvedAt
        }))
      });
      
    } catch (error) {
      console.error('Error loading attendees data:', error);
      Alert.alert('Error', 'Failed to load attendees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAttendeePress = (attendee: Attendee) => {
    console.log('🔍 Viewing attendee profile:', {
      userId: attendee.userId,
      userName: attendee.userProfile.name
    });
    
    navigation.navigate('UserProfileView', {
      userId: attendee.userId,
      userName: attendee.userProfile.name
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium':
      case 'vip':
        return '#FFD700';
      case 'early':
      case 'early bird':
        return '#10B981';
      case 'regular':
      default:
        return '#6366F1';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium':
      case 'vip':
        return 'star';
      case 'early':
      case 'early bird':
        return 'flash';
      default:
        return 'ticket';
    }
  };

  const renderAttendee = ({ item, index }: { item: Attendee; index: number }) => (
    <TouchableOpacity
      style={styles.attendeeCard}
      onPress={() => handleAttendeePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.attendeeNumber}>
        <Text style={styles.attendeeNumberText}>#{index + 1}</Text>
      </View>
      
      <View style={styles.attendeeInfo}>
        <View style={styles.attendeeHeader}>
          <View style={styles.attendeeProfile}>
            <Image 
              source={{ uri: item.userProfile.avatar || DEFAULT_AVATAR }} 
              style={styles.attendeeAvatar} 
            />
            
            <View style={styles.attendeeDetails}>
              <Text style={styles.attendeeName}>{item.userProfile.name}</Text>
              <Text style={styles.attendeeUsername}>@{item.userProfile.username}</Text>
              {item.userProfile.city && (
                <Text style={styles.attendeeLocation}>
                  <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                  {' '}{item.userProfile.city}
                </Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.viewProfileButton}
            onPress={() => handleAttendeePress(item)}
          >
            <Ionicons name="person-outline" size={16} color="#6366F1" />
            <Text style={styles.viewProfileText}>View</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.attendeeTicketInfo}>
          <View style={[styles.ticketTier, { borderColor: getTierColor(item.ticketTier) }]}>
            <Ionicons 
              name={getTierIcon(item.ticketTier) as any} 
              size={14} 
              color={getTierColor(item.ticketTier)} 
            />
            <Text style={[styles.ticketTierText, { color: getTierColor(item.ticketTier) }]}>
              {item.ticketTier.charAt(0).toUpperCase() + item.ticketTier.slice(1)} 
            </Text>
          </View>
          
          <Text style={styles.ticketPrice}>₹{item.price.toLocaleString()}</Text>
        </View>
        
        <View style={styles.attendeeTimestamps}>
          <View style={styles.timestamp}>
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text style={styles.timestampText}>
              Requested: {formatDate(item.requestedAt)} at {formatTime(item.requestedAt)}
            </Text>
          </View>
          
          <View style={styles.timestamp}>
            <Ionicons name="checkmark-circle-outline" size={12} color="#10B981" />
            <Text style={styles.timestampText}>
              Approved: {formatDate(item.approvedAt)} at {formatTime(item.approvedAt)}
            </Text>
          </View>
        </View>
        
        <View style={styles.qrCodeSection}>
          <View style={styles.qrCodeInfo}>
            <Ionicons name="qr-code-outline" size={16} color="#6B7280" />
            <Text style={styles.qrCodeText}>QR: {item.qrCode.substring(0, 20)}...</Text>
          </View>
          <TouchableOpacity style={styles.qrCodeButton}>
            <Text style={styles.qrCodeButtonText}>Show QR</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendees</Text>
          <View style={styles.headerAction} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading attendees...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Attendees</Text>
          <Text style={styles.headerSubtitle}>
            {event?.title || eventTitle || 'Event'}
          </Text>
        </View>
        <View style={styles.headerAction} />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{attendees.length}</Text>
          <Text style={styles.statLabel}>Total Attendees</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            ₹{attendees.reduce((sum, a) => sum + a.price, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {event?.capacity.total - (event?.capacity.booked || 0)}
          </Text>
          <Text style={styles.statLabel}>Spots Left</Text>
        </View>
      </View>

      {attendees.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No Attendees Yet</Text>
          <Text style={styles.emptyStateMessage}>
            Once people get approved for this event, they'll appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={attendees}
          renderItem={renderAttendee}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.attendeesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

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
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
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
  headerAction: {
    width: 40,
    height: 40,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  attendeesList: {
    padding: 16,
  },
  attendeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  attendeeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attendeeNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  attendeeProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attendeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  attendeeAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attendeeAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  attendeeDetails: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  attendeeUsername: {
    fontSize: 14,
    color: '#6366F1',
    marginBottom: 2,
  },
  attendeeLocation: {
    fontSize: 12,
    color: '#9CA3AF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6366F1',
    backgroundColor: '#F8FAFF',
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366F1',
    marginLeft: 4,
  },
  attendeeTicketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketTier: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  ticketTierText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  attendeeTimestamps: {
    marginBottom: 12,
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 6,
  },
  qrCodeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  qrCodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  qrCodeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontFamily: 'monospace',
  },
  qrCodeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  qrCodeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  chevron: {
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AttendeesListScreen;