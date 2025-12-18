import React from 'react';
import { SavedStory } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, Location01Icon, Calendar01Icon } from '@hugeicons/core-free-icons';

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
    <div
      onClick={onClick}
      className="group relative bg-white rounded-[2rem] p-4 shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer dark:bg-slate-800"
    >
      {/* Delete Button - Top Right (Hover only) */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 z-10 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 text-slate-400 hover:text-red-50 shadow-sm transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 dark:bg-slate-700/90 dark:text-slate-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
      >
        <HugeiconsIcon icon={Delete02Icon} size={16} />
      </button>

      {/* Image Container with specific radii */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-[20px] shadow-inner bg-slate-100 relative dark:bg-slate-700">
        {story.thumbnailUrl ? (
          <img
            src={story.thumbnailUrl}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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

        {/* Subtle border ring */}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[20px]" />
      </div>

      {/* Info Section (Replacing Title) */}
      <div className="mt-5 mb-2 px-2 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium dark:text-slate-200">
          <HugeiconsIcon icon={Location01Icon} size={16} className="text-teal-500 shrink-0 dark:text-teal-400" />
          <span className="truncate max-w-[120px] sm:max-w-[200px]">{story.destination}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-sm dark:text-slate-400">
          <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-slate-400 shrink-0 dark:text-slate-500" />
          <span>{formatDate(story)}</span>
        </div>
      </div>
    </div>
  );
};
