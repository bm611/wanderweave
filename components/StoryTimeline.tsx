import React, { useMemo, useEffect, useState } from 'react';
import { SavedStory } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, ArrowRight01Icon, Calendar01Icon } from '@hugeicons/core-free-icons';

interface StoryTimelineProps {
  stories: SavedStory[];
  onViewStory: (story: SavedStory) => void;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface GroupedStories {
  year: number;
  months: {
    monthIndex: number; // 0-11
    stories: SavedStory[];
  }[];
}

export const StoryTimeline: React.FC<StoryTimelineProps> = ({ stories, onViewStory }) => {
  const [activeYear, setActiveYear] = useState<number | null>(null);

  // Group stories by Year -> Month
  const groupedStories = useMemo(() => {
    const groups: Record<number, Record<number, SavedStory[]>> = {};
    const noDateStories: SavedStory[] = [];

    stories.forEach(story => {
      if (story.year) {
        if (!groups[story.year]) {
          groups[story.year] = {};
        }
        // If month is missing, maybe put it in a "generic" month bucket or just 0?
        // Let's assume 0 (January) or special handling if month is optional/missing.
        // The type definition says 'month' is number. Let's default to 0 if undefined for sorting.
        // Actually, let's treat "no month" as a separate category if needed, but for simplicity let's put them at the end or beginning.
        // Let's assume month is 1-12 based on previous code (month - 1). If 0 or undefined, handle gracefully.
        const mIndex = story.month ? story.month - 1 : -1;

        if (!groups[story.year][mIndex]) {
          groups[story.year][mIndex] = [];
        }
        groups[story.year][mIndex].push(story);
      } else {
        noDateStories.push(story);
      }
    });

    // Convert to sorted array
    const sortedYears = Object.keys(groups).map(Number).sort((a, b) => b - a);

    const result: GroupedStories[] = sortedYears.map(year => {
      const monthsObj = groups[year];
      // Sort months descending (Dec -> Jan)
      const sortedMonths = Object.keys(monthsObj).map(Number).sort((a, b) => b - a);

      return {
        year,
        months: sortedMonths.map(mIndex => ({
          monthIndex: mIndex,
          stories: monthsObj[mIndex]
        }))
      };
    });

    // If there are stories with no date, we could add them as a "Unknown Date" group or similar.
    // For now, let's append them to a "Unknown" year if existing, or handle them separately.
    if (noDateStories.length > 0) {
      result.push({
        year: 0, // 0 represents "Unknown/Undated"
        months: [{ monthIndex: -1, stories: noDateStories }]
      });
    }

    return result;
  }, [stories]);

  useEffect(() => {
    if (groupedStories.length > 0) {
      setActiveYear(groupedStories[0].year);
    }

    // Simple intersection observer to update active year on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const year = Number(entry.target.getAttribute('data-year'));
          setActiveYear(year);
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px' });

    document.querySelectorAll('section[data-year]').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [groupedStories]);

  const scrollToYear = (year: number) => {
    const el = document.querySelector(`section[data-year="${year}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-16 max-w-5xl mx-auto py-8">

      {/* Sticky Sidebar (Desktop) */}
      <aside className="hidden md:block w-48 shrink-0">
        <div className="sticky top-24 space-y-8">
          <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700">
            {groupedStories.map(group => (
              <div key={group.year} className="relative mb-6 last:mb-0">
                <button
                  onClick={() => scrollToYear(group.year)}
                  className={`text-2xl font-bold font-serif transition-colors duration-300 block text-left ${activeYear === group.year
                      ? 'text-teal-600 dark:text-teal-400 scale-105 origin-left'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                    }`}
                >
                  {group.year === 0 ? 'Undated' : group.year}
                </button>

                {/* Active Indicator Dot */}
                {activeYear === group.year && (
                  <div className="absolute -left-[21px] top-2.5 w-3 h-3 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900 transition-all duration-300" />
                )}

                {/* Sub-list of months for active year (optional, can be nice) */}
                <div className={`mt-2 ml-1 space-y-1 transition-all duration-500 ${activeYear === group.year ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  {group.months.map(m => (
                    <div key={m.monthIndex} className="text-sm font-medium text-slate-400 dark:text-slate-500">
                      {m.monthIndex >= 0 ? MONTH_NAMES[m.monthIndex] : 'Stories'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-16">
        {groupedStories.map(group => (
          <section key={group.year} data-year={group.year} className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Mobile Header */}
            <h2 className="md:hidden text-3xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-200 dark:border-slate-700 pb-2">
              {group.year === 0 ? 'Undated' : group.year}
            </h2>

            <div className="space-y-12">
              {group.months.map((monthGroup, idx) => (
                <div key={`${group.year}-${monthGroup.monthIndex}`}>

                  {/* Month Label */}
                  {monthGroup.monthIndex >= 0 && (
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-teal-600 font-bold uppercase tracking-wider text-sm dark:text-teal-400">
                        {MONTH_NAMES[monthGroup.monthIndex]}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-teal-200 to-transparent dark:from-teal-900" />
                    </div>
                  )}

                  <div className="space-y-6">
                    {monthGroup.stories.map(story => (
                      <div
                        key={story.id}
                        onClick={() => onViewStory(story)}
                        className="group relative bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-teal-200/50 dark:hover:border-teal-700/50 transition-all duration-300 cursor-pointer flex gap-5 sm:gap-6 items-start"
                      >
                        {/* Image */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shadow-sm">
                          <img
                            src={story.thumbnailUrl}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 py-1">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                              {story.title}
                            </h3>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-slate-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-teal-500 dark:text-teal-400 shrink-0" />
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm mt-2 mb-3">
                            <HugeiconsIcon icon={Location01Icon} size={14} className="text-teal-500 shrink-0" />
                            <span className="truncate font-medium">{story.destination}</span>
                          </div>

                          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                            {story.summary || "No summary available."}
                          </p>

                          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                            <HugeiconsIcon icon={Calendar01Icon} size={12} />
                            {story.dates}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="h-24 flex items-center justify-center text-slate-300 dark:text-slate-600">
          <div className="w-1.5 h-1.5 rounded-full bg-current mx-1" />
          <div className="w-1.5 h-1.5 rounded-full bg-current mx-1" />
          <div className="w-1.5 h-1.5 rounded-full bg-current mx-1" />
        </div>
      </div>
    </div>
  );
};
