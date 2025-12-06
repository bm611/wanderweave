export interface GeocodingResult {
  lat: number;
  lon: number;
}

const cache = new Map<string, GeocodingResult | null>();

export const geocodeDestination = async (destination: string): Promise<GeocodingResult | null> => {
  if (!destination) return null;
  
  if (cache.has(destination)) {
    return cache.get(destination)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'WanderWeave/1.0'
        }
      }
    );
    const data = await response.json();

    const result = data[0]
      ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      : null;
    
    cache.set(destination, result);
    return result;
  } catch (error) {
    console.error('Geocoding error:', error);
    cache.set(destination, null);
    return null;
  }
};
