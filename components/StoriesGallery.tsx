import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserStories, deleteStory } from '../services/supabase';
import { SavedStory, StoryboardData, TripMemoryInput } from '../types';
import { StoryCard } from './StoryCard';
import { MapView } from './MapView';
import { Plus, Compass, Loader2, LayoutGrid, Map, User } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f766e] via-[#0ea5e9] to-[#38bdf8] text-white shadow-[0_24px_80px_rgba(14,165,233,0.35)]">
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.32),transparent_36%),radial-gradient(circle_at_82%_6%,rgba(255,255,255,0.24),transparent_34%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(15,118,110,0.45),transparent_40%)] opacity-70" />
          <div className="relative grid md:grid-cols-3 gap-8 items-center px-6 sm:px-10 py-10">
            <div className="md:col-span-2 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-sm font-semibold backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-white" />
                Upload. Weave. Relive.
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
                Upload your trip photos and get a vivid travel story.
              </h1>
              <div className="h-1 w-16 rounded-full bg-white/60" />
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={onCreateNew}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-teal-800 font-semibold shadow-lg shadow-cyan-500/30 hover:-translate-y-0.5 transition-transform"
                >
                  <Plus size={18} />
                  Compose a story
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {stories.length > 0 && (
              <div className="flex bg-white border border-slate-200/70 rounded-full p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm shadow-cyan-500/25' : 'text-slate-600 hover:text-teal-700'}`}
                  title="Grid view"
                >
                  <LayoutGrid size={16} />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${viewMode === 'map' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm shadow-cyan-500/25' : 'text-slate-600 hover:text-teal-700'}`}
                  title="Map view"
                >
                  <Map size={16} />
                  Map
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-teal-800 font-semibold border border-teal-100 shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-transform"
            >
              <Plus size={18} />
              Start a new story
            </button>
            {!user && (
              <button
                onClick={onSignIn}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-600 text-white font-semibold shadow-md shadow-teal-400/25 hover:-translate-y-0.5 transition-transform"
              >
                <User size={18} />
                Sign in
              </button>
            )}
          </div>
        </div>

        {!isConfigured && (
          <div className="bg-white/80 border border-amber-200/70 rounded-2xl p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-amber-800 text-sm">
              Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable saving stories.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-white/70 border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <Loader2 size={32} className="text-teal-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading your stories...</p>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-white/80 border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <Compass size={40} className="text-teal-700" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
              Sign in to save stories
            </h2>
            <p className="text-slate-500 max-w-md mb-6">
              Create an account to save your travel stories and access them anytime.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={onSignIn}
                className="px-6 py-3 bg-teal-600 text-white rounded-full font-semibold shadow-md shadow-teal-400/25 hover:-translate-y-0.5 transition-transform"
              >
                Sign In
              </button>
              <button
                onClick={onCreateNew}
                className="px-6 py-3 rounded-full font-semibold border border-slate-200 bg-white hover:-translate-y-0.5 transition-transform shadow-sm"
              >
                Try Without Account
              </button>
            </div>
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-white/80 border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <Compass size={40} className="text-teal-700" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
              No stories yet
            </h2>
            <p className="text-slate-500 max-w-md mb-6">
              Create your first travel story by uploading photos from your adventures.
            </p>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-full font-semibold shadow-md shadow-teal-400/25 hover:-translate-y-0.5 transition-transform"
            >
              <Plus size={20} />
              Create Your First Story
            </button>
          </div>
        ) : viewMode === 'map' ? (
          <div className="rounded-3xl border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] overflow-hidden">
            <MapView stories={stories} onViewStory={onViewStory} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
