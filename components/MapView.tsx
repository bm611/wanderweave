import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SavedStory } from '../types';
import { geocodeDestination, GeocodingResult } from '../services/geocoding';
import { MapPin, Calendar } from 'lucide-react';

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface StoryWithCoords extends SavedStory {
  coords: GeocodingResult;
}

interface MapViewProps {
  stories: SavedStory[];
  onViewStory: (story: SavedStory) => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDate = (story: SavedStory): string => {
  if (story.year && story.month) {
    return `${MONTH_NAMES[story.month - 1]} ${story.year}`;
  }
  if (story.year) {
    return `${story.year}`;
  }
  return story.dates || '';
};

export const MapView: React.FC<MapViewProps> = ({ stories, onViewStory }) => {
  const [storiesWithCoords, setStoriesWithCoords] = useState<StoryWithCoords[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const geocodeStories = async () => {
      setIsLoading(true);
      const results: StoryWithCoords[] = [];

      for (const story of stories) {
        const coords = await geocodeDestination(story.destination);
        if (coords) {
          results.push({ ...story, coords });
        }
        // Small delay to respect Nominatim rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setStoriesWithCoords(results);
      setIsLoading(false);
    };

    geocodeStories();
  }, [stories]);

  if (isLoading && storiesWithCoords.length === 0) {
    return (
      <div className="h-[500px] rounded-xl bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Loading map...</p>
        </div>
      </div>
    );
  }

  const defaultCenter: [number, number] = storiesWithCoords.length > 0
    ? [storiesWithCoords[0].coords.lat, storiesWithCoords[0].coords.lon]
    : [20, 0];

  return (
    <div className="h-[500px] rounded-3xl overflow-hidden bg-white/60 backdrop-blur">
      <MapContainer
        center={defaultCenter}
        zoom={storiesWithCoords.length === 1 ? 6 : 2}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {storiesWithCoords.map((story) => (
          <Marker key={story.id} position={[story.coords.lat, story.coords.lon]}>
            <Popup>
              <div
                className="cursor-pointer min-w-[200px]"
                onClick={() => onViewStory(story)}
              >
                {story.thumbnailUrl && (
                  <img
                    src={story.thumbnailUrl}
                    alt={story.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-semibold text-slate-800 mb-1">{story.title}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                  <MapPin size={12} />
                  <span>{story.destination}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={12} />
                  <span>{formatDate(story)}</span>
                </div>
                <p className="text-xs text-teal-600 mt-2">Click to view story</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
