import React from 'react';
import { StoryboardData, StorySegment, TripMemoryInput, TripDetails } from '../types';
import { MapPin, Clock, ArrowLeft, Calendar, Users } from 'lucide-react';

interface StoryboardViewerProps {
  data: StoryboardData;
  originalMemories: TripMemoryInput[];
  tripDetails: TripDetails;
  onReset: () => void;
}

export const StoryboardViewer: React.FC<StoryboardViewerProps> = ({ data, originalMemories, tripDetails, onReset }) => {
  // Map original images to segments based on memoryId
  // Use stored imageUrl if available (for saved stories), otherwise use original previewUrl
  const enrichedSegments = data.segments.map(segment => {
    if (segment.imageUrl) {
      return segment; // Already has stored image URL
    }
    const original = originalMemories.find(m => m.id === segment.memoryId);
    return {
      ...segment,
      imageUrl: original?.previewUrl || ''
    };
  });

  return (
    <div className="min-h-screen bg-stone-50 animate-fade-in relative">
      {/* Floating Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
        <button 
          onClick={onReset}
          className="pointer-events-auto flex items-center gap-2 bg-white/80 backdrop-blur-md text-stone-800 px-4 py-2 rounded-full shadow-sm hover:bg-white transition-all text-sm font-medium border border-stone-200/50"
        >
          <ArrowLeft size={16} />
          <span>New Trip</span>
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Generated Weather Card - Shows if available */}
          {data.weatherImageUrl && (
            <div className="flex justify-center mb-10 animate-slide-up">
              <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-4 border-white max-w-sm w-full aspect-square bg-stone-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src={data.weatherImageUrl} 
                  alt="Generated Weather Card" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
              </div>
            </div>
          )}

          {/* Fallback or Complementary Header Info */}
          {!data.weatherImageUrl && (
            <div className="flex justify-center gap-2 mb-8 animate-slide-up">
               <div 
                  className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full bg-white border shadow-sm"
                  style={{ color: data.themeColor, borderColor: `${data.themeColor}30` }}
                >
                  <Calendar size={12} />
                  {tripDetails.dates}
               </div>
               {tripDetails.companions && (
                 <div 
                    className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full bg-white border shadow-sm text-slate-500"
                  >
                    <Users size={12} />
                    {tripDetails.companions}
                </div>
               )}
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-serif font-medium text-stone-900 mb-6 leading-tight animate-slide-up" style={{ animationDelay: '100ms' }}>
            {data.title}
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-stone-500 font-medium mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
             <MapPin size={16} className="text-stone-400" />
             <span className="uppercase tracking-wide text-sm">{tripDetails.destination}</span>
          </div>


        </div>
        
        {/* Decorative background element */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full opacity-5 pointer-events-none blur-3xl"
          style={{ background: `radial-gradient(circle, ${data.themeColor} 0%, transparent 70%)` }}
        />
      </header>

      {/* Timeline Story */}
      <div className="max-w-4xl mx-auto px-4 pb-32">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-stone-200 transform md:-translate-x-1/2" />

          {enrichedSegments.map((segment, index) => {
            const isEven = index % 2 === 0;
            return (
              <div 
                key={segment.memoryId} 
                className={`relative flex flex-col md:flex-row gap-8 mb-24 ${isEven ? '' : 'md:flex-row-reverse'} animate-slide-up`}
                style={{ animationDelay: `${400 + (index * 100)}ms` }}
              >
                {/* Timeline Dot */}
                <div 
                  className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 mt-8 z-10 transition-transform hover:scale-125 duration-300"
                  style={{ backgroundColor: segment.moodColor }}
                />

                {/* Content Card - Image Side */}
                <div className="flex-1 pl-16 md:pl-0">
                  <div className="relative group overflow-hidden rounded-2xl shadow-lg transition-transform duration-700 hover:scale-[1.01]">
                    <div className="aspect-[4/3] bg-stone-200">
                      <img 
                        src={segment.imageUrl} 
                        alt={segment.caption} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <p className="text-white font-medium">{segment.caption}</p>
                    </div>
                  </div>
                  
                  {/* Mobile Only Meta (Shown below image on mobile) */}
                  <div className="flex flex-wrap gap-2 mt-3 md:hidden">
                     {segment.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-1 bg-white border border-stone-200 rounded-full text-stone-500 uppercase tracking-wide">
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Content Card - Text Side */}
                <div className="flex-1 pl-16 md:pl-0 flex flex-col justify-center">
                  <div className={`space-y-4 ${isEven ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                    
                    <div className={`flex items-center gap-2 text-sm font-semibold tracking-wide ${isEven ? 'md:justify-end' : 'md:justify-start'}`} style={{ color: segment.moodColor }}>
                      <MapPin size={14} />
                      {segment.location}
                    </div>

                    <h2 className="text-2xl font-serif text-stone-800">
                      {segment.caption}
                    </h2>

                    <p className="text-stone-600 leading-relaxed">
                      {segment.narrative}
                    </p>

                    <div className={`hidden md:flex flex-wrap gap-2 pt-2 ${isEven ? 'justify-end' : 'justify-start'}`}>
                      {segment.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-1 bg-white border border-stone-200 rounded-full text-stone-500 uppercase tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {segment.estimatedTimeOfDay && (
                       <div className={`flex items-center gap-1.5 text-xs text-stone-400 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                         <Clock size={12} />
                         {segment.estimatedTimeOfDay}
                       </div>
                    )}

                  </div>
                </div>

              </div>
            );
          })}
          
          {/* End Node */}
          <div className="absolute left-8 md:left-1/2 bottom-0 w-3 h-3 bg-stone-300 rounded-full transform -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="text-center mt-20">
          <p className="font-serif italic text-stone-400 text-lg">Fin.</p>
        </div>
      </div>
    </div>
  );
};