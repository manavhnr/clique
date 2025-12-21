/**
 * Client-side integration for React Native app
 * Hook for fetching personalized feed
 */

import { useState, useEffect, useCallback } from 'react';

interface PersonalizedFeedHookResult {
  posts: any[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface UsePersonalizedFeedOptions {
  userId: string;
  limit?: number;
  includeDebug?: boolean;
  autoLoad?: boolean;
}

/**
 * React Native hook for personalized feed
 * Works with both Cloud Functions and Express API
 */
export function usePersonalizedFeed({
  userId,
  limit = 20,
  includeDebug = false,
  autoLoad = true
}: UsePersonalizedFeedOptions): PersonalizedFeedHookResult {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();

  // Load initial feed
  const loadFeed = useCallback(async (refreshing = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const requestCursor = refreshing ? undefined : cursor;
      const response = await fetchPersonalizedFeed({
        userId,
        limit,
        cursor: requestCursor,
        includeDebug
      });

      if (refreshing) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      setHasMore(response.hasMore);
      setCursor(response.nextCursor);
      
      if (includeDebug && response.debugInfo) {
        console.log('🔍 Feed Debug Info:', response.debugInfo);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load feed';
      setError(errorMessage);
      console.error('❌ Feed loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, limit, cursor, includeDebug, loading]);

  // Load more posts (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadFeed(false);
  }, [hasMore, loading, loadFeed]);

  // Refresh feed
  const refresh = useCallback(async () => {
    setCursor(undefined);
    await loadFeed(true);
  }, [loadFeed]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && userId) {
      loadFeed(true);
    }
  }, [userId, autoLoad]); // Only trigger on userId change

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}

/**
 * Core API call function
 * Adapt this based on your backend choice (Cloud Functions vs Express)
 */
async function fetchPersonalizedFeed({
  userId,
  limit,
  cursor,
  includeDebug
}: {
  userId: string;
  limit: number;
  cursor?: string;
  includeDebug: boolean;
}): Promise<any> {
  
  // Option 1: Firebase Cloud Functions
  if (process.env.EXPO_PUBLIC_USE_CLOUD_FUNCTIONS === 'true') {
    const { getFunctions, httpsCallable } = require('firebase/functions');
    const functions = getFunctions();
    const getPersonalizedFeed = httpsCallable(functions, 'getPersonalizedFeed');
    
    const result = await getPersonalizedFeed({
      userId,
      limit,
      cursor,
      includeDebug
    });
    
    return result.data;
  }
  
  // Option 2: Express API Server
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  
  const response = await fetch(`${API_BASE_URL}/api/feed/personalized`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add authentication headers if needed
      // 'Authorization': `Bearer ${await getAuthToken()}`
    },
    body: JSON.stringify({
      userId,
      limit,
      cursor,
      includeDebug
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Hook for feed statistics and analytics
 */
export function useFeedAnalytics(userId: string) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const feed = await fetchPersonalizedFeed({
        userId,
        limit: 100, // Get more for analytics
        includeDebug: true
      });
      
      setAnalytics({
        totalPosts: feed.totalProcessed,
        averageScore: feed.debugInfo?.averageScore || 0,
        followBasedCount: feed.debugInfo?.followBasedCount || 0,
        topicBasedCount: feed.debugInfo?.topicBasedCount || 0,
        locationBasedCount: feed.debugInfo?.locationBasedCount || 0,
        topTopics: extractTopTopics(feed.posts),
        topLocations: extractTopLocations(feed.posts)
      });
    } catch (error) {
      console.error('Failed to load feed analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    analytics,
    loading,
    loadAnalytics
  };
}

/**
 * Helper functions for analytics
 */
function extractTopTopics(posts: any[]): { topic: string; count: number }[] {
  const topicCounts = new Map<string, number>();
  
  posts.forEach(post => {
    post.topics?.forEach((topic: string) => {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });
  });
  
  return Array.from(topicCounts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function extractTopLocations(posts: any[]): { location: string; count: number }[] {
  const locationCounts = new Map<string, number>();
  
  posts.forEach(post => {
    if (post.location?.name) {
      const location = post.location.name;
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
    }
  });
  
  return Array.from(locationCounts.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}