/**
 * Location service hook for getting user's current position
 * Handles permissions, caching, and error states
 */

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
}

interface UseLocationReturn extends LocationState {
  refreshLocation: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
    permissionGranted: false,
  });

  // Request location permission
  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      
      setLocation(prev => ({
        ...prev,
        permissionGranted: granted,
        error: granted ? null : 'Location permission denied'
      }));
      
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocation(prev => ({
        ...prev,
        error: 'Failed to request location permission'
      }));
      return false;
    }
  };

  // Get current location
  const refreshLocation = async (): Promise<void> => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Check permission first
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: 'Location permission required for distance calculation'
          }));
          return;
        }
      }

      // Get current position with timeout and accuracy settings
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 seconds timeout
      });

      console.log('✅ Location obtained:', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
      
      setLocation(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        loading: false,
        error: null,
        permissionGranted: true,
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      
      let errorMessage = 'Failed to get current location';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Location request timed out';
        } else if (error.message.includes('denied')) {
          errorMessage = 'Location permission denied';
        }
      }
      
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  // Auto-request location on mount
  useEffect(() => {
    console.log('🌍 Location hook mounted, requesting location...');
    refreshLocation();
  }, []);

  return {
    ...location,
    refreshLocation,
    requestPermission,
  };
}