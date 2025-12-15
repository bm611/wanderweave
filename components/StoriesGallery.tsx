import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserStories, deleteStory } from '../services/supabase';
import { SavedStory, StoryboardData, TripMemoryInput } from '../types';
import { StoryCard } from './StoryCard';
import { StoryTimeline } from './StoryTimeline';
import { Plus, Compass, Loader2, LayoutGrid, History } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

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
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 space-y-10">
        {/* Modernized Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-teal-200 via-cyan-200 to-sky-200 shadow-[0_24px_80px_rgba(14,165,233,0.15)] dark:from-teal-900 dark:via-cyan-900 dark:to-sky-900 dark:shadow-[0_24px_80px_rgba(14,165,233,0.3)]">
           <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl mix-blend-overlay dark:bg-black/20" />
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl dark:bg-cyan-600/20" />
           <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl dark:bg-teal-600/20" />
           
          <div className="relative grid md:grid-cols-3 gap-8 items-center px-8 sm:px-12 py-16">
            <div className="md:col-span-2 space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border border-white/50 text-teal-900 text-xs font-bold tracking-wide uppercase shadow-sm backdrop-blur-md dark:bg-black/30 dark:border-white/20 dark:text-teal-100">
                Your Memories, Reimagined
              </span>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight text-slate-800 tracking-tight dark:text-slate-100">
                Upload your trip photos and <br className="hidden sm:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">
                  get a vivid travel story.
                </span>
              </h1>
              <div className="flex flex-wrap gap-4 items-center pt-2">
                <button
                  onClick={onCreateNew}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-semibold shadow-xl shadow-slate-900/20 hover:scale-[1.02] hover:bg-slate-800 transition-all duration-300"
                >
                  <Plus size={18} className="text-teal-300 group-hover:rotate-90 transition-transform duration-500" />
                  Compose a story
                </button>
              </div>
            </div>
          </div>
        </div>

        {user && stories.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 dark:bg-slate-700 dark:border-slate-600">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-slate-100' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-600/50'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid size={16} />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'timeline' 
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-slate-100' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-600/50'
                  }`}
                  title="Timeline view"
                >
                  <History size={16} />
                  Timeline
                </button>
              </div>
            </div>
          </div>
        )}

        {!isConfigured && (
          <div className="bg-white/80 border border-amber-200/70 rounded-2xl p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:bg-amber-900/20 dark:border-amber-800/50">
            <p className="text-amber-800 text-sm dark:text-amber-200">
              Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable saving stories.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-white/70 border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:bg-slate-800/70 dark:border-slate-700">
            <Loader2 size={32} className="text-teal-600 animate-spin mb-4 dark:text-teal-400" />
            <p className="text-slate-500 dark:text-slate-400">Loading your stories...</p>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-white/80 border-2 border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:bg-slate-800/80 dark:border-slate-700">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner dark:from-teal-800 dark:to-cyan-800">
              <Compass size={40} className="text-teal-700 dark:text-teal-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2 dark:text-slate-100">
              Sign in to save stories
            </h2>
            <p className="text-slate-500 max-w-md mb-6 dark:text-slate-300">
              Create an account to save your travel stories and access them anytime.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={onSignIn}
                className="px-6 py-3 bg-teal-600 text-white rounded-full font-semibold shadow-md shadow-teal-400/25 hover:-translate-y-0.5 transition-transform dark:bg-teal-500 dark:shadow-teal-500/25"
              >
                Sign In
              </button>
              <button
                onClick={onCreateNew}
                className="px-6 py-3 rounded-full font-semibold border border-slate-200 bg-white hover:-translate-y-0.5 transition-transform shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              >
                Try Without Account
              </button>
            </div>
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-white/80 border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:bg-slate-800/80 dark:border-slate-700">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner dark:from-teal-800 dark:to-cyan-800">
              <Compass size={40} className="text-teal-700 dark:text-teal-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2 dark:text-slate-100">
              No stories yet
            </h2>
            <p className="text-slate-500 max-w-md mb-6 dark:text-slate-300">
              Create your first travel story by uploading photos from your adventures.
            </p>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-full font-semibold shadow-md shadow-teal-400/25 hover:-translate-y-0.5 transition-transform dark:from-teal-500 dark:to-cyan-600"
            >
              <Plus size={20} />
              Create Your First Story
            </button>
          </div>
        ) : viewMode === 'timeline' ? (
          <StoryTimeline stories={stories} onViewStory={onViewStory} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
