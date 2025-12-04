import React, { useState } from 'react';
import { TripForm } from './components/TripForm';
import { StoryboardViewer } from './components/StoryboardViewer';
import { generateStoryboard } from './services/geminiService';
import { AppState, StoryboardData, TripMemoryInput, TripDetails } from './types';
import { Compass } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [memories, setMemories] = useState<TripMemoryInput[]>([]);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [storyboardData, setStoryboardData] = useState<StoryboardData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (inputMemories: TripMemoryInput[], details: TripDetails) => {
    setMemories(inputMemories);
    setTripDetails(details);
    setAppState(AppState.PROCESSING);
    setErrorMsg(null);

    try {
      const data = await generateStoryboard(inputMemories, details);
      setStoryboardData(data);
      setAppState(AppState.STORYBOARD);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      setErrorMsg("We couldn't generate your story. Please try again or check your connection.");
    }
  };

  const handleReset = () => {
    setAppState(AppState.INPUT);
    setMemories([]);
    setTripDetails(null);
    setStoryboardData(null);
    setErrorMsg(null);
  };

  const handleRetry = () => {
    if (memories.length > 0 && tripDetails) {
      handleGenerate(memories, tripDetails);
    } else {
      setAppState(AppState.INPUT);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {appState === AppState.INPUT && (
        <>
          <nav className="px-6 py-6 flex items-center justify-center border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2 text-teal-700 font-serif font-bold text-xl">
              <Compass size={24} />
              <span>WanderWeave</span>
            </div>
          </nav>
          <TripForm onSubmit={handleGenerate} isProcessing={false} />
        </>
      )}

      {appState === AppState.PROCESSING && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in">
           <div className="relative mb-8">
             <div className="absolute inset-0 bg-teal-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
             <Compass size={64} className="text-teal-600 relative z-10 animate-spin-slow" style={{ animationDuration: '3s' }} />
           </div>
           <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">Weaving your journey...</h2>
           <p className="text-slate-500 max-w-sm">
             Our AI is analyzing your photos from {tripDetails?.destination}, matching the vibes, and crafting your story.
           </p>
        </div>
      )}

      {appState === AppState.STORYBOARD && storyboardData && tripDetails && (
        <StoryboardViewer 
          data={storyboardData} 
          originalMemories={memories}
          tripDetails={tripDetails}
          onReset={handleReset} 
        />
      )}

      {appState === AppState.ERROR && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500">
            <Compass size={32} className="transform rotate-180" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops, we hit a bump.</h2>
          <p className="text-slate-600 mb-8 max-w-md">{errorMsg}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setAppState(AppState.INPUT)}
              className="px-6 py-3 rounded-lg border border-slate-200 font-medium hover:bg-slate-50 transition-colors"
            >
              Start Over
            </button>
            <button 
              onClick={handleRetry}
              className="px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;