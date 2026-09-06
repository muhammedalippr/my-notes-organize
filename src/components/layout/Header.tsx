import React, { useEffect, useRef } from 'react';
import { ActiveView, AppSettings } from '../../types';
import { soundService } from '../../services/soundService';
import { ChevronLeft, Settings, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  settings: AppSettings;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
}) => {
  const getViewTitle = () => {
    switch (activeView) {
      case 'home': return 'My Notes';
      case 'horizon_todo': return 'Todo List';
      case 'eisenhower': return '4 Quadrants';
      case 'shopping': return 'Shopping';
      case 'events': return 'Events';
      case 'finance': return 'Finance';
      case 'notes': return 'Notes';
      case 'mindmap': return 'Mind Map';
      case 'settings': return 'Settings';
      default: return 'My Notes';
    }
  };

  const title = getViewTitle();

  const handleBackToHome = () => {
    soundService.triggerHaptic(15);
    setActiveView('home');
  };

  return (
    <header className={`sticky top-0 z-30 bg-[var(--bg-main)]/90 backdrop-blur-2xl px-5 border-b ${
      activeView === 'home' ? 'pt-7 pb-5 border-transparent' : 'pt-3 pb-3.5 border-[var(--border-soft)]'
    } safe-top`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Left: iOS Chevron Back or Title & Subtitle */}
        <div className="flex items-center gap-3">
          {activeView !== 'home' && (
            <button
              onClick={handleBackToHome}
              aria-label="Back"
              className="neo-pill w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:border-[#ff5e1a]/40 transition-all active:scale-90"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5] text-[#ff5e1a] -ml-0.5" />
            </button>
          )}

          <div className={activeView === 'home' ? 'pt-4' : ''}>
            <h1 className={`${
              activeView === 'home' 
                ? 'text-3xl sm:text-4xl font-black' 
                : 'text-xl sm:text-2xl font-black'
            } text-[var(--text-primary)] tracking-tight leading-tight`}>
              {title}
            </h1>
            {activeView === 'home' && (
              <p className="text-xs font-bold text-[var(--text-secondary)] mt-1.5 tracking-wide">
                Plan, track &amp; organize your day
              </p>
            )}
          </div>
        </div>

        {/* Right: Settings Action Button */}
        <div className="flex items-center gap-2.5">
          {activeView === 'home' && (
            <button
              onClick={() => {
                soundService.triggerHaptic(15);
                setActiveView('settings');
              }}
              aria-label="Settings"
              className="neo-pill w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#ff5e1a]/40 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
