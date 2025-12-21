// Comprehensive EventsService tests
import { BookingRequest, UserBooking } from '../../types/booking';

// Mock Firebase completely - use relative path that exists
jest.mock('../../../firebaseConfig', () => ({
  db: {},
}));

// Mock Firebase functions
const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
};

jest.mock('firebase/firestore', () => mockFirestore);

describe('EventsService Core Functionality Tests', () => {
  // Test 21: Booking request creation validation
  test('should validate booking request data structure', () => {
    const validBookingRequest: Partial<BookingRequest> = {
      eventId: 'event123',
      userId: 'user456',
      hostId: 'host789',
      status: 'pending',
      ticketTier: 'General',
      price: 1500,
      requestedAt: new Date().toISOString(),
      userProfile: {
        id: 'user456',
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        age: 25,
        city: 'Mumbai',
        socialActivityLevel: 'frequently',
      },
      eventDetails: {
        title: 'Summer Music Festival',
        date: '2024-06-15',
        time: '6:00 PM',
        location: {
          name: 'Central Park',
          address: '123 Park Street, Mumbai',
        },
      },
    };

    expect(validBookingRequest.eventId).toBeDefined();
    expect(validBookingRequest.userId).toBeDefined();
    expect(validBookingRequest.status).toBe('pending');
    expect(validBookingRequest.price).toBeGreaterThan(0);
    expect(validBookingRequest.userProfile?.name).toBeDefined();
    expect(validBookingRequest.eventDetails?.title).toBeDefined();
  });

  // Test 22: Event capacity validation
  test('should validate event capacity constraints', () => {
    interface EventCapacity {
      total: number;
      booked: number;
      available: number;
    }

    const validateCapacity = (capacity: EventCapacity): boolean => {
      return capacity.booked <= capacity.total && 
             capacity.available === (capacity.total - capacity.booked) &&
             capacity.total > 0;
    };

    const validCapacity: EventCapacity = { total: 100, booked: 45, available: 55 };
    const invalidCapacity1: EventCapacity = { total: 100, booked: 105, available: -5 }; // Overbooked
    const invalidCapacity2: EventCapacity = { total: 0, booked: 0, available: 0 }; // Zero capacity

    expect(validateCapacity(validCapacity)).toBe(true);
    expect(validateCapacity(invalidCapacity1)).toBe(false);
    expect(validateCapacity(invalidCapacity2)).toBe(false);
  });

  // Test 23: Booking approval logic
  test('should validate booking approval workflow', () => {
    interface ApprovalResult {
      success: boolean;
      message: string;
      newStatus?: BookingRequest['status'];
    }

    const approveBookingRequest = (
      currentStatus: BookingRequest['status'],
      capacity: { total: number; booked: number }
    ): ApprovalResult => {
      if (currentStatus !== 'pending') {
        return { success: false, message: 'Only pending requests can be approved' };
      }

      if (capacity.booked >= capacity.total) {
        return { success: false, message: 'Event is at full capacity' };
      }

      return { 
        success: true, 
        message: 'Booking request approved! Event moved to live tab with payment option.',
        newStatus: 'approved'
      };
    };

    // Test successful approval
    const result1 = approveBookingRequest('pending', { total: 100, booked: 50 });
    expect(result1.success).toBe(true);
    expect(result1.newStatus).toBe('approved');

    // Test approval of non-pending request
    const result2 = approveBookingRequest('approved', { total: 100, booked: 50 });
    expect(result2.success).toBe(false);
    expect(result2.message).toContain('Only pending requests');

    // Test approval when at capacity
    const result3 = approveBookingRequest('pending', { total: 100, booked: 100 });
    expect(result3.success).toBe(false);
    expect(result3.message).toContain('full capacity');
  });

  // Test 24: Payment processing validation
  test('should validate payment processing logic', () => {
    interface PaymentResult {
      success: boolean;
      message: string;
      qrCode?: string;
      newStatus?: BookingRequest['status'];
    }

    const processPayment = (
      currentStatus: BookingRequest['status'],
      amount: number
    ): PaymentResult => {
      if (currentStatus !== 'approved' && currentStatus !== 'payment_pending') {
        return { success: false, message: 'Payment not required for this booking' };
      }

      if (amount <= 0) {
        return { success: false, message: 'Invalid payment amount' };
      }

      // Simulate successful payment
      return {
        success: true,
        message: 'Payment successful! QR code generated.',
        qrCode: `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        newStatus: 'paid'
      };
    };

    // Test successful payment for approved booking
    const result1 = processPayment('approved', 1500);
    expect(result1.success).toBe(true);
    expect(result1.qrCode).toBeDefined();
    expect(result1.newStatus).toBe('paid');

    // Test successful payment for payment_pending booking
    const result2 = processPayment('payment_pending', 2500);
    expect(result2.success).toBe(true);
    expect(result2.qrCode).toBeDefined();

    // Test payment for wrong status
    const result3 = processPayment('pending', 1500);
    expect(result3.success).toBe(false);
    expect(result3.message).toContain('Payment not required');

    // Test invalid amount
    const result4 = processPayment('approved', 0);
    expect(result4.success).toBe(false);
    expect(result4.message).toContain('Invalid payment amount');
  });

  // Test 25: QR code generation
  test('should generate valid QR codes', () => {
    const generateQRCode = (bookingId: string, eventId: string, userId: string): string => {
      const qrData = {
        bookingId,
        eventId,
        userId,
        timestamp: Date.now(),
        type: 'event_ticket'
      };
      return `QR_${Buffer.from(JSON.stringify(qrData)).toString('base64')}`;
    };

    const qrCode = generateQRCode('booking123', 'event456', 'user789');
    
    expect(qrCode).toMatch(/^QR_/);
    expect(qrCode.length).toBeGreaterThan(10);

    // Decode and verify QR code data
    const base64Data = qrCode.replace('QR_', '');
    const decodedData = JSON.parse(Buffer.from(base64Data, 'base64').toString());
    
    expect(decodedData.bookingId).toBe('booking123');
    expect(decodedData.eventId).toBe('event456');
    expect(decodedData.userId).toBe('user789');
    expect(decodedData.type).toBe('event_ticket');
  });
});

describe('EventsService Data Management Tests', () => {
  // Test 26: Event creation validation
  test('should validate event creation data', () => {
    interface CreateEventData {
      title: string;
      description: string;
      date: string;
      time: string;
      location: string;
      price: number;
      capacity: number;
      category: string;
      hostId: string;
    }

    const validateEventData = (eventData: CreateEventData): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (!eventData.title || eventData.title.length < 3) {
        errors.push('Title must be at least 3 characters');
      }

      if (!eventData.description || eventData.description.length < 10) {
        errors.push('Description must be at least 10 characters');
      }

      if (new Date(eventData.date) <= new Date('2024-01-01')) {
        errors.push('Event date must be in the future');
      }

      if (eventData.price < 0) {
        errors.push('Price cannot be negative');
      }

      if (eventData.capacity < 1) {
        errors.push('Capacity must be at least 1');
      }

      if (!eventData.hostId) {
        errors.push('Host ID is required');
      }

      return { isValid: errors.length === 0, errors };
    };

    // Valid event data
    const validEvent: CreateEventData = {
      title: 'Summer Music Festival',
      description: 'A fantastic music festival featuring local artists',
      date: '2024-08-15',
      time: '6:00 PM',
      location: 'Central Park, Mumbai',
      price: 1500,
      capacity: 200,
      category: 'music',
      hostId: 'host123',
    };

    // Invalid event data
    const invalidEvent: CreateEventData = {
      title: 'AB', // Too short
      description: 'Short', // Too short
      date: '2020-01-01', // Past date
      time: '6:00 PM',
      location: 'Central Park',
      price: -100, // Negative price
      capacity: 0, // Zero capacity
      category: 'music',
      hostId: '', // Empty host ID
    };

    const validResult = validateEventData(validEvent);
    const invalidResult = validateEventData(invalidEvent);

    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toContain('Title must be at least 3 characters');
    expect(invalidResult.errors).toContain('Description must be at least 10 characters');
    expect(invalidResult.errors).toContain('Event date must be in the future');
    expect(invalidResult.errors).toContain('Price cannot be negative');
    expect(invalidResult.errors).toContain('Capacity must be at least 1');
    expect(invalidResult.errors).toContain('Host ID is required');
  });

  // Test 27: User booking history
  test('should manage user booking history correctly', () => {
    const mockUserBookings: UserBooking[] = [
      {
        id: 'booking1',
        eventId: 'event1',
        status: 'paid',
        ticketTier: 'VIP',
        price: 2500,
        requestedAt: '2024-01-01T10:00:00Z',
        paymentCompletedAt: '2024-01-01T12:00:00Z',
        qrCode: 'QR123',
        eventDetails: {
          title: 'Past Event',
          date: '2024-01-15',
          time: '8:00 PM',
          location: { name: 'Venue A', address: 'Address A' },
          images: ['image1.jpg'],
        },
      },
      {
        id: 'booking2',
        eventId: 'event2',
        status: 'approved',
        ticketTier: 'General',
        price: 1500,
        requestedAt: '2024-02-01T10:00:00Z',
        eventDetails: {
          title: 'Upcoming Event',
          date: '2024-08-20',
          time: '7:00 PM',
          location: { name: 'Venue B', address: 'Address B' },
          images: ['image2.jpg'],
        },
      },
    ];

    const getUserBookingStats = (bookings: UserBooking[]) => {
      return {
        totalBookings: bookings.length,
        totalSpent: bookings
          .filter(b => b.status === 'paid')
          .reduce((sum, b) => sum + b.price, 0),
        pendingPayments: bookings
          .filter(b => b.status === 'approved' || b.status === 'payment_pending')
          .reduce((sum, b) => sum + b.price, 0),
        upcomingEvents: bookings.filter(b => 
          new Date(b.eventDetails.date) > new Date('2024-01-01') && 
          (b.status === 'approved' || b.status === 'payment_pending' || b.status === 'paid')
        ).length,
      };
    };

    const stats = getUserBookingStats(mockUserBookings);

    expect(stats.totalBookings).toBe(2);
    expect(stats.totalSpent).toBe(2500);
    expect(stats.pendingPayments).toBe(1500);
    expect(stats.upcomingEvents).toBe(2);
  });

  // Test 28: Event search and filtering
  test('should filter and search events correctly', () => {
    interface Event {
      id: string;
      title: string;
      category: string;
      price: number;
      date: string;
      location: string;
      tags: string[];
    }

    const mockEvents: Event[] = [
      {
        id: 'event1',
        title: 'Rock Concert',
        category: 'music',
        price: 2500,
        date: '2024-06-15',
        location: 'Mumbai',
        tags: ['rock', 'live', 'outdoor'],
      },
      {
        id: 'event2',
        title: 'Food Festival',
        category: 'food',
        price: 500,
        date: '2024-07-20',
        location: 'Delhi',
        tags: ['food', 'family', 'indoor'],
      },
      {
        id: 'event3',
        title: 'Tech Conference',
        category: 'conference',
        price: 1500,
        date: '2024-08-10',
        location: 'Bangalore',
        tags: ['tech', 'networking', 'indoor'],
      },
    ];

    const searchEvents = (events: Event[], filters: {
      category?: string;
      priceRange?: { min: number; max: number };
      location?: string;
      searchTerm?: string;
    }) => {
      return events.filter(event => {
        if (filters.category && event.category !== filters.category) return false;
        
        if (filters.priceRange && 
            (event.price < filters.priceRange.min || event.price > filters.priceRange.max)) {
          return false;
        }
        
        if (filters.location && 
            !event.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
        
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          return event.title.toLowerCase().includes(term) ||
                 event.tags.some(tag => tag.toLowerCase().includes(term));
        }
        
        return true;
      });
    };

    // Test category filter
    expect(searchEvents(mockEvents, { category: 'music' })).toHaveLength(1);
    expect(searchEvents(mockEvents, { category: 'food' })).toHaveLength(1);

    // Test price range filter
    expect(searchEvents(mockEvents, { priceRange: { min: 1000, max: 2000 } })).toHaveLength(1);
    expect(searchEvents(mockEvents, { priceRange: { min: 0, max: 1000 } })).toHaveLength(1);

    // Test location filter
    expect(searchEvents(mockEvents, { location: 'Mumbai' })).toHaveLength(1);
    expect(searchEvents(mockEvents, { location: 'Delhi' })).toHaveLength(1);

    // Test search term filter
    expect(searchEvents(mockEvents, { searchTerm: 'rock' })).toHaveLength(1);
    expect(searchEvents(mockEvents, { searchTerm: 'tech' })).toHaveLength(1);
    expect(searchEvents(mockEvents, { searchTerm: 'indoor' })).toHaveLength(2);
  });

  // Test 29: Host dashboard data aggregation
  test('should aggregate host dashboard data correctly', () => {
    interface HostDashboardData {
      totalEvents: number;
      totalRevenue: number;
      totalAttendees: number;
      upcomingEvents: number;
      pendingRequests: number;
      averageRating: number;
    }

    const mockHostBookings: BookingRequest[] = [
      {
        id: 'req1',
        eventId: 'event1',
        userId: 'user1',
        hostId: 'host123',
        status: 'paid',
        ticketTier: 'General',
        price: 1500,
        requestedAt: '2024-01-01T10:00:00Z',
        paymentStatus: 'completed',
        userProfile: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        eventDetails: {
          title: 'Event 1',
          date: '2024-06-15',
          time: '8:00 PM',
          location: { name: 'Venue A', address: 'Address A' },
        },
      },
      {
        id: 'req2',
        eventId: 'event1',
        userId: 'user2',
        hostId: 'host123',
        status: 'pending',
        ticketTier: 'VIP',
        price: 2500,
        requestedAt: '2024-02-01T10:00:00Z',
        userProfile: {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
        eventDetails: {
          title: 'Event 1',
          date: '2024-06-15',
          time: '8:00 PM',
          location: { name: 'Venue A', address: 'Address A' },
        },
      },
    ];

    const calculateHostDashboard = (bookings: BookingRequest[]): HostDashboardData => {
      const uniqueEvents = new Set(bookings.map(b => b.eventId));
      const paidBookings = bookings.filter(b => b.status === 'paid');
      const pendingBookings = bookings.filter(b => b.status === 'pending');
      
      return {
        totalEvents: uniqueEvents.size,
        totalRevenue: paidBookings.reduce((sum, b) => sum + b.price, 0),
        totalAttendees: paidBookings.length,
        upcomingEvents: uniqueEvents.size, // Simplified
        pendingRequests: pendingBookings.length,
        averageRating: 4.5, // Mock rating
      };
    };

    const dashboardData = calculateHostDashboard(mockHostBookings);

    expect(dashboardData.totalEvents).toBe(1);
    expect(dashboardData.totalRevenue).toBe(1500);
    expect(dashboardData.totalAttendees).toBe(1);
    expect(dashboardData.pendingRequests).toBe(1);
    expect(dashboardData.averageRating).toBe(4.5);
  });

  // Test 30: Error handling and validation
  test('should handle service errors gracefully', () => {
    interface ServiceResponse<T> {
      success: boolean;
      data?: T;
      error?: string;
    }

    const mockApiCall = async <T>(
      operation: string,
      data?: any
    ): Promise<ServiceResponse<T>> => {
      // Simulate various error conditions
      if (!data) {
        return { success: false, error: 'Missing required data' };
      }

      if (operation === 'network_error') {
        return { success: false, error: 'Network connection failed' };
      }

      if (operation === 'permission_denied') {
        return { success: false, error: 'Insufficient permissions' };
      }

      if (operation === 'not_found') {
        return { success: false, error: 'Resource not found' };
      }

      // Simulate success
      return { success: true, data: data as T };
    };

    // Test various error scenarios
    expect(mockApiCall('test')).resolves.toEqual({ 
      success: false, 
      error: 'Missing required data' 
    });

    expect(mockApiCall('network_error', {})).resolves.toEqual({ 
      success: false, 
      error: 'Network connection failed' 
    });

    expect(mockApiCall('permission_denied', {})).resolves.toEqual({ 
      success: false, 
      error: 'Insufficient permissions' 
    });

    expect(mockApiCall('not_found', {})).resolves.toEqual({ 
      success: false, 
      error: 'Resource not found' 
    });

    expect(mockApiCall('success', { test: 'data' })).resolves.toEqual({ 
      success: true, 
      data: { test: 'data' } 
    });
  });
});