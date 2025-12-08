import React, { useState } from 'react';
import { TripForm } from './components/TripForm';
import { StoryboardViewer } from './components/StoryboardViewer';
import { StoriesGallery } from './components/StoriesGallery';
import { AuthModal } from './components/AuthModal';
import { generateStoryboard } from './services/geminiService';
import { saveStory } from './services/supabase';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppState, StoryboardData, TripMemoryInput, TripDetails, SavedStory } from './types';
import { Compass, User, LogOut, Github } from 'lucide-react';

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
    <nav className="sticky top-0 z-50 w-full border-b border-white/50 bg-white/60 backdrop-blur-xl transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <button
            onClick={handleReset}
            className="group flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Compass size={18} className="text-white shrink-0" />
                </div>
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span className="text-xl font-serif font-bold bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  WanderWeave
                </span>
                <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full opacity-60" />
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/bm611/wanderweave"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-white/50 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm hover:border-slate-300 hover:bg-white hover:text-slate-900 transition-all"
              title="View on GitHub"
            >
              <Github size={16} className="shrink-0 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Star</span>
            </a>
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/60 shadow-sm backdrop-blur-sm">
                  <User size={14} className="text-teal-600 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-white/50 border border-slate-200/60 px-3 py-2 text-slate-600 backdrop-blur-sm hover:border-red-200 hover:bg-red-50/80 hover:text-red-600 transition-all shadow-sm"
                  title="Sign out"
                >
                  <LogOut size={16} className="shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 transition-all hover:scale-105 hover:bg-slate-800"
              >
                <User size={16} className="shrink-0" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.12),transparent_38%),radial-gradient(circle_at_90%_15%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.1),transparent_40%),#f7f8fd] transition-colors">
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