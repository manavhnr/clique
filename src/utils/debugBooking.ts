import { eventsService } from '../services/eventsService';

// Simple debug utility to test booking requests
export async function debugBookingSystem() {
  console.log('🔧 Starting booking system debug...');
  
  try {
    // Test 0: Check Firebase connectivity
    console.log('🔍 Test 0: Testing Firebase connectivity...');
    const connectionTest = await eventsService.testFirebaseConnection();
    console.log('🔍 Connection test result:', connectionTest);
    
    if (!connectionTest.success) {
      console.log('❌ Firebase connection failed, stopping debug');
      return;
    }

    // Test 1: Check if we can fetch events
    console.log('📋 Test 1: Fetching events...');
    const events = await eventsService.getPublishedEvents();
    console.log(`✅ Found ${events.length} events`);
    
    if (events.length === 0) {
      console.log('🔨 No events found, creating sample events...');
      await eventsService.createSampleEvents();
      const newEvents = await eventsService.getPublishedEvents();
      console.log(`✅ Created ${newEvents.length} sample events`);
    }
    
    // Test 2: Try a simple booking request
    if (events.length > 0 || (await eventsService.getPublishedEvents()).length > 0) {
      const testEvents = await eventsService.getPublishedEvents();
      const testEvent = testEvents[0];
      
      console.log('📝 Test 2: Creating booking request...');
      console.log('Event ID:', testEvent.id);
      
      const testUser = {
        id: 'test_debug_user',
        name: 'Debug User',
        username: 'debuguser',
        email: 'debug@test.com',
        city: 'Test City',
        age: 25,
        socialActivityLevel: 'high'
      };
      
      const result = await eventsService.createBookingRequest(
        testEvent.id,
        testUser.id,
        testUser,
        'regular'
      );
      
      console.log('📝 Booking result:', result);
      
      if (result.success) {
        console.log('✅ Booking system is working correctly!');
      } else {
        console.log('❌ Booking failed:', result.message);
      }
    }
    
  } catch (error) {
    console.error('💥 Debug test failed:', error);
  }
}