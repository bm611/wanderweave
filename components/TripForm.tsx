import React, { useState, useRef } from 'react';
import { TripMemoryInput, TripDetails } from '../types';
import { Plus, X, Image as ImageIcon, MapPin, NotebookPen, Sparkles, Calendar, Users, Globe, Loader2 } from 'lucide-react';
import { compressImage } from '../services/imageUtils';
import { parseDate } from '../services/dateParser';

interface TripFormProps {
  onSubmit: (memories: TripMemoryInput[], details: TripDetails) => void;
  isProcessing: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({ onSubmit, isProcessing }) => {
  const [memories, setMemories] = useState<TripMemoryInput[]>([]);
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [companions, setCompanions] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsCompressing(true);
      const files = Array.from(e.target.files);
      
      const newMemories: TripMemoryInput[] = await Promise.all(
        files.map(async (file) => {
          const compressedBlob = await compressImage(file);
          return {
            id: crypto.randomUUID(),
            file: new File([compressedBlob], file.name, { type: 'image/jpeg' }),
            previewUrl: URL.createObjectURL(compressedBlob),
            location: '',
            notes: '',
          };
        })
      );
      
      setMemories((prev) => [...prev, ...newMemories]);
      setIsCompressing(false);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateMemory = (id: string, field: 'location' | 'notes', value: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const removeMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memories.length === 0) return;
    const parsed = parseDate(dates);
    onSubmit(memories, { 
      destination, 
      dates, 
      parsedYear: parsed.year,
      parsedMonth: parsed.month,
      companions 
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-32 pb-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-4 dark:text-slate-100">
          Tell us about your trip
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto dark:text-slate-300">
          Start with the basics, then upload your photos to weave your story.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Trip Details Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 dark:bg-slate-800 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 dark:text-slate-200">
                <Globe size={16} className="text-teal-600 dark:text-teal-400" />
                Destination
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kyoto, Japan"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-teal-400/20 dark:focus:border-teal-400"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 dark:text-slate-200">
                <Calendar size={16} className="text-teal-600 dark:text-teal-400" />
                When?
              </label>
              <input
                type="text"
                placeholder="e.g. October 2023"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-teal-400/20 dark:focus:border-teal-400"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 dark:text-slate-200">
                <Users size={16} className="text-teal-600 dark:text-teal-400" />
                Who with?
              </label>
              <input
                type="text"
                placeholder="e.g. Solo, Friends, Family"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-teal-400/20 dark:focus:border-teal-400"
                value={companions}
                onChange={(e) => setCompanions(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">Your Memories</h2>
             <span className="text-sm text-slate-500 dark:text-slate-400">{memories.length} photos selected</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memories.map((memory, index) => (
              <div 
                key={memory.id} 
                className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 p-4 transition-all hover:shadow-md animate-slide-up dark:bg-slate-800 dark:border-slate-700"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  type="button"
                  onClick={() => removeMemory(memory.id)}
                  className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 rounded-full p-1 shadow-md border border-slate-100 z-10 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:text-red-400"
                >
                  <X size={16} />
                </button>

                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-100 dark:bg-slate-700 dark:border-slate-600">
                    <img
                      src={memory.previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="relative">
                      <MapPin className="absolute top-2.5 left-3 text-slate-400 dark:text-slate-500" size={16} />
                      <input
                        type="text"
                        placeholder="Specific spot? (e.g. Gold Pavilion)"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-teal-400/20"
                        value={memory.location}
                        onChange={(e) => updateMemory(memory.id, 'location', e.target.value)}
                      />
                    </div>
                    
                    <div className="relative">
                      <NotebookPen className="absolute top-2.5 left-3 text-slate-400 dark:text-slate-500" size={16} />
                      <input
                        type="text"
                        placeholder="Any specific memory?"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-lg text-sm text-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all dark:bg-slate-700 dark:text-slate-300 dark:placeholder:text-slate-400 dark:focus:ring-teal-400/20"
                        value={memory.notes}
                        onChange={(e) => updateMemory(memory.id, 'notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Button Area */}
<div 
               onClick={() => !isCompressing && fileInputRef.current?.click()}
               className={`flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-slate-300 rounded-2xl transition-all group ${isCompressing ? 'cursor-wait opacity-70' : 'cursor-pointer hover:border-teal-500 hover:bg-teal-50/50'} dark:border-slate-600 dark:hover:border-teal-400 dark:hover:bg-teal-900/20`}
             >
               {isCompressing ? (
                 <>
                   <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-3 dark:text-teal-400" />
                   <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Optimizing photos...</p>
                 </>
               ) : (
                 <>
                   <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center mb-3 transition-colors dark:bg-slate-700 dark:group-hover:bg-teal-900/30">
                     <ImageIcon className="text-slate-400 group-hover:text-teal-600 dark:text-slate-500 dark:group-hover:text-teal-400" size={24} />
                   </div>
                   <p className="text-sm font-semibold text-slate-600 group-hover:text-teal-700 dark:text-slate-300 dark:group-hover:text-teal-400">Add Photos</p>
                   <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">JPEGs or PNGs</p>
                 </>
               )}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {memories.length > 0 && (
          <div className="flex justify-center pt-6 pb-20">
            <button
              type="submit"
              disabled={isProcessing}
              className={`
                relative overflow-hidden group flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-1 hover:shadow-xl
                ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-500'}
              `}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Weaving Story...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} className="animate-pulse" />
                  <span>Generate Storyboard</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};