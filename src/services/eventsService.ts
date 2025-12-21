import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  increment 
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { BookingRequest, UserBooking } from '../types/booking';
import { Event, EventPost, EventPhotoCollage, COLLECTIONS } from '../types/events';
import EventPostService from './eventPostService';
import { DEFAULT_AVATAR } from '../constants/images';

export interface EventData {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  endTime?: string;
  location: {
    name: string;
    address: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  pricing: {
    early?: { price: number; label: string; available: boolean };
    regular: { price: number; label: string; available: boolean };
    premium?: { price: number; label: string; available: boolean };
  };
  host: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    rating: number;
    eventsHosted: number;
    isVerified: boolean;
  };
  images: string[];
  amenities: string[];
  capacity: {
    total: number;
    booked: number;
    remaining: number;
  };
  ageRestriction?: string;
  dressCode?: string;
  tags: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  reviews: {
    rating: number;
    count: number;
  };
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
  // Photo collage integration
  totalPhotos?: number;
  photoCollageId?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  address: string;
  city: string;
  maxCapacity: number;
  earlyBirdPrice?: number;
  regularPrice: number;
  premiumPrice?: number;
  ageRestriction?: string;
  dressCode?: string;
  amenities: string[];
  images: string[];
  terms?: string;
}

class EventsService {
  private eventsCollection = collection(db, 'events');
  private bookingRequestsCollection = collection(db, 'bookingRequests');
  private usersCollection = collection(db, 'users');
  private hostApplicationsCollection = collection(db, 'hostApplications');
  
