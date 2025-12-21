import { useState, useEffect, useCallback } from 'react';
import { eventsService } from '../services/eventsService';
import { EventPost } from '../types/events';

interface UseEventFeedResult {
  posts: EventPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
}

export function useEventFeed(userId?: string): UseEventFeedResult {
  const [posts, setPosts] = useState<EventPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastCursor, setLastCursor] = useState<string | undefined>();

  const loadFeed = useCallback(async (reset = false) => {
    try {
      setError(null);
      if (reset) {
        setLoading(true);
        setPosts([]);
        setLastCursor(undefined);
      }

      const result = await eventsService.getEventFeedForHome(
        userId,
        reset ? undefined : lastCursor,
        20
      );

      if (reset) {
        setPosts(result.posts);
      } else {
        setPosts(prev => [...prev, ...result.posts]);
      }

      setHasMore(result.hasMore);
      setLastCursor(result.nextCursor);

    } catch (err) {
      console.error('Error loading event feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, lastCursor]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed(true);
  }, [loadFeed]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || refreshing) return;
    await loadFeed(false);
  }, [hasMore, loading, refreshing, loadFeed]);

  const toggleLike = useCallback(async (postId: string) => {
    if (!userId) return;

    try {
      // Optimistic update
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const isLiked = post.interactions.likedBy.includes(userId);
          return {
            ...post,
            stats: {
              ...post.stats,
              likes: isLiked ? post.stats.likes - 1 : post.stats.likes + 1
            },
            interactions: {
              ...post.interactions,
              likedBy: isLiked 
                ? post.interactions.likedBy.filter(id => id !== userId)
                : [...post.interactions.likedBy, userId]
            }
          };
        }
        return post;
      }));

      // Actual API call
      await eventsService.togglePostLike(postId, userId);
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert optimistic update
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const isLiked = post.interactions.likedBy.includes(userId);
          return {
            ...post,
            stats: {
              ...post.stats,
              likes: isLiked ? post.stats.likes - 1 : post.stats.likes + 1
            },
            interactions: {
              ...post.interactions,
              likedBy: isLiked 
                ? post.interactions.likedBy.filter(id => id !== userId)
                : [...post.interactions.likedBy, userId]
            }
          };
        }
        return post;
      }));
    }
  }, [userId]);

  useEffect(() => {
    loadFeed(true);
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    refreshing,
    refresh,
    loadMore,
    toggleLike
  };
}