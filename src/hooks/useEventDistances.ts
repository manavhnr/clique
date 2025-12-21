/**
 * Hook for calculating distances to events from user's location
 * Provides real-time distance calculation with caching and error handling
 */

import { useMemo } from 'react';
import { EventData } from '../services/eventsService';
import { useLocation } from './useLocation';
import { calculateEventDistance, formatDistance } from '../utils/distanceUtils';

interface EventWithDistance extends EventData {
  distance?: {
    km: number | null;
    formatted: string;
  };
}

interface UseEventDistancesReturn {
  eventsWithDistances: EventWithDistance[];
  locationLoading: boolean;
  locationError: string | null;
  refreshLocation: () => Promise<void>;
  latitude: number | null;
  longitude: number | null;
}

export function useEventDistances(events: EventData[]): UseEventDistancesReturn {
  const { latitude, longitude, loading, error, refreshLocation } = useLocation();

  // Calculate distances for all events
  const eventsWithDistances = useMemo<EventWithDistance[]>(() => {
    console.log('🧭 Distance calculation - User location:', { latitude, longitude });
    console.log('📍 Events to process:', events.length);
    
    if (!latitude || !longitude) {
      console.log('❌ No user location available for distance calculation');
      // Return events with fallback distance display
      return events.map(event => ({
        ...event,
        distance: {
          km: null,
          formatted: error ? 'Location permission needed' : 'Getting location...'
        }
      }));
    }

    return events.map(event => {
      console.log('📍 Processing event:', event.title, 'coordinates:', event.location.coordinates);
      
      const distanceKm = calculateEventDistance(
        latitude,
        longitude,
        event.location.coordinates
      );

      let formatted: string;
      if (distanceKm === null) {
        formatted = 'No event location';
        console.log('❌ No coordinates for event:', event.title);
      } else {
        formatted = formatDistance(distanceKm);
        console.log('✅ Distance calculated:', event.title, '→', formatted);
      }

      return {
        ...event,
        distance: {
          km: distanceKm,
          formatted
        }
      };
    });
  }, [events, latitude, longitude, error]);

  return {
    eventsWithDistances,
    locationLoading: loading,
    locationError: error,
    refreshLocation,
    latitude,
    longitude,
  };
}