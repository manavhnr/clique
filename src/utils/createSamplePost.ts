import { createPost } from '../services/postService';
import type { Post } from '../types/posts';

export const createSamplePost = async (userId: string) => {
  try {
    const samplePost = {
      authorId: userId,
      eventId: null,
      text: '🌟 Amazing rooftop party last night! The city lights, great music, and awesome company made it unforgettable. Thanks everyone for making it special! #CliqueLife #RooftopVibes',
      mediaUrls: [
        'https://picsum.photos/400/400?random=1',
        'https://picsum.photos/400/400?random=2',
        'https://picsum.photos/400/400?random=3',
        'https://picsum.photos/400/400?random=4'
      ],
      visibility: 'public'
    };

    const postId = await createPost(
      samplePost.authorId,
      samplePost.eventId,
      samplePost.text,
      samplePost.mediaUrls,
      samplePost.visibility
    );

    console.log('Sample post created with ID:', postId);
    return postId;
  } catch (error) {
    console.error('Error creating sample post:', error);
    throw error;
  }
};

export const createMultipleSamplePosts = async (userId: string) => {
  const samplePosts = [
    {
      authorId: userId,
      eventId: null,
      text: '🎉 What an incredible night at the downtown jazz club! Live music, craft cocktails, and amazing people. This is what Clique is all about! #JazzNight #LiveMusic',
      mediaUrls: [
        'https://picsum.photos/400/400?random=5',
        'https://picsum.photos/400/400?random=6'
      ],
      visibility: 'public'
    },
    {
      authorId: userId,
      eventId: null,
      text: '🍽️ Foodie adventure complete! We tried 8 different restaurants in one night. From street food to fine dining - every bite was worth it! Who\'s joining the next food crawl? #FoodCrawl #Foodie',
      mediaUrls: [
        'https://picsum.photos/400/400?random=7',
        'https://picsum.photos/400/400?random=8',
        'https://picsum.photos/400/400?random=9'
      ],
      visibility: 'public'
    },
    {
      authorId: userId,
      eventId: null,
      text: '🎵 Underground music scene is alive and well! Discovered three new bands tonight. The energy was electric and the crowd was amazing. Can\'t wait for the next show! #UndergroundMusic #LiveShow',
      mediaUrls: [
        'https://picsum.photos/400/400?random=10'
      ],
      visibility: 'public'
    }
  ];

  try {
    const postIds = [];
    for (const post of samplePosts) {
      const postId = await createPost(
        post.authorId,
        post.eventId,
        post.text,
        post.mediaUrls,
        post.visibility
      );
      postIds.push(postId);
      console.log('Created sample post:', postId);
      
      // Add a small delay between posts to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return postIds;
  } catch (error) {
    console.error('Error creating multiple sample posts:', error);
    throw error;
  }
};