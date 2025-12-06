import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserStories, deleteStory } from '../services/supabase';
import { SavedStory, StoryboardData, TripMemoryInput } from '../types';
import { StoryCard } from './StoryCard';
import { Plus, Compass, Loader2 } from 'lucide-react';

interface StoriesGalleryProps {
  onCreateNew: () => void;
  onViewStory: (story: SavedStory) => void;
  onSignIn: () => void;
}

export const StoriesGallery: React.FC<StoriesGalleryProps> = ({
  onCreateNew,
  onViewStory,
  onSignIn,
}) => {
  const { user, isConfigured } = useAuth();
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStories();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadStories = async () => {
    if (!user) return;
    setIsLoading(true);
    const userStories = await getUserStories(user.id);
    setStories(userStories);
    setIsLoading(false);
  };

  const handleDelete = async (storyId: string) => {
    const success = await deleteStory(storyId);
    if (success) {
      setStories(stories.filter(s => s.id !== storyId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800">Your Stories</h1>
            <p className="text-slate-500 mt-1">
              {stories.length > 0
                ? `${stories.length} travel ${stories.length === 1 ? 'story' : 'stories'} saved`
                : 'Start creating your travel memories'}
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-3 sm:px-5 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Story</span>
          </button>
        </div>

        {!isConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <p className="text-amber-800 text-sm">
              Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable saving stories.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="text-teal-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading your stories...</p>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
              <Compass size={40} className="text-teal-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">
              Sign in to save stories
            </h2>
            <p className="text-slate-500 max-w-md mb-6">
              Create an account to save your travel stories and access them anytime.
            </p>
            <div className="flex gap-4">
              <button
                onClick={onSignIn}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onCreateNew}
                className="px-6 py-3 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Try Without Account
              </button>
            </div>
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
              <Compass size={40} className="text-teal-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">
              No stories yet
            </h2>
            <p className="text-slate-500 max-w-md mb-6">
              Create your first travel story by uploading photos from your adventures.
            </p>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              <Plus size={20} />
              Create Your First Story
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={() => onViewStory(story)}
                onDelete={() => handleDelete(story.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
