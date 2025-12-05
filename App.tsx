import React, { useState } from 'react';
import { TripForm } from './components/TripForm';
import { StoryboardViewer } from './components/StoryboardViewer';
import { StoriesGallery } from './components/StoriesGallery';
import { AuthModal } from './components/AuthModal';
import { generateStoryboard } from './services/geminiService';
import { saveStory } from './services/supabase';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppState, StoryboardData, TripMemoryInput, TripDetails, SavedStory } from './types';
import { Compass, User, LogOut } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [memories, setMemories] = useState<TripMemoryInput[]>([]);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [storyboardData, setStoryboardData] = useState<StoryboardData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [viewingSavedStory, setViewingSavedStory] = useState<SavedStory | null>(null);

  const handleGenerate = async (inputMemories: TripMemoryInput[], details: TripDetails) => {
    setMemories(inputMemories);
    setTripDetails(details);
    setAppState(AppState.PROCESSING);
    setErrorMsg(null);

    try {
      const data = await generateStoryboard(inputMemories, details);
      setStoryboardData(data);
      setAppState(AppState.STORYBOARD);

      // Save story if user is logged in
      if (user && inputMemories.length > 0) {
        try {
          const imageDataUrls = inputMemories.map(m => ({
            memoryId: m.id,
            dataUrl: m.previewUrl,
          }));
          await saveStory(user.id, data, details, imageDataUrls);
        } catch (saveError) {
          console.warn('Failed to save story:', saveError);
        }
      }
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      setErrorMsg("We couldn't generate your story. Please try again or check your connection.");
    }
  };

  const handleReset = () => {
    setAppState(AppState.HOME);
    setMemories([]);
    setTripDetails(null);
    setStoryboardData(null);
    setErrorMsg(null);
    setViewingSavedStory(null);
  };

  const handleViewSavedStory = (story: SavedStory) => {
    setViewingSavedStory(story);
    setStoryboardData(story.storyData);
    setTripDetails({
      destination: story.destination,
      dates: story.dates,
      companions: '',
    });
    setAppState(AppState.STORYBOARD);
  };

  const handleRetry = () => {
    if (memories.length > 0 && tripDetails) {
      handleGenerate(memories, tripDetails);
    } else {
      setAppState(AppState.INPUT);
    }
  };

  const NavBar = () => (
    <nav className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
      <button
        onClick={handleReset}
        className="flex items-center gap-2 text-teal-700 font-serif font-bold text-xl hover:opacity-80 transition-opacity"
      >
        <Compass size={24} />
        <span>WanderWeave</span>
      </button>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-slate-600 hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
          >
            <User size={18} />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {appState === AppState.HOME && (
        <>
          <NavBar />
          <StoriesGallery
            onCreateNew={() => setAppState(AppState.INPUT)}
            onViewStory={handleViewSavedStory}
            onSignIn={() => setShowAuthModal(true)}
          />
        </>
      )}

      {appState === AppState.INPUT && (
        <>
          <NavBar />
          <TripForm onSubmit={handleGenerate} isProcessing={false} />
        </>
      )}

      {appState === AppState.PROCESSING && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-gradient-to-b from-slate-50 to-teal-50/30">
           <div className="relative mb-8">
             <div className="absolute inset-0 w-24 h-24 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
               <div className="absolute inset-0 bg-teal-400/20 rounded-full animate-pulse-ring"></div>
               <div className="absolute inset-2 bg-teal-300/20 rounded-full animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
             </div>
             <div className="relative w-20 h-20 flex items-center justify-center">
               <div className="absolute inset-0 bg-teal-100 rounded-full"></div>
               <Compass size={40} className="text-teal-600 relative z-10 animate-spin-slow" />
             </div>
           </div>
           <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">Weaving your journey...</h2>
           <p className="text-slate-500 max-w-sm mb-6">
             Our AI is analyzing your photos from {tripDetails?.destination}, matching the vibes, and crafting your story.
           </p>
           <div className="flex gap-2">
             <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce-dot"></div>
             <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0.16s' }}></div>
             <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0.32s' }}></div>
           </div>
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

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;