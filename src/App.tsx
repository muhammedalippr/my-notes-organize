import React, { useState, useEffect, useRef } from 'react';
import { ActiveView, AppSettings, AppEvent } from './types';
import { StorageService } from './services/storage';
import { NotificationService } from './services/notificationService';
import { soundService, backButtonService } from './services/soundService';
import { Header } from './components/layout/Header';
import { HomeScreen } from './components/home/HomeScreen';
import { HorizonTodo } from './components/todo/HorizonTodo';
import { EisenhowerMatrix } from './components/todo/EisenhowerMatrix';
import { ShoppingList } from './components/shopping/ShoppingList';
import { EventsManager } from './components/events/EventsManager';
import { CashManager } from './components/finance/CashManager';
import { NotesHub } from './components/notes/NotesHub';
import { MindMapHub } from './components/mindmap/MindMapHub';
import { SettingsPage } from './components/settings/SettingsPage';
import { AdMobService } from './services/adMobService';
import { AppUpdateService } from './services/appUpdateService';
import { App as CapApp } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [events, setEvents] = useState<AppEvent[]>(StorageService.getEvents());

  // Check and create local daily backup snapshot, init AdMob banner & in-app update check
  useEffect(() => {
    StorageService.checkAndPerformDailyBackup();
    // Re-sync settings in case currency was auto-corrected
    setSettings(StorageService.getSettings());
    // Initialize bottom anchored adaptive banner ad
    AdMobService.initialize();
    // Check for Google Play in-app updates
    AppUpdateService.checkForUpdate();

    // Automatically hide AdMob banner immediately on focusin (before keyboard opens) & on keyboardWillShow, and resume immediately when keyboard closes
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('contenteditable') === 'true')
      ) {
        AdMobService.hideBanner();
      }
    };

    window.addEventListener('focusin', handleFocusIn, { capture: true });

    let showSub: any = null;
    let hideSub: any = null;
    let didHideSub: any = null;
    try {
      showSub = Keyboard.addListener('keyboardWillShow', () => {
        AdMobService.hideBanner();
      });
      hideSub = Keyboard.addListener('keyboardWillHide', () => {
        AdMobService.resumeBanner();
      });
      didHideSub = Keyboard.addListener('keyboardDidHide', () => {
        AdMobService.resumeBanner();
      });
    } catch (e) {
      console.log('Keyboard listener notice:', e);
    }

    return () => {
      window.removeEventListener('focusin', handleFocusIn, { capture: true });
      if (showSub && typeof showSub.remove === 'function') showSub.remove();
      if (hideSub && typeof hideSub.remove === 'function') hideSub.remove();
      if (didHideSub && typeof didHideSub.remove === 'function') didHideSub.remove();
    };
  }, []);

  // Ref to always track latest activeView inside native event listeners without closure lag
  const activeViewRef = useRef<ActiveView>(activeView);
  useEffect(() => {
    activeViewRef.current = activeView;
  }, [activeView]);

  // Native Android Physical Back Button & Browser History Handler
  useEffect(() => {
    // 1. Capacitor Native Android Hardware Back Button Listener
    let capBackListener: any = null;
    try {
      capBackListener = CapApp.addListener('backButton', async () => {
        // First check if any active modal or full-screen editor handles the back button
        const handledByComponent = await backButtonService.handleBack();
        if (handledByComponent) {
          return;
        }

        if (activeViewRef.current !== 'home') {
          soundService.triggerHaptic(15);
          setActiveView('home');
        } else {
          // If on home screen, minimize/exit app cleanly
          CapApp.exitApp();
        }
      });
    } catch (e) {
      console.warn('Capacitor App plugin not available in browser mode');
    }

    // 2. Browser / WebView PopState Back Handler (Push initial dummy state so browser back doesn't exit webview)
    window.history.pushState({ page: 'omnitask' }, '');
    const handlePopState = async (e: PopStateEvent) => {
      // First check if any active modal or full-screen editor handles the back button
      const handledByComponent = await backButtonService.handleBack();
      if (handledByComponent) {
        window.history.pushState({ page: 'omnitask' }, '');
        return;
      }

      if (activeViewRef.current !== 'home') {
        e.preventDefault();
        soundService.triggerHaptic(15);
        setActiveView('home');
        window.history.pushState({ page: 'omnitask' }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      if (capBackListener && typeof capBackListener.remove === 'function') {
        capBackListener.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // System & Custom Theme Handler
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      const theme = settings.theme || 'dark';

      let isDark = true;
      if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = theme !== 'light';
      }

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (isDark) {
        root.classList.add('dark');
        if (metaTheme) metaTheme.setAttribute('content', '#181920');
      } else {
        root.classList.remove('dark');
        if (metaTheme) metaTheme.setAttribute('content', '#f8fafc');
      }

      // Notify native Android to toggle navigation bar color dynamically
      if (typeof window !== 'undefined' && (window as any).updateNativeNavTheme) {
        (window as any).updateNativeNavTheme(isDark);
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if ((settings.theme || 'light') === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [settings.theme]);

  // Periodic check for today's todo reminder
  useEffect(() => {
    const checkReminder = () => {
      if (settings.todayReminder.enabled) {
        const todayText = StorageService.getHorizons().today;
        NotificationService.checkTodayTodoReminder(settings.todayReminder.time, todayText);
      }
    };

    const interval = setInterval(checkReminder, 30000);
    return () => clearInterval(interval);
  }, [settings.todayReminder]);

  const refreshData = () => {
    setSettings(StorageService.getSettings());
    setEvents(StorageService.getEvents());
  };

  const [isEditorActive, setIsEditorActive] = useState(false);

  // Automatically scroll to the top whenever activeView or editor state changes (forward or back navigation)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const root = document.getElementById('root');
    if (root) root.scrollTop = 0;
  }, [activeView, isEditorActive]);

  // When switching modules, ensure editor active flag resets
  const handleSelectView = (view: ActiveView) => {
    setIsEditorActive(false);
    setActiveView(view);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#ff5e1a] selection:text-white transition-colors duration-200">
      {/* Top Header with iOS Chevron - Hidden during full-page editor */}
      {!isEditorActive && (
        <Header
          activeView={activeView}
          setActiveView={handleSelectView}
          settings={settings}
        />
      )}

      {/* Main Screen Content */}
      <main className={`flex-1 w-full ${
        isEditorActive
          ? 'p-0 m-0 max-w-none'
          : activeView === 'home' 
            ? 'max-w-4xl mx-auto px-4 pt-0' 
            : 'max-w-4xl mx-auto px-4 pt-2 md:p-6'
      }`}>
        {activeView === 'home' && (
          <HomeScreen onSelectView={handleSelectView} settings={settings} />
        )}
        {activeView === 'horizon_todo' && <HorizonTodo settings={settings} />}
        {activeView === 'eisenhower' && <EisenhowerMatrix />}
        {activeView === 'shopping' && <ShoppingList />}
        {activeView === 'events' && <EventsManager />}
        {activeView === 'finance' && <CashManager settings={settings} onEditorStateChange={setIsEditorActive} />}
        {activeView === 'notes' && <NotesHub onEditorStateChange={setIsEditorActive} />}
        {activeView === 'mindmap' && <MindMapHub onEditorStateChange={setIsEditorActive} />}
        {activeView === 'settings' && (
          <SettingsPage
            settings={settings}
            setSettings={setSettings}
            onRefreshData={refreshData}
          />
        )}
      </main>
    </div>
  );
};

export default App;
