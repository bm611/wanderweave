import { createClient } from '@supabase/supabase-js';
import { StoryboardData, TripDetails, SavedStory } from '../types';

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
  thumbnailDataUrl: string
): Promise<SavedStory | null> => {
  if (!isSupabaseConfigured()) return null;

  let thumbnailUrl = thumbnailDataUrl;

  // Upload thumbnail to storage if it's a data URL
  if (thumbnailDataUrl.startsWith('data:')) {
    const fileName = `${userId}/${Date.now()}.jpg`;
    const base64Data = thumbnailDataUrl.split(',')[1];
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('story-thumbnails')
      .upload(fileName, decode(base64Data), {
        contentType: 'image/jpeg',
      });

    if (!uploadError && uploadData) {
      // Store the file path, not public URL (bucket is private)
      thumbnailUrl = fileName;
    }
  }

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: userId,
      title: storyData.title,
      summary: storyData.summary,
      destination: tripDetails.destination,
      dates: tripDetails.dates,
      theme_color: storyData.themeColor,
      thumbnail_url: thumbnailUrl,
      story_data: storyData,
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

  // Generate signed URLs for thumbnails (private bucket)
  const storiesWithSignedUrls = await Promise.all(
    data.map(async (dbStory) => {
      const story = mapDbStoryToSavedStory(dbStory);
      
      // If thumbnail is a storage path (not a data URL), generate signed URL
      if (story.thumbnailUrl && !story.thumbnailUrl.startsWith('data:') && !story.thumbnailUrl.startsWith('http')) {
        const { data: signedUrlData } = await supabase.storage
          .from('story-thumbnails')
          .createSignedUrl(story.thumbnailUrl, 3600); // 1 hour expiry
        
        if (signedUrlData?.signedUrl) {
          story.thumbnailUrl = signedUrlData.signedUrl;
        }
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
