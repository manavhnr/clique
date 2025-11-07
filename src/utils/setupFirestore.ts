import { eventsService } from '../services/eventsService';

// Test function to create sample events and verify database connection
export async function setupFirestoreData() {
  try {
    console.log('🔥 Setting up Firestore data...');
    
    // Create sample events
    await eventsService.createSampleEvents();
    
    // Test fetching events
    const events = await eventsService.getPublishedEvents();
    console.log(`✅ Successfully setup complete - Found ${events.length} events in Firestore`);
    
    // Log some sample event IDs for debugging
    if (events.length > 0) {
      console.log('📋 Sample event IDs:', events.map(e => ({ id: e.id, title: e.title })));
    }
    
    return { success: true, message: 'Firestore data setup complete' };
  } catch (error) {
    console.error('❌ Error setting up Firestore data:', error);
    return { success: false, message: 'Failed to setup Firestore data' };
  }
}

// Test booking request functionality
export async function testBookingSystem() {
  try {
    console.log('🧪 Testing booking request system...');
    
    const testUser = {
      id: 'test_user_1',
      name: 'Test User',
      username: 'testuser123',
      email: 'test@example.com',
      city: 'Mumbai',
      socialActivityLevel: 'frequently' as const
    };

    // Get available events
    const events = await eventsService.getPublishedEvents();
    if (events.length === 0) {
      console.log('No events available for testing');
      return { success: false, message: 'No events to test with' };
    }

    const testEvent = events[0];
    console.log(`Testing booking for event: ${testEvent.title}`);

    // Create a booking request
    const bookingResult = await eventsService.createBookingRequest(
      testEvent.id,
      testUser.id,
      testUser,
      'regular'
    );

    if (bookingResult.success) {
      console.log('✅ Booking request created successfully');
      
      // Test getting user bookings
      const userBookings = await eventsService.getUserBookings(testUser.id);
      console.log(`✅ Retrieved ${userBookings.length} user bookings`);
      
      // Test getting host requests  
      const hostRequests = await eventsService.getBookingRequestsForHost(testEvent.host.id);
      console.log(`✅ Retrieved ${hostRequests.length} host requests`);
      
      return { success: true, message: 'Booking system test passed' };
    } else {
      console.error('❌ Booking request failed:', bookingResult.message);
      return { success: false, message: bookingResult.message };
    }
  } catch (error) {
    console.error('❌ Booking system test failed:', error);
    return { success: false, message: 'Booking system test failed' };
  }
}