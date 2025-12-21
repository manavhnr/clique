import { eventsService } from '../services/eventsService';
import EventPostService from '../services/eventPostService';

export async function createDemoEventPosts() {
  try {
    console.log('🔨 Creating demo event posts...');
    
    // First ensure we have some sample events
    await eventsService.createSampleEvents();
    
    // Get the published events to link posts to
    const events = await eventsService.getPublishedEvents();
    
    if (events.length === 0) {
      console.log('❌ No events found to create posts for');
      return;
    }

    // Demo posts data
    const demoPosts = [
      {
        userId: 'demo_user_1',
        eventId: events[0]?.id || 'demo_event_1',
        content: {
          text: 'Just wrapped up an incredible Tech Conference 2025! 🚀 Amazing turnout with brilliant minds discussing AI, blockchain, and the future of tech. The networking sessions were pure gold! ✨\n\n#TechConf2025 #AI #Blockchain #Networking',
          hashtags: ['#TechConf2025', '#AI', '#Blockchain', '#Networking'],
          mentions: []
        },
        mediaFiles: [] // We'll simulate this without actual file uploads for demo
      },
      {
        userId: 'demo_user_2', 
        eventId: events[1]?.id || 'demo_event_2',
        content: {
          text: 'What an amazing Music Festival experience! 🎵 Three days of non-stop entertainment, incredible artists, and the best crowd energy. Already missing the vibes! 🎶\n\nShout out to @festival_crew for the amazing organization 👏\n\n#MusicFest2025 #LiveMusic #GoodVibes',
          hashtags: ['#MusicFest2025', '#LiveMusic', '#GoodVibes'],
          mentions: ['@festival_crew']
        },
        mediaFiles: []
      }
    ];

    // Create demo posts
    for (const postData of demoPosts) {
      try {
        const postId = await EventPostService.createEventPost(
          postData.userId,
          postData.eventId, 
          postData.content,
          postData.mediaFiles
        );
        console.log(`✅ Created demo post: ${postId}`);
      } catch (error) {
        console.error('❌ Error creating demo post:', error);
      }
    }

    console.log('✅ Demo event posts creation completed');
    
  } catch (error) {
    console.error('❌ Error creating demo event posts:', error);
  }
}

// Auto-create demo data when imported (for development)
if (__DEV__) {
  // Delay execution to ensure Firebase is initialized
  setTimeout(() => {
    createDemoEventPosts().catch(console.error);
  }, 2000);
}