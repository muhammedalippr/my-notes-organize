import React from 'react';
import { ActiveView, AppSettings, ModuleKey } from '../../types';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { 
  Illustration3DCalendar,
  Illustration3DChecklist,
  Illustration3DShopping,
  Illustration3DMatrix,
  Illustration3DFinance,
  Illustration3DNotes,
  Illustration3DMindMap
} from '../illustrations/3DIllustrations';

interface HomeScreenProps {
  onSelectView: (view: ActiveView) => void;
  settings: AppSettings;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectView, settings }) => {
  const horizons = StorageService.getHorizons();
  const matrix = StorageService.getMatrix();
  const shopping = StorageService.getShopping();
  const events = StorageService.getEvents();
  const finance = StorageService.getFinance();
  const notes = StorageService.getNotes();
  const mindmaps = StorageService.getMindMaps();

  const todayPlain = (horizons.today || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  const todayTasks = todayPlain
    .split('\n')
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0 && !l.includes('(Sample list)') && !l.toLowerCase().includes('sample list'));
  
  const matrixLines = [
    matrix.important_urgent || '',
    matrix.important_not_urgent || '',
    matrix.urgent_not_important || '',
    matrix.not_important_not_urgent || '',
  ].flatMap((text: string) => text.trim().split('\n').filter((l: string) => l.trim() && !l.includes('(Sample list)')));
  
  const pendingShopping = shopping.filter(i => !i.completed);
  const now = new Date().getTime();
  const upcomingEvents = events.filter(e => new Date(e.dateTime).getTime() >= now);
  
  const pendingFinance = finance.filter(r => r.status === 'pending');
  const toReceive = pendingFinance.filter(r => r.direction === 'gave').reduce((s, r) => s + r.amount, 0);
  const toPay = pendingFinance.filter(r => r.direction === 'received').reduce((s, r) => s + r.amount, 0);
  const netFinance = toReceive - toPay;
  const currency = settings.currencySymbol || '₹';

  const handleOpen = (view: ActiveView) => {
    soundService.triggerHaptic(18);
    onSelectView(view);
  };

  const isEnabled = (key: ModuleKey) => settings.enabledModules[key] !== false;

  const count = todayTasks.length;
  const todoSubtitle = count === 0
    ? 'No tasks left today'
    : count === 1
      ? '1 task left today'
      : `${count} tasks left today`;

  const shoppingSubtitle = pendingShopping.length === 0
    ? 'All items bought'
    : pendingShopping.length === 1
      ? '1 item to buy'
      : `${pendingShopping.length} items to buy`;

  const eventsSubtitle = upcomingEvents.length === 0
    ? 'No events scheduled'
    : upcomingEvents.length === 1
      ? '1 event scheduled'
      : `${upcomingEvents.length} events scheduled`;

  const matrixSubtitle = matrixLines.length === 0
    ? 'All cleared'
    : matrixLines.length === 1
      ? '1 task pending'
      : `${matrixLines.length} tasks pending`;

  const notesSubtitle = notes.length === 0
    ? 'No notes'
    : notes.length === 1
      ? '1 saved note'
      : `${notes.length} saved notes`;

  const mindmapsSubtitle = mindmaps.length === 0
    ? 'No mind maps'
    : mindmaps.length === 1
      ? '1 saved map'
      : `${mindmaps.length} saved maps`;

  return (
    <div className="space-y-3.5 pb-14 select-none font-sans">
      
      {/* 1. HERO CARD: Todo List */}
      {isEnabled('horizon_todo') && (
        <div
          onClick={() => handleOpen('horizon_todo')}
          className="neo-card p-5 cursor-pointer group hover:border-[#ff5e1a]/40 relative overflow-hidden transition-all duration-300"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight text-[var(--text-primary)] leading-snug">
                Todo List
              </h3>
              
              <p className="text-xs font-bold text-[#ff5e1a]">
                {todoSubtitle}
              </p>
            </div>

            {/* 3D Floating Checklist Illustration */}
            <div className="shrink-0 flex items-center justify-center">
              <Illustration3DChecklist className="w-14 h-14" />
            </div>
          </div>
        </div>
      )}

      {/* 2. 3D BENTO GRID (Big Title + Orange Subtitle) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* Card 1: 4 Quadrants */}
        {isEnabled('eisenhower') && (
          <div
            onClick={() => handleOpen('eisenhower')}
            className="neo-card p-5 cursor-pointer group hover:border-[#ff5e1a]/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[var(--text-primary)] leading-snug">4 Quadrants</h3>
                <p className="text-xs font-bold text-[#ff5e1a]">
                  {matrixSubtitle}
                </p>
              </div>
              <Illustration3DMatrix className="w-14 h-14 shrink-0" />
            </div>
          </div>
        )}

        {/* Card 2: Shopping List */}
        {isEnabled('shopping') && (
          <div
            onClick={() => handleOpen('shopping')}
            className="neo-card p-5 cursor-pointer group hover:border-[#ff5e1a]/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[var(--text-primary)] leading-snug">Shopping</h3>
                <p className="text-xs font-bold text-[#ff5e1a]">
                  {shoppingSubtitle}
                </p>
              </div>
              <Illustration3DShopping className="w-14 h-14 shrink-0" />
            </div>
          </div>
        )}

        {/* Card 3: Events & Schedule */}
        {isEnabled('events') && (
          <div
            onClick={() => handleOpen('events')}
            className="neo-card p-5 cursor-pointer group hover:border-[#ff5e1a]/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[var(--text-primary)] leading-snug">Events</h3>
                <p className="text-xs font-bold text-[#ff5e1a]">
                  {eventsSubtitle}
                </p>
              </div>
              <Illustration3DCalendar className="w-14 h-14 shrink-0" />
            </div>
          </div>
        )}

        {/* Card 4: Cash Flow Ledger */}
        {isEnabled('finance') && (
          <div
            onClick={() => handleOpen('finance')}
            className="neo-card p-5 cursor-pointer group hover:border-[#ff5e1a]/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[var(--text-primary)] leading-snug">Finance</h3>
                <p className="text-xs font-bold text-[#ff5e1a]">
                  Net: {netFinance >= 0 ? '+' : '-'}{currency}{Math.abs(netFinance).toLocaleString()}
                </p>
              </div>
              <Illustration3DFinance className="w-14 h-14 shrink-0" />
            </div>
          </div>
        )}

        {/* Card 5: Custom Notes */}
        {isEnabled('notes') && (
          <div
            onClick={() => handleOpen('notes')}
            className="neo-card p-5 cursor-pointer group hover:border-[#ff5e1a]/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[var(--text-primary)] leading-snug">Notes</h3>
                <p className="text-xs font-bold text-[#ff5e1a]">
                  {notesSubtitle}
                </p>
              </div>
              <Illustration3DNotes className="w-14 h-14 shrink-0" />
            </div>
          </div>
        )}

        {/* Card 6: Mind Map */}
        {isEnabled('mindmap') && (
          <div
            onClick={() => handleOpen('mindmap')}
            className="neo-card p-5 cursor-pointer group hover:border-[#ff5e1a]/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[var(--text-primary)] leading-snug">Mind Map</h3>
                <p className="text-xs font-bold text-[#ff5e1a]">
                  {mindmapsSubtitle}
                </p>
              </div>
              <Illustration3DMindMap className="w-14 h-14 shrink-0" />
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
