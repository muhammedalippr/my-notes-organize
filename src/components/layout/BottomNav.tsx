import React from 'react';
import { ModuleKey, AppSettings } from '../../types';
import { 
  CheckSquare, 
  Grid, 
  ShoppingCart, 
  Calendar, 
  Wallet, 
  FileText,
  Network
} from 'lucide-react';

interface BottomNavProps {
  activeModule: ModuleKey | 'settings';
  setActiveModule: (module: ModuleKey | 'settings') => void;
  settings: AppSettings;
}

interface NavItemConfig {
  key: ModuleKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ALL_NAV_ITEMS: NavItemConfig[] = [
  { key: 'horizon_todo', label: 'Todo', icon: CheckSquare },
  { key: 'eisenhower', label: 'Matrix', icon: Grid },
  { key: 'shopping', label: 'Shopping', icon: ShoppingCart },
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'finance', label: 'Finance', icon: Wallet },
  { key: 'notes', label: 'Notes', icon: FileText },
  { key: 'mindmap', label: 'Mind Map', icon: Network },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeModule,
  setActiveModule,
  settings,
}) => {
  // Filter only enabled modules from settings
  const visibleItems = ALL_NAV_ITEMS.filter(
    item => settings.enabledModules[item.key] !== false
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 safe-bottom transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-around">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setActiveModule(item.key)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[52px] rounded-xl transition-all duration-150 relative ${
                isActive 
                  ? 'text-indigo-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
              )}
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110 bg-indigo-500/10' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
