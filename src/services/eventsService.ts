import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

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
          avatar: hostInfo.avatar || 'https://picsum.photos/100/100?random=21',
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
}

export const eventsService = new EventsService();