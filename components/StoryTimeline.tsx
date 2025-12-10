import React from 'react';
import { SavedStory } from '../types';
import { Calendar, MapPin, ArrowRight, Circle } from 'lucide-react';

interface StoryTimelineProps {
  stories: SavedStory[];
  onViewStory: (story: SavedStory) => void;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatDate = (story: SavedStory): string => {
  if (story.year && story.month) {
    return `${MONTH_NAMES[story.month - 1]} ${story.year}`;
  }
  if (story.year) {
    return `${story.year}`;
  }
  return story.dates || 'Unknown Date';
};

export const StoryTimeline: React.FC<StoryTimelineProps> = ({ stories, onViewStory }) => {
  // Sort stories by date (newest first for top-down timeline)
  // We'll use a simple heuristic: year > month. If no date, put at the end.
  const sortedStories = [...stories].sort((a, b) => {
    const yearA = a.year || 0;
    const yearB = b.year || 0;
    if (yearA !== yearB) return yearB - yearA; // Newest year first
    
    const monthA = a.month || 0;
    const monthB = b.month || 0;
    return monthB - monthA; // Newest month first
  });

  return (
    <div className="relative max-w-4xl mx-auto py-12 px-0 sm:px-4">
      {/* Central Line (Desktop) / Left Line (Mobile) */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-200 via-cyan-200 to-slate-200" />

      <div className="space-y-8 md:space-y-12">
        {sortedStories.map((story, index) => {
          const isEven = index % 2 === 0;
          return (
            <div key={story.id} className={`relative flex flex-col md:flex-row items-start md:items-center ${isEven ? '' : 'md:flex-row-reverse'}`}>
              
              {/* Timeline Node */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-6 md:top-1/2 md:-translate-y-1/2 w-4 h-4 bg-white border-[3px] border-teal-500 rounded-full z-10 shadow-[0_0_0_4px_rgba(20,184,166,0.2)]" />

              {/* Date Marker (Opposite side on desktop) */}
              <div className={`hidden md:block md:w-1/2 ${isEven ? 'md:pr-16 text-right' : 'md:pl-16 text-left'}`}>
                <span className="inline-block py-1 px-3 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold border border-teal-100">
                  {formatDate(story)}
                </span>
              </div>

              {/* Content Card */}
              <div className={`pl-12 md:pl-0 w-full md:w-1/2 group ${isEven ? 'md:pl-16' : 'md:pr-16'}`}>
                <div 
                  onClick={() => onViewStory(story)}
                  className={`
                    relative bg-white rounded-2xl p-4 shadow-sm border border-slate-100
                    transition-all duration-300 cursor-pointer
                    hover:-translate-y-1 hover:shadow-lg hover:border-teal-200/60
                    ${isEven ? 'md:mr-auto' : 'md:ml-auto'}
                  `}
                >
                  {/* Connector Line (Mobile only) */}
                  <div className="md:hidden absolute top-8 -left-6 w-6 h-0.5 bg-teal-200" />
                  
                  {/* Mobile Date Badge */}
                  <div className="md:hidden mb-3">
                    <span className="inline-block py-0.5 px-2 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-100">
                      {formatDate(story)}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                      <img 
                        src={story.thumbnailUrl} 
                        alt={story.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-serif font-bold text-slate-800 mb-1 truncate group-hover:text-teal-700 transition-colors">
                        {story.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
                        <MapPin size={14} className="text-teal-500 shrink-0" />
                        <span className="truncate">{story.destination}</span>
                      </div>
                      
                      <div className="flex items-center text-teal-600 text-sm font-medium opacity-100 md:opacity-0 md:-translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all duration-300">
                        View Story <ArrowRight size={14} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* End of Timeline */}
        <div className="relative flex items-center justify-start md:justify-center pt-8 pb-4">
           <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-300 rounded-full" />
           <p className="ml-12 md:ml-0 text-slate-400 text-sm italic">The journey continues...</p>
        </div>
      </div>
    </div>
  );
};
