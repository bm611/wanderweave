export interface TripMemoryInput {
  id: string;
  file: File;
  previewUrl: string;
  location: string;
  notes: string;
}

export interface TripDetails {
  destination: string;
  dates: string;
  parsedYear?: number | null;
  parsedMonth?: number | null;
  companions: string;
}

export interface StorySegment {
  memoryId: string; // Links back to input
  location: string;
  caption: string;
  narrative: string;
  moodColor: string; // Hex code
  tags: string[];
  estimatedTimeOfDay?: string;
  imageUrl?: string; // Stored image URL (from Supabase storage)
}

export interface StoryboardData {
  title: string;
  summary: string;
  themeColor: string;
  segments: StorySegment[];
  weatherImageUrl?: string;
}

export enum AppState {
  HOME = 'HOME',
  INPUT = 'INPUT',
  PROCESSING = 'PROCESSING',
  STORYBOARD = 'STORYBOARD',
  ERROR = 'ERROR'
}

export interface SavedStory {
  id: string;
  userId: string;
  title: string;
  summary: string;
  destination: string;
  dates: string;
  year?: number | null;
  month?: number | null;
  themeColor: string;
  thumbnailUrl: string;
  storyData: StoryboardData;
  createdAt: string;
}