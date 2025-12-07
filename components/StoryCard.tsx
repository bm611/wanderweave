import React from 'react';
import { SavedStory } from '../types';
import { MapPin, Calendar, Trash2 } from 'lucide-react';

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

interface StoryCardProps {
  story: SavedStory;
  onClick: () => void;
  onDelete: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onClick, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this story?')) {
      onDelete();
    }
  };

  return (
    <>
      {/* Mobile Layout */}
      <div
        onClick={onClick}
        className="sm:hidden group relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer aspect-[16/10]"
      >
        <div className="absolute inset-0">
          {story.thumbnailUrl ? (
            <img
              src={story.thumbnailUrl}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: story.themeColor || '#0d9488' }}
            >
              <span className="text-white/80 text-4xl font-serif">
                {story.destination.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/35 to-transparent" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_25%_20%,rgba(16,185,129,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_40%)]" />
        </div>

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/85 text-slate-800 text-xs font-medium shadow-sm">
            <MapPin size={12} />
            <span className="truncate max-w-[120px]">{story.destination}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/35 text-white text-xs font-medium backdrop-blur">
            <Calendar size={12} />
            {formatDate(story)}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
          <h3 className="font-serif font-semibold text-white text-lg leading-tight line-clamp-1 drop-shadow-md">
            {story.title}
          </h3>
          <p className="text-sm text-white/85 line-clamp-2 drop-shadow">
            {story.summary}
          </p>
        </div>

        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
        >
          <Trash2 size={16} />
        </button>

        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: story.themeColor || '#0d9488' }}
        />
      </div>

      {/* Desktop Layout */}
      <div
        onClick={onClick}
        className="hidden sm:block group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all duration-500 cursor-pointer hover:-translate-y-1"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.1),transparent_40%)]" />
        <div className="aspect-[4/3] relative overflow-hidden">
          {story.thumbnailUrl ? (
            <img
              src={story.thumbnailUrl}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: story.themeColor || '#0d9488' }}
            >
              <span className="text-white/80 text-4xl font-serif">
                {story.destination.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/85 text-slate-800 text-xs font-medium shadow-sm">
              <MapPin size={12} />
              {story.destination}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 text-white text-xs font-medium backdrop-blur">
              <Calendar size={12} />
              {formatDate(story)}
            </span>
          </div>
          
          <button
            onClick={handleDelete}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-50 text-slate-500 hover:text-red-500 shadow-sm"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="relative p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: story.themeColor || '#0d9488' }} />
              Story capsule
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm">
              {story.year || story.month ? 'Dated' : 'Undated'}
            </span>
          </div>
          <h3 className="font-serif font-bold text-xl text-slate-900 leading-tight line-clamp-1">
            {story.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {story.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(story)}
            </span>
          </div>

          <p className="text-sm text-slate-600 line-clamp-2">
            {story.summary}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500/80 via-cyan-400/80 to-emerald-400/80">
          <div
            className="h-full"
            style={{ backgroundColor: story.themeColor || '#0d9488', opacity: 0.4 }}
          />
        </div>
      </div>
    </>
  );
};
