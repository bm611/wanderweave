import { createClient } from '@supabase/supabase-js';
import { StoryboardData, TripDetails, SavedStory } from '../types';
import { parseDate } from './dateParser';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Auth and storage features will be disabled.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const saveStory = async (
  userId: string,
  storyData: StoryboardData,
  tripDetails: TripDetails,
  imageDataUrls: { memoryId: string; dataUrl: string }[]
): Promise<SavedStory | null> => {
  if (!isSupabaseConfigured()) return null;

  const storyId = Date.now().toString();
  let thumbnailPath = '';
  let weatherImagePath = storyData.weatherImageUrl;

  // Handle Weather/Location Image Upload
  if (storyData.weatherImageUrl?.startsWith('data:image')) {
      const fileName = `${userId}/${storyId}/weather.jpg`;
      const base64Data = storyData.weatherImageUrl.split(',')[1];
      const imageBlob = decode(base64Data);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('story-thumbnails')
        .upload(fileName, imageBlob, {
          contentType: 'image/jpeg',
        });
      
      if (!uploadError && uploadData) {
          weatherImagePath = fileName;
      }
  }

  // Upload all images and update segments with image paths
  const updatedSegments = await Promise.all(
    storyData.segments.map(async (segment, index) => {
      const imageData = imageDataUrls.find(img => img.memoryId === segment.memoryId);
      if (!imageData?.dataUrl) return segment;

      const fileName = `${userId}/${storyId}/${index}.jpg`;
      
      // Handle both data URLs and blob URLs
      let imageBlob: Blob | Uint8Array;
      if (imageData.dataUrl.startsWith('data:')) {
        const base64Data = imageData.dataUrl.split(',')[1];
        imageBlob = decode(base64Data);
      } else if (imageData.dataUrl.startsWith('blob:')) {
        try {
          const response = await fetch(imageData.dataUrl);
          imageBlob = await response.blob();
        } catch {
          return segment;
        }
      } else {
        return segment;
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('story-thumbnails')
        .upload(fileName, imageBlob, {
          contentType: 'image/jpeg',
        });

      if (!uploadError && uploadData) {
        // Use first image as thumbnail
        if (index === 0) {
          thumbnailPath = fileName;
        }
        return { ...segment, imageUrl: fileName };
      }

      return segment;
    })
  );

  const updatedStoryData = { 
    ...storyData, 
    segments: updatedSegments,
    weatherImageUrl: weatherImagePath
  };

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: userId,
      title: storyData.title,
      summary: storyData.summary,
      destination: tripDetails.destination,
      dates: tripDetails.dates,
      year: tripDetails.parsedYear,
      month: tripDetails.parsedMonth,
      theme_color: storyData.themeColor,
      thumbnail_url: thumbnailPath,
      story_data: updatedStoryData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving story:', error);
    throw error;
  }

  return mapDbStoryToSavedStory(data);
};

export const getUserStories = async (userId: string): Promise<SavedStory[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories:', error);
    return [];
  }

  // Generate signed URLs for thumbnails and segment images (private bucket)
  const storiesWithSignedUrls = await Promise.all(
    data.map(async (dbStory) => {
      const story = mapDbStoryToSavedStory(dbStory);
      
      // Backfill year/month if missing (for existing stories)
      if (story.year == null && story.dates) {
        const parsed = parseDate(story.dates);
        story.year = parsed.year;
        story.month = parsed.month;
      }
      
      // Generate signed URL for thumbnail
      if (story.thumbnailUrl && !story.thumbnailUrl.startsWith('data:') && !story.thumbnailUrl.startsWith('http')) {
        const { data: signedUrlData } = await supabase.storage
          .from('story-thumbnails')
          .createSignedUrl(story.thumbnailUrl, 3600);
        
        if (signedUrlData?.signedUrl) {
          story.thumbnailUrl = signedUrlData.signedUrl;
        }
      }

      // Generate signed URLs for all segment images
      if (story.storyData?.segments) {
        // Handle weather image signed URL
        if (story.storyData.weatherImageUrl && !story.storyData.weatherImageUrl.startsWith('data:') && !story.storyData.weatherImageUrl.startsWith('http')) {
          const { data: signedUrlData } = await supabase.storage
            .from('story-thumbnails')
            .createSignedUrl(story.storyData.weatherImageUrl, 3600);
          
          if (signedUrlData?.signedUrl) {
            story.storyData.weatherImageUrl = signedUrlData.signedUrl;
          }
        }

        story.storyData.segments = await Promise.all(
          story.storyData.segments.map(async (segment) => {
            if (segment.imageUrl && !segment.imageUrl.startsWith('data:') && !segment.imageUrl.startsWith('http')) {
              const { data: signedUrlData } = await supabase.storage
                .from('story-thumbnails')
                .createSignedUrl(segment.imageUrl, 3600);
              
              if (signedUrlData?.signedUrl) {
                return { ...segment, imageUrl: signedUrlData.signedUrl };
              }
            }
            return segment;
          })
        );
      }
      
      return story;
    })
  );

  return storiesWithSignedUrls;
};

export const deleteStory = async (storyId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId);

  if (error) {
    console.error('Error deleting story:', error);
    return false;
  }

  return true;
};

const mapDbStoryToSavedStory = (dbStory: any): SavedStory => ({
  id: dbStory.id,
  userId: dbStory.user_id,
  title: dbStory.title,
  summary: dbStory.summary,
  destination: dbStory.destination,
  dates: dbStory.dates,
  year: dbStory.year,
  month: dbStory.month,
  themeColor: dbStory.theme_color,
  thumbnailUrl: dbStory.thumbnail_url,
  storyData: dbStory.story_data,
  createdAt: dbStory.created_at,
});

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
