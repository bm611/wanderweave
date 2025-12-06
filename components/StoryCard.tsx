import React from 'react';
import { SavedStory } from '../types';
import { MapPin, Calendar, Trash2 } from 'lucide-react';

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
        className="sm:hidden group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 flex items-center gap-3 p-3"
      >
        <div className="w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden">
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
              <span className="text-white/80 text-xl font-serif">
                {story.destination.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-sm text-slate-700 mb-1">
            <MapPin size={14} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{story.destination}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Calendar size={14} className="text-slate-400 flex-shrink-0" />
            <span>{story.dates}</span>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Desktop Layout */}
      <div
        onClick={onClick}
        className="hidden sm:block group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100"
      >
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-50 text-slate-500 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-serif font-bold text-lg text-slate-800 mb-1 line-clamp-1">
            {story.title}
          </h3>
          
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {story.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {story.dates}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
            {story.summary}
          </p>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: story.themeColor || '#0d9488' }}
        />
      </div>
    </>
  );
};