  // Create a new event
  async createEvent(hostId: string, eventData: CreateEventData, hostInfo: any): Promise<{ success: boolean; eventId?: string; message: string }> {
    try {
      const event: Omit<EventData, 'id'> = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        date: eventData.date,
        time: eventData.startTime,
        endTime: eventData.endTime,
        location: {
          name: eventData.venue,
          address: eventData.address,
          city: eventData.city,
        },
        pricing: {
          ...(eventData.earlyBirdPrice && eventData.earlyBirdPrice > 0 ? {
            early: { price: eventData.earlyBirdPrice, label: 'Early Bird', available: true }
          } : {}),
          regular: { price: eventData.regularPrice, label: 'Regular', available: true },
          ...(eventData.premiumPrice && eventData.premiumPrice > 0 ? {
            premium: { price: eventData.premiumPrice, label: 'Premium', available: true }
          } : {}),
        },
        host: {
          id: hostId,
          name: hostInfo.name || 'Host',
          username: hostInfo.username || '@host',
          avatar: hostInfo.avatar || DEFAULT_AVATAR,
          rating: hostInfo.rating || 4.5,
          eventsHosted: hostInfo.eventsHosted || 0,
          isVerified: hostInfo.isVerified || true,
        },
        images: eventData.images,
        amenities: eventData.amenities,
        capacity: {
          total: eventData.maxCapacity,
          booked: 0,
          remaining: eventData.maxCapacity,
        },
        ageRestriction: eventData.ageRestriction,
        dressCode: eventData.dressCode,
        tags: [eventData.category],
        status: 'draft',
        reviews: {
          rating: 0,
          count: 0,
        },
        terms: eventData.terms,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(this.eventsCollection, event);
      
      return {
        success: true,
        eventId: docRef.id,
        message: 'Event created successfully'
      };
    } catch (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        message: 'Failed to create event'
      };
    }
  }

  // Get all published events for discovery
  async getPublishedEvents(): Promise<EventData[]> {
    try {
      const q = query(
        this.eventsCollection,
        where('status', '==', 'published')
      );
      
      const snapshot = await getDocs(q);
      const events: EventData[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as EventData);
      });

      // Sort in JavaScript instead of Firestore
      events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return events;
    } catch (error) {
      console.error('Error fetching published events:', error);
      return [];
    }
  }

  // Get events by host
  async getEventsByHost(hostId: string): Promise<EventData[]> {
    try {
      // Use simple query without orderBy to avoid composite index requirement
      const q = query(
        this.eventsCollection,
        where('host.id', '==', hostId)
      );
      
      const snapshot = await getDocs(q);
      const events: EventData[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as EventData);
      });
      
      // Sort in JavaScript instead of Firestore to avoid index requirement
      events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return events;
    } catch (error) {
      console.error('Error fetching host events:', error);
      return [];
    }
  }

  // Get single event by ID
  async getEventById(eventId: string): Promise<EventData | null> {
    try {
      const docRef = doc(this.eventsCollection, eventId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as EventData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  // Update event
  async updateEvent(eventId: string, updates: Partial<EventData>): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(this.eventsCollection, eventId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
      
      return {
        success: true,
        message: 'Event updated successfully'
      };
    } catch (error) {
      console.error('Error updating event:', error);
      return {
        success: false,
        message: 'Failed to update event'
      };
    }
  }

  // Publish event
  async publishEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    return this.updateEvent(eventId, { status: 'published' });
  }

  // Delete event
  async deleteEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(this.eventsCollection, eventId);
      await deleteDoc(docRef);
      
      return {
        success: true,
        message: 'Event deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting event:', error);
      return {
        success: false,
        message: 'Failed to delete event'
      };
    }
  }

  // Search events
  async searchEvents(searchTerm: string, category?: string): Promise<EventData[]> {
    try {
      let q = query(
        this.eventsCollection,
        where('status', '==', 'published')
      );

      if (category && category !== 'All') {
        q = query(
          this.eventsCollection,
          where('status', '==', 'published'),
          where('category', '==', category)
        );
      }
      
      const snapshot = await getDocs(q);
      const events: EventData[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const event = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as EventData;

        // Client-side filtering for search term
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          if (
            event.title.toLowerCase().includes(searchLower) ||
            event.description.toLowerCase().includes(searchLower) ||
            event.location.name.toLowerCase().includes(searchLower) ||
            event.location.address.toLowerCase().includes(searchLower)
          ) {
            events.push(event);
          }
        } else {
          events.push(event);
        }
      });
      
      // Sort in JavaScript instead of Firestore
      events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return events;
    } catch (error) {
      console.error('Error searching events:', error);
      return [];
    }
  }

  // Listen to events changes
  subscribeToEvents(callback: (events: EventData[]) => void, hostId?: string) {
    let q;
    
    if (hostId) {
      q = query(
        this.eventsCollection,
        where('host.id', '==', hostId)
      );
    } else {
      q = query(
        this.eventsCollection,
        where('status', '==', 'published')
      );
    }

    return onSnapshot(q, (snapshot) => {
      const events: EventData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as EventData);
      });
      
      // Sort in JavaScript instead of Firestore
      events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      callback(events);
    });
  }

  // Invitation System

  // Create an event invitation
  async createInvitation(
    eventId: string,
    inviterUserId: string,
    inviterName: string,
    attendeeEmail: string,
    attendeeName?: string,
    message?: string
  ) {
    try {
      const invitationData = {
        eventId,
        inviterUserId,
        inviterName,
        attendeeEmail,
        attendeeName: attendeeName || '',
        message: message || '',
        status: 'pending', // pending, accepted, declined
        createdAt: new Date(),
        respondedAt: null,
      };

      const docRef = await addDoc(collection(db, 'eventInvitations'), invitationData);
      
      return {
        success: true,
        invitationId: docRef.id,
        message: 'Invitation sent successfully',
      };
    } catch (error) {
      console.error('Error creating invitation:', error);
      return {
        success: false,
        message: 'Failed to send invitation',
      };
    }
  }

  // Get invitations for an event (for hosts to manage)
  async getEventInvitations(eventId: string) {
    try {
      const q = query(
        collection(db, 'eventInvitations'),
        where('eventId', '==', eventId)
      );
      
      const snapshot = await getDocs(q);
      const invitations: any[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        invitations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          respondedAt: data.respondedAt?.toDate() || null,
        });
      });
      
      // Sort in JavaScript instead of Firestore
      invitations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return invitations;
    } catch (error) {
      console.error('Error getting event invitations:', error);
      return [];
    }
  }

  // Get invitations for a user (invitations received)
  async getUserInvitations(userEmail: string) {
    try {
      const q = query(
        collection(db, 'eventInvitations'),
        where('attendeeEmail', '==', userEmail)
      );
      
      const snapshot = await getDocs(q);
      const invitations: any[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        invitations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          respondedAt: data.respondedAt?.toDate() || null,
        });
      });
      
      // Sort in JavaScript instead of Firestore
      invitations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return invitations;
    } catch (error) {
      console.error('Error getting user invitations:', error);
      return [];
    }
  }

  // Respond to an invitation (accept/decline)
  async respondToInvitation(invitationId: string, response: 'accepted' | 'declined') {
    try {
      const invitationRef = doc(db, 'eventInvitations', invitationId);
      
      await updateDoc(invitationRef, {
        status: response,
        respondedAt: new Date(),
      });

      // If accepted, we could also add the user to the event attendees
      if (response === 'accepted') {
        const invitationDoc = await getDoc(invitationRef);
        if (invitationDoc.exists()) {
          const invitationData = invitationDoc.data();
          await this.addAttendeeToEvent(invitationData.eventId, {
            email: invitationData.attendeeEmail,
            name: invitationData.attendeeName,
            joinedAt: new Date(),
            source: 'invitation',
          });
        }
      }
      
      return {
        success: true,
        message: `Invitation ${response} successfully`,
      };
    } catch (error) {
      console.error('Error responding to invitation:', error);
      return {
        success: false,
        message: 'Failed to respond to invitation',
      };
    }
  }

  // Add attendee to event
  async addAttendeeToEvent(eventId: string, attendeeData: any) {
    try {
      const eventRef = doc(this.eventsCollection, eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const eventData = eventDoc.data() as EventData;
      
      // For now, we'll store attendees in a separate collection
      // but we can simulate it by checking current booked capacity
      const currentBooked = eventData.capacity.booked || 0;
      
      // Check capacity
      if (currentBooked >= eventData.capacity.total) {
        return {
          success: false,
          message: 'Event is at maximum capacity',
        };
      }

      // Add attendee to a separate attendees collection
      const attendeeWithEventId = {
        ...attendeeData,
        eventId: eventId,
        userId: attendeeData.userId || null,
      };
      
      await addDoc(collection(db, 'eventAttendees'), attendeeWithEventId);
      
      // Update event capacity
      await updateDoc(eventRef, {
        'capacity.booked': currentBooked + 1,
        'capacity.remaining': eventData.capacity.total - currentBooked - 1,
        updatedAt: new Date(),
      });
      
      return {
        success: true,
        message: 'Successfully joined the event',
      };
    } catch (error) {
      console.error('Error adding attendee to event:', error);
      return {
        success: false,
        message: 'Failed to join event',
      };
    }
  }

  // Listen to invitations for an event (real-time)
  subscribeToEventInvitations(eventId: string, callback: (invitations: any[]) => void) {
    const q = query(
      collection(db, 'eventInvitations'),
      where('eventId', '==', eventId)
    );

    return onSnapshot(q, (snapshot) => {
      const invitations: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        invitations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          respondedAt: data.respondedAt?.toDate() || null,
        });
      });
      
      // Sort in JavaScript instead of Firestore
      invitations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      callback(invitations);
    });
  }

  // Update event status
  async updateEventStatus(eventId: string, status: 'draft' | 'published' | 'cancelled' | 'completed') {
    try {
      const eventRef = doc(this.eventsCollection, eventId);
      
      await updateDoc(eventRef, {
        status: status,
        updatedAt: new Date(),
      });
      
      return {
        success: true,
        message: `Event status updated to ${status}`,
      };
    } catch (error) {
      console.error('Error updating event status:', error);
      return {
        success: false,
        message: 'Failed to update event status',
      };
    }
  }

  // Booking Request System

  // Helper method to get user by username (unique identifier)
  async getUserByUsername(username: string): Promise<any | null> {
    try {
      const userQuery = query(
        this.usersCollection,
        where('username', '==', username)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }

  // Helper method to ensure event-host-attendee relationship
  async createEventHostAttendeeMapping(eventId: string, hostId: string, attendeeId: string): Promise<void> {
    try {
      await addDoc(collection(db, 'eventMappings'), {
        eventId,
        hostId,
        attendeeId,
        createdAt: new Date().toISOString(),
        status: 'active'
      });
    } catch (error) {
      console.error('Error creating event mapping:', error);
    }
  }

  // Test Firebase connectivity and permissions
  async testFirebaseConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Testing Firebase connectivity...');
      
      // Try to read from a simple collection
      const testDoc = await getDoc(doc(db, 'test', 'connection'));
      console.log('✅ Firebase read test successful');
      
      // Try to write a simple test document
      await setDoc(doc(db, 'test', 'connection'), {
        timestamp: new Date().toISOString(),
        test: true
      });
      console.log('✅ Firebase write test successful');
      
      return { success: true, message: 'Firebase connection successful' };
      
    } catch (error: any) {
      console.error('❌ Firebase connectivity test failed:', error);
      
      if (error.code === 'permission-denied') {
        return { 
          success: false, 
          message: 'Firebase permission denied - security rules are blocking access' 
        };
      }
      
      if (error.code === 'unavailable') {
        return { 
          success: false, 
          message: 'Firebase unavailable - check internet connection' 
        };
      }
      
      return { 
        success: false, 
        message: `Firebase connection failed: ${error.code || error.message}` 
      };
    }
  }

  // Create a booking request with proper validation
  async createBookingRequest(
    eventId: string, 
    userId: string, 
    userProfile: any, 
    ticketTier: string
  ): Promise<{ success: boolean; message: string; requestId?: string }> {
    try {
      console.log('🔍 Testing Firebase connection before booking request...');
      const connectionTest = await this.testFirebaseConnection();
      if (!connectionTest.success) {
        return {
          success: false,
          message: `Connection failed: ${connectionTest.message}`
        };
      }
      console.log('✅ Firebase connection verified');

      // Validate user exists and has username
      if (!userProfile.username) {
        return { success: false, message: 'Username is required for booking requests' };
      }

      // Get event details
      let event = await this.getEventById(eventId);
      if (!event) {
        console.log('🔍 Event not found in Firestore, creating sample events and retrying...');
        // Try to create sample events first
        await this.createSampleEvents();
        // Try again
        event = await this.getEventById(eventId);
        if (!event) {
          return { success: false, message: 'Event not found. Please try refreshing the app.' };
        }
      }

      // Verify event exists in the events collection
      const eventDoc = await getDoc(doc(this.eventsCollection, eventId));
      if (!eventDoc.exists()) {
        return { success: false, message: 'Event does not exist in database. Please try refreshing the app.' };
      }

      // Check if user already has a request for this event
      const existingRequestQuery = query(
        this.bookingRequestsCollection,
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      );
      const existingRequestSnapshot = await getDocs(existingRequestQuery);
      
      if (!existingRequestSnapshot.empty) {
        return { success: false, message: 'You already have a pending request for this event' };
      }

      // Validate ticket tier exists
      const ticketPrice = event.pricing[ticketTier as keyof typeof event.pricing]?.price;
      if (ticketPrice === undefined) {
        return { success: false, message: 'Invalid ticket tier selected' };
      }

      // Create booking request with all required fields (filter out undefined values)
      const cleanUserProfile: any = {
        id: userProfile.id,
        name: userProfile.name || 'Unknown User',
        username: userProfile.username,
        email: userProfile.email || '',
      };

      // Only add optional fields if they have valid values
      if (userProfile.avatar) {
        cleanUserProfile.avatar = userProfile.avatar;
      }
      if (userProfile.age !== undefined && userProfile.age !== null) {
        cleanUserProfile.age = userProfile.age;
      }
      if (userProfile.city) {
        cleanUserProfile.city = userProfile.city;
      }
      if (userProfile.socialActivityLevel) {
        cleanUserProfile.socialActivityLevel = userProfile.socialActivityLevel;
      }

      const bookingRequest: Omit<BookingRequest, 'id'> = {
        eventId,
        userId,
        hostId: event.host.id,
        status: 'pending',
        ticketTier,
        price: ticketPrice,
        requestedAt: new Date().toISOString(),
        userProfile: cleanUserProfile,
        eventDetails: {
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
        },
      };

      const docRef = await addDoc(this.bookingRequestsCollection, bookingRequest);

      // Create event-host-attendee mapping for tracking
      await this.createEventHostAttendeeMapping(eventId, event.host.id, userId);

      return {
        success: true,
        message: 'Booking request sent successfully! The host will review and respond soon.',
        requestId: docRef.id,
      };
    } catch (error) {
      console.error('Error creating booking request:', error);
      console.error('Error details:', {
        eventId,
        userId,
        userProfile,
        ticketTier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Check if it's a Firestore permission or network error
      if (error instanceof Error && (
        error.message.includes('permission') || 
        error.message.includes('network') || 
        error.message.includes('PERMISSION_DENIED')
      )) {
        return {
          success: false,
          message: 'Database permission error. Please check your internet connection and try again.',
        };
      }
      
      return {
        success: false,
        message: `Failed to send booking request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Get booking requests for a host
  async getBookingRequestsForHost(hostId: string): Promise<BookingRequest[]> {
    try {
      const q = query(
        this.bookingRequestsCollection,
        where('hostId', '==', hostId),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      const requests: BookingRequest[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
        } as BookingRequest);
      });

      // Sort by request date (newest first)
      requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      
      return requests;
    } catch (error) {
      console.error('Error fetching booking requests for host:', error);
      return [];
    }
  }

  // Get user's booking requests/bookings
  async getUserBookings(userId: string): Promise<UserBooking[]> {
    try {
      const q = query(
        this.bookingRequestsCollection,
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const bookings: UserBooking[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          eventId: data.eventId,
          status: data.status,
          ticketTier: data.ticketTier,
          price: data.price,
          requestedAt: data.requestedAt,
          respondedAt: data.respondedAt,
          qrCode: data.qrCode,
          eventDetails: {
            ...data.eventDetails,
            images: [], // We'll need to fetch these separately if needed
          },
        } as UserBooking);
      });

      // Sort by request date (newest first)
      bookings.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      
      return bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  // Get user profile by ID (for viewing other users' profiles)
  async getUserProfileById(userId: string): Promise<any | null> {
    try {
      // First, try to get profile from a user in booking requests
      const bookingQuery = query(
        this.bookingRequestsCollection,
        where('userId', '==', userId),
        limit(1)
      );
      
      const bookingSnapshot = await getDocs(bookingQuery);
      
      if (!bookingSnapshot.empty) {
        const bookingData = bookingSnapshot.docs[0].data();
        return {
          id: userId,
          name: bookingData.userProfile.name,
          username: bookingData.userProfile.username,
          email: bookingData.userProfile.email,
          age: bookingData.userProfile.age,
          city: bookingData.userProfile.city,
          socialActivityLevel: bookingData.userProfile.socialActivityLevel,
          avatar: bookingData.userProfile.avatar,
          isHost: false, // We could check this elsewhere if needed
        };
      }

      // If not found in booking requests, try the users collection (if it exists)
      try {
        const userDoc = await getDoc(doc(this.usersCollection, userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            id: userId,
            name: userData.name,
            username: userData.username,
            email: userData.email,
            age: userData.age,
            city: userData.city,
            socialActivityLevel: userData.socialActivityLevel,
            avatar: userData.avatar,
            phoneNumber: userData.phoneNumber,
            isHost: userData.isHost || false,
          };
        }
      } catch (error) {
        console.log('Users collection may not exist, that\'s ok');
      }

      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Approve booking request (sets to payment pending, doesn't generate QR yet)
  async approveBookingRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    try {
      const requestRef = doc(this.bookingRequestsCollection, requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        return { success: false, message: 'Request not found' };
      }

      const requestData = requestDoc.data() as BookingRequest;
      
      // Check event capacity
      const event = await this.getEventById(requestData.eventId);
      if (!event) {
        return { success: false, message: 'Event not found' };
      }

      if (event.capacity.booked >= event.capacity.total) {
        return { success: false, message: 'Event is at full capacity' };
      }

      // Update request status to approved (user can pay later from live tab)
      await updateDoc(requestRef, {
        status: 'approved',
        paymentStatus: 'pending',
        respondedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Booking request approved! Event moved to live tab with payment option.',
      };
    } catch (error) {
      console.error('Error approving booking request:', error);
      return {
        success: false,
        message: 'Failed to approve request. Please try again.',
      };
    }
  }

  // Process payment and generate QR code
  async processPayment(requestId: string, paymentDetails?: any): Promise<{ success: boolean; message: string; qrCode?: string }> {
    try {
      const requestRef = doc(this.bookingRequestsCollection, requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        return { success: false, message: 'Booking request not found' };
      }

      const requestData = requestDoc.data() as BookingRequest;
      
      if (requestData.status !== 'approved' && requestData.status !== 'payment_pending') {
        return { success: false, message: 'Payment not required for this booking' };
      }

      // Simulate payment processing (in real app, integrate with payment gateway)
      console.log('🔄 Processing payment...', {
        requestId,
        amount: requestData.price,
        eventTitle: requestData.eventDetails.title,
        userEmail: requestData.userProfile.email
      });

      // For demo purposes, we'll simulate successful payment
      // In real implementation, integrate with Razorpay, Stripe, etc.
      const paymentSuccessful = true; // This would come from actual payment gateway

      if (!paymentSuccessful) {
        await updateDoc(requestRef, {
          paymentStatus: 'failed',
        });
        return { success: false, message: 'Payment failed. Please try again.' };
      }

      // Generate QR code only after successful payment
      const qrCode = `CLIQUE-${requestData.eventId}-${requestData.userId}-${Date.now()}`;

      // Update booking to paid status with QR code
      await updateDoc(requestRef, {
        status: 'paid',
        paymentStatus: 'completed',
        paymentCompletedAt: new Date().toISOString(),
        qrCode: qrCode,
      });

      // Update event capacity only after payment is completed
      const event = await this.getEventById(requestData.eventId);
      if (event) {
        await updateDoc(doc(this.eventsCollection, requestData.eventId), {
          'capacity.booked': event.capacity.booked + 1,
          'capacity.remaining': event.capacity.total - event.capacity.booked - 1,
          updatedAt: new Date(),
        });
      }

      console.log('✅ Payment processed successfully', { qrCode });

      return {
        success: true,
        message: 'Payment successful! Your ticket is ready.',
        qrCode: qrCode,
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        message: 'Payment processing failed. Please try again.',
      };
    }
  }

  // Reject booking request
  async rejectBookingRequest(requestId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const requestRef = doc(this.bookingRequestsCollection, requestId);
      
      await updateDoc(requestRef, {
        status: 'rejected',
        respondedAt: new Date().toISOString(),
        rejectionReason: reason || 'Request was declined by host',
      });

      return {
        success: true,
        message: 'Booking request rejected',
      };
    } catch (error) {
      console.error('Error rejecting booking request:', error);
      return {
        success: false,
        message: 'Failed to reject request. Please try again.',
      };
    }
  }

  // Cancel booking request (by user)
  async cancelBookingRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    try {
      const requestRef = doc(this.bookingRequestsCollection, requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        return { success: false, message: 'Request not found' };
      }

      const requestData = requestDoc.data();
      
      if (requestData.status !== 'pending') {
        return { success: false, message: 'Can only cancel pending requests' };
      }

      await deleteDoc(requestRef);

      return {
        success: true,
        message: 'Booking request cancelled successfully',
      };
    } catch (error) {
      console.error('Error cancelling booking request:', error);
      return {
        success: false,
        message: 'Failed to cancel request. Please try again.',
      };
    }
  }

  // Subscribe to booking requests for host (real-time)
  subscribeToHostBookingRequests(hostId: string, callback: (requests: BookingRequest[]) => void) {
    const q = query(
      this.bookingRequestsCollection,
      where('hostId', '==', hostId),
      where('status', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
      const requests: BookingRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
        } as BookingRequest);
      });
      
      requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      callback(requests);
    });
  }

  // Subscribe to user bookings (real-time)
  subscribeToUserBookings(userId: string, callback: (bookings: UserBooking[]) => void) {
    const q = query(
      this.bookingRequestsCollection,
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const bookings: UserBooking[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          eventId: data.eventId,
          status: data.status,
          ticketTier: data.ticketTier,
          price: data.price,
          requestedAt: data.requestedAt,
          respondedAt: data.respondedAt,
          qrCode: data.qrCode,
          eventDetails: {
            ...data.eventDetails,
            images: [],
          },
        } as UserBooking);
      });
      
      bookings.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      callback(bookings);
    });
  }

  // Get all attendees for an event (only paid attendees)
  async getEventAttendees(eventId: string): Promise<any[]> {
    try {
      // Get all paid booking requests for this event
      const q = query(
        this.bookingRequestsCollection,
        where('eventId', '==', eventId),
        where('status', '==', 'paid')
      );
      
      const snapshot = await getDocs(q);
      const attendees: any[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        attendees.push({
          id: doc.id,
          userId: data.userId,
          userProfile: data.userProfile,
          ticketTier: data.ticketTier,
          price: data.price,
          requestedAt: data.requestedAt,
          approvedAt: data.respondedAt,
          paidAt: data.paymentCompletedAt,
          qrCode: data.qrCode,
        });
      });

      // Sort by payment date (newest first)
      attendees.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
      
      return attendees;
    } catch (error) {
      console.error('Error fetching event attendees:', error);
      return [];
    }
  }

  // Helper method to create sample events for testing
  async createSampleEvents(): Promise<void> {
    try {
      // Check if events already exist to avoid duplicates
      const existingEvents = await this.getPublishedEvents();
      if (existingEvents.length > 0) {
        console.log('📋 Sample events already exist, skipping creation');
        return;
      }

      console.log('🔨 Creating sample events...');
      
      const sampleEvents = [
        {
          title: "Tech Conference 2025",
          description: "A comprehensive technology conference featuring the latest in AI, blockchain, and web development. Join industry leaders and innovators for a day of learning and networking.",
          category: "Technology",
          date: "2025-12-15",
          time: "09:00",
          endTime: "18:00",
          location: {
            name: "Convention Center",
            address: "123 Tech Street",
            city: "San Francisco",
            coordinates: { lat: 37.7749, lng: -122.4194 }
          },
          pricing: {
            early: { price: 500, label: "Early Bird", available: true },
            regular: { price: 750, label: "Regular", available: true },
            premium: { price: 1200, label: "VIP", available: true }
          },
          host: {
            id: "demo_host_1",
            name: "Tech Events Inc",
            username: "techevents",
            avatar: DEFAULT_AVATAR,
            rating: 4.8,
            eventsHosted: 25,
            isVerified: true
          },
          images: [
            "https://picsum.photos/400/600?random=1",
            "https://picsum.photos/400/600?random=2"
          ],
          amenities: ["WiFi", "Lunch", "Networking", "Swag Bag", "Certificates"],
          capacity: {
            total: 500,
            booked: 0,
            remaining: 500
          },
          ageRestriction: "18+",
          dressCode: "Business Casual",
          tags: ["Technology", "AI", "Blockchain"],
          status: 'published' as const,
          reviews: { rating: 4.8, count: 0 },
          totalPhotos: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Music Festival 2025", 
          description: "An amazing outdoor music festival featuring top artists from around the world. Three days of non-stop entertainment.",
          category: "Music",
          date: "2025-12-20",
          time: "14:00",
          endTime: "23:00",
          location: {
            name: "Central Park",
            address: "456 Music Avenue", 
            city: "Mumbai",
            coordinates: { lat: 19.0760, lng: 72.8777 }
          },
          pricing: {
            regular: { price: 2500, label: "General Admission", available: true },
            premium: { price: 5000, label: "VIP Experience", available: true }
          },
          host: {
            id: "demo_host_2",
            name: "Music Events Co",
            username: "musicevents",
            avatar: DEFAULT_AVATAR,
            rating: 4.9,
            eventsHosted: 15,
            isVerified: true
          },
          images: [
            "https://picsum.photos/400/600?random=3",
            "https://picsum.photos/400/600?random=4"
          ],
          amenities: ["Food Stalls", "Bar", "Rest Areas", "Parking"],
          capacity: {
            total: 1000,
            booked: 0,
            remaining: 1000
          },
          ageRestriction: "All Ages",
          dressCode: "Casual",
          tags: ["Music", "Festival", "Outdoor"],
          status: 'published' as const,
          reviews: { rating: 4.9, count: 0 },
          totalPhotos: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      for (const event of sampleEvents) {
        await addDoc(this.eventsCollection, event);
      }
      
      console.log('✅ Sample events created successfully');
    } catch (error) {
      console.error('❌ Error creating sample events:', error);
    }
  }

  // Photo Collage Integration Methods

  // Get event feed for homepage (integrates posts with events)
  async getEventFeedForHome(userId?: string, lastPostId?: string, limitCount: number = 20): Promise<{
    posts: EventPost[];
    hasMore: boolean;
    nextCursor?: string;
  }> {
    return EventPostService.getEventFeed(userId, lastPostId, limitCount);
  }

  // Get photo collage for an event
  async getEventPhotoCollage(eventId: string): Promise<{
    collage: EventPhotoCollage;
    photos: any[];
    contributors: any[];
  } | null> {
    return EventPostService.getEventPhotoCollage(eventId);
  }

  // Create post with photos for an event
  async createEventPost(
    userId: string,
    eventId: string,
    content: { text: string; hashtags: string[]; mentions: string[] },
    mediaFiles: File[] = []
  ): Promise<string> {
    return EventPostService.createEventPost(userId, eventId, content, mediaFiles);
  }

  // Like/unlike a post
  async togglePostLike(postId: string, userId: string): Promise<void> {
    return EventPostService.togglePostLike(postId, userId);
  }

  // Like/unlike a photo in collage
  async togglePhotoLike(photoId: string, userId: string): Promise<void> {
    return EventPostService.togglePhotoLike(photoId, userId);
  }

  // Get event statistics including photo counts
  async getEventStatsWithPhotos(eventId: string): Promise<{
    totalPhotos: number;
    totalContributors: number;
    totalLikes: number;
    totalPosts: number;
    totalBookings: number;
    capacity: { total: number; booked: number; remaining: number };
  }> {
    try {
      const [photoStats, event] = await Promise.all([
        EventPostService.getEventStats(eventId),
        this.getEventById(eventId)
      ]);

      return {
        ...photoStats,
        totalBookings: event?.capacity.booked || 0,
        capacity: event?.capacity || { total: 0, booked: 0, remaining: 0 }
      };
    } catch (error) {
      console.error('Error getting event stats with photos:', error);
      return {
        totalPhotos: 0,
        totalContributors: 0,
        totalLikes: 0,
        totalPosts: 0,
        totalBookings: 0,
        capacity: { total: 0, booked: 0, remaining: 0 }
      };
    }
  }

  // Mark event as completed and enable photo sharing
  async markEventCompleted(eventId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.updateEventStatus(eventId, 'completed');
      
      if (result.success) {
        // Initialize photo collage for the event
        const event = await this.getEventById(eventId);
        if (event) {
          // Photo collage will be created automatically when first photo is added
          console.log(`✅ Event ${eventId} marked as completed, photo sharing enabled`);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error marking event as completed:', error);
      return {
        success: false,
        message: 'Failed to mark event as completed'
      };
    }
  }
}

export const eventsService = new EventsService();