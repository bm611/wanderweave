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
}

export interface StoryboardData {
  title: string;
  summary: string;
  themeColor: string;
  segments: StorySegment[];
  weatherImageUrl?: string;
}

export enum AppState {
  INPUT = 'INPUT',
  PROCESSING = 'PROCESSING',
  STORYBOARD = 'STORYBOARD',
  ERROR = 'ERROR'
}