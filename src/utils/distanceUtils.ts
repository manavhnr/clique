/**
 * Distance calculation utilities for event location features
 * Uses Haversine formula for accurate geographic distance measurement
 */

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates distance between two geographic points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance to a readable string
 * @param distanceKm Distance in kilometers
 * @returns Formatted distance string (e.g., "2.5 km", "150 m")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Calculates distance between user location and event location
 * @param userLat User's latitude
 * @param userLng User's longitude
 * @param eventCoordinates Event's coordinates (optional)
 * @returns Distance in kilometers or null if coordinates unavailable
 */
export function calculateEventDistance(
  userLat: number,
  userLng: number,
  eventCoordinates?: { lat: number; lng: number }
): number | null {
  console.log('🔢 calculateEventDistance called:', { 
    userLat, 
    userLng, 
    eventCoordinates,
    hasCoords: !!eventCoordinates 
  });
  
  if (!eventCoordinates) {
    console.log('❌ No event coordinates provided');
    return null;
  }
  
  if (typeof eventCoordinates.lat !== 'number' || typeof eventCoordinates.lng !== 'number') {
    console.log('❌ Invalid coordinate types:', typeof eventCoordinates.lat, typeof eventCoordinates.lng);
    return null;
  }
  
  const distance = calculateDistance(
    userLat,
    userLng,
    eventCoordinates.lat,
    eventCoordinates.lng
  );
  
  console.log('✅ Distance calculated:', distance, 'km');
  return distance;
}