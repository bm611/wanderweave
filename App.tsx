import React, { useState } from 'react';
import { TripForm } from './components/TripForm';
import { StoryboardViewer } from './components/StoryboardViewer';
import { StoriesGallery } from './components/StoriesGallery';
import { AuthModal } from './components/AuthModal';
import { generateStoryboard } from './services/geminiService';
import { saveStory } from './services/supabase';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext';
import { AppState, StoryboardData, TripMemoryInput, TripDetails, SavedStory } from './types';
import { Compass, User, LogOut, Github, Moon, Sun } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
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
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300">
      <div className="pointer-events-auto flex items-center justify-between w-full max-w-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full px-2 py-2 dark:bg-slate-900/70 dark:border-white/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300">
        <button
          onClick={handleReset}
          className="group flex items-center gap-2 pl-2 transition-all hover:scale-[1.02]"
        >
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-teal-50 to-white border border-teal-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-0.5">
                <Compass size={18} className="text-teal-600 shrink-0 rotate-0 group-hover:rotate-45 transition-transform duration-500" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-serif font-bold tracking-tight text-slate-800 dark:text-slate-100">
                Wander<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400">Weave</span>
              </span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="group inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200/60 bg-white/50 text-slate-600 shadow-sm backdrop-blur-sm hover:border-slate-300 hover:bg-white hover:text-slate-900 transition-all dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            title="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
            ) : (
              <Moon size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
            )}
          </button>
          <a
            href="https://github.com/bm611/wanderweave"
            target="_blank"
            rel="noreferrer"
            className="group hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm hover:border-slate-300 hover:bg-white hover:text-slate-900 transition-all dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            title="View on GitHub"
          >
            <Github size={16} className="shrink-0 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Star</span>
          </a>
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/60 shadow-sm backdrop-blur-sm dark:from-slate-800 dark:to-slate-700/80 dark:border-slate-600/60">
                <User size={14} className="text-teal-600 shrink-0 dark:text-teal-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user.email}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/50 border border-slate-200/60 text-slate-600 backdrop-blur-sm hover:border-red-200 hover:bg-red-50/80 hover:text-red-600 transition-all shadow-sm dark:bg-slate-800/50 dark:border-slate-700/60 dark:text-slate-300 dark:hover:border-red-800/60 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                title="Sign out"
              >
                <LogOut size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 transition-all hover:scale-105 hover:bg-slate-800 dark:bg-teal-600 dark:shadow-teal-600/20 dark:hover:bg-teal-700"
            >
              <User size={16} className="shrink-0" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.12),transparent_38%),radial-gradient(circle_at_90%_15%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.1),transparent_40%),#f7f8fd] transition-colors dark:text-slate-100 dark:bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.08),transparent_38%),radial-gradient(circle_at_90%_15%,rgba(16,185,129,0.08),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.06),transparent_40%),#0f172a]">
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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-gradient-to-b from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-teal-900/20">
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
<h2 className="text-2xl font-serif font-bold text-slate-800 mb-2 dark:text-slate-100">Weaving your journey...</h2>
            <p className="text-slate-500 max-w-sm mb-6 dark:text-slate-400">
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
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500 dark:bg-red-900/20 dark:text-red-400">
            <Compass size={32} className="transform rotate-180" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2 dark:text-slate-100">Oops, we hit a bump.</h2>
          <p className="text-slate-600 mb-8 max-w-md dark:text-slate-300">{errorMsg}</p>
          <div className="flex gap-4">
<button 
               onClick={() => setAppState(AppState.INPUT)}
               className="px-6 py-3 rounded-lg border border-slate-200 font-medium hover:bg-slate-50 transition-colors dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
             >
               Start Over
             </button>
             <button 
               onClick={handleRetry}
               className="px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20 dark:bg-teal-500 dark:hover:bg-teal-600 dark:shadow-teal-500/30"
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
  <DarkModeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </DarkModeProvider>
);

export default App;