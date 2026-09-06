import React, { useState, useRef, useEffect } from 'react';
import { HorizonData, HorizonType, AppSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { NotificationService } from '../../services/notificationService';
import { 
  Sun, 
  Sunrise, 
  CalendarDays, 
  CalendarRange, 
  Target, 
  Bell 
} from 'lucide-react';

import { EditorAccessoryBar, handleEditorKeyDown } from '../common/EditorAccessoryBar';
import { TodoReminderModal } from './TodoReminderModal';

interface HorizonTodoProps {
  settings: AppSettings;
}

interface HorizonConfig {
  key: HorizonType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isHero?: boolean;
}

const HORIZON_SECTIONS: HorizonConfig[] = [
  { key: 'today', title: 'Today', icon: Sun, isHero: true },
  { key: 'tomorrow', title: 'Tomorrow', icon: Sunrise },
  { key: 'this_week', title: 'This Week', icon: CalendarDays },
  { key: 'this_month', title: 'This Month', icon: CalendarRange },
  { key: 'this_year', title: 'This Year', icon: Target },
];

interface TodoReminderConfig {
  enabled: boolean;
  dateTime: string;
}

const RichExpandingEditor: React.FC<{
  initialContent: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
  minHeight?: number;
  onFocus?: (el: HTMLElement) => void;
}> = ({ initialContent, onChange, placeholder, className = '', minHeight = 90, onFocus }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      editorRef.current.innerHTML = initialContent || '';
    }
  }, [initialContent]);

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onFocus={(e) => {
        if (onFocus) onFocus(e.currentTarget);
      }}
      onKeyDown={(e) => handleEditorKeyDown(e, onChange)}
      onInput={(e) => {
        onChange(e.currentTarget.innerHTML);
      }}
      data-placeholder={placeholder}
      style={{ minHeight: `${minHeight}px` }}
      className={`rich-note-editor ${className}`}
    />
  );
};

export const HorizonTodo: React.FC<HorizonTodoProps> = () => {
  const [data, setData] = useState<HorizonData>(StorageService.getHorizons());
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const [activeKey, setActiveKey] = useState<HorizonType>('today');
  const [reminders, setReminders] = useState<Record<string, TodoReminderConfig>>(() => 
    StorageService.get<Record<string, TodoReminderConfig>>('omni_todo_reminders', {})
  );
  const [modalSection, setModalSection] = useState<{ key: HorizonType; title: string } | null>(null);

  const handleChange = (key: HorizonType, value: string) => {
    const updated = { ...data, [key]: value };
    setData(updated);
    StorageService.saveHorizons(updated);
  };

  const handleSaveReminder = (key: HorizonType, enabled: boolean, dateTime: string) => {
    const updated = { ...reminders, [key]: { enabled, dateTime } };
    setReminders(updated);
    StorageService.set('omni_todo_reminders', updated);

    if (enabled && dateTime) {
      NotificationService.scheduleEventAlarms({
        id: `todo_${key}`,
        title: `${modalSection?.title || 'Todo'} Tasks Reminder`,
        dateTime,
        category: 'Work',
        reminderMinutesBefore: 0,
        reminders: ['on_time'],
        notes: (data[key] || '').replace(/<[^>]*>?/gm, '').slice(0, 120),
        createdAt: new Date().toISOString(),
      });
    }
  };

  const getLineCount = (html: string) => {
    if (!html || !html.trim()) return 0;
    const plain = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>?/gm, '')
      .trim();
    if (!plain) return 0;
    const lines = plain
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.includes('(Sample list)'));
    return lines.length;
  };

  return (
    <div className="space-y-4 pb-14 font-sans">
      {/* 1. HERO CARD: Today */}
      {HORIZON_SECTIONS.filter(s => s.isHero).map(section => {
        const content = data[section.key] || '';
        const lineCount = getLineCount(content);
        const hasActiveReminder = reminders[section.key]?.enabled;

        return (
          <div key={section.key} className="neo-card overflow-hidden">
            {/* Header Area */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)]">
                  {section.title}
                </h2>
                <span className="text-xs font-bold text-[#ff5e1a]">
                  {lineCount === 0 ? 'No tasks' : lineCount === 1 ? '1 task active' : `${lineCount} tasks active`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundService.triggerHaptic(15);
                  setModalSection({ key: section.key, title: section.title });
                }}
                title="Set Reminder"
                className={`p-2.5 rounded-2xl border transition-all active:scale-90 ${
                  hasActiveReminder
                    ? 'bg-[#ff5e1a] text-white border-[#ff5e1a] shadow-md shadow-[#ff5e1a]/30'
                    : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:text-[#ff5e1a]'
                }`}
              >
                <Bell className={`w-4 h-4 ${hasActiveReminder ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Edge-to-edge expanded typing canvas with distinct background & zero side margins */}
            <div className="w-full bg-[var(--bg-main)]/70 dark:bg-[var(--bg-main)] border-t border-[var(--border-soft)] px-5 py-4 focus-within:bg-[var(--bg-main)] transition-colors">
              <RichExpandingEditor
                initialContent={content}
                onFocus={(el) => {
                  setActiveElement(el);
                  setActiveKey(section.key);
                }}
                onChange={(val) => handleChange(section.key, val)}
                placeholder="What are your goals today?"
                minHeight={90}
                className="w-full bg-transparent text-[var(--text-primary)] p-0 outline-none text-sm sm:text-base font-bold leading-relaxed transition-colors border-none"
              />
            </div>
          </div>
        );
      })}

      {/* 2. OTHER TIME PERIODS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {HORIZON_SECTIONS.filter(s => !s.isHero).map(section => {
          const content = data[section.key] || '';
          const lineCount = getLineCount(content);
          const hasActiveReminder = reminders[section.key]?.enabled;

          return (
            <div key={section.key} className="neo-card overflow-hidden">
              {/* Header Area */}
              <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    {section.title}
                  </h3>
                  <span className="text-xs font-bold text-[#ff5e1a]">
                    {lineCount === 0 ? 'No tasks' : lineCount === 1 ? '1 task active' : `${lineCount} tasks active`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundService.triggerHaptic(15);
                    setModalSection({ key: section.key, title: section.title });
                  }}
                  title="Set Reminder"
                  className={`p-2 rounded-2xl border transition-all active:scale-90 ${
                    hasActiveReminder
                      ? 'bg-[#ff5e1a] text-white border-[#ff5e1a] shadow-md shadow-[#ff5e1a]/30'
                      : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:text-[#ff5e1a]'
                  }`}
                >
                  <Bell className={`w-3.5 h-3.5 ${hasActiveReminder ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Edge-to-edge expanded typing canvas with distinct background & zero side margins */}
              <div className="w-full bg-[var(--bg-main)]/70 dark:bg-[var(--bg-main)] border-t border-[var(--border-soft)] px-4 py-3.5 focus-within:bg-[var(--bg-main)] transition-colors">
                <RichExpandingEditor
                  initialContent={content}
                  onFocus={(el) => {
                    setActiveElement(el);
                    setActiveKey(section.key);
                  }}
                  onChange={(val) => handleChange(section.key, val)}
                  placeholder={`Plan for ${section.title.toLowerCase()}...`}
                  minHeight={65}
                  className="w-full bg-transparent text-[var(--text-primary)] p-0 outline-none text-xs sm:text-sm font-bold leading-relaxed transition-colors border-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* On-screen Keyboard Accessory Toolbar */}
      <EditorAccessoryBar
        getEditableElement={() => activeElement}
        onContentChange={(newHtml) => handleChange(activeKey, newHtml)}
      />

      {/* Todo Section Reminder Modal */}
      {modalSection && (
        <TodoReminderModal
          key={modalSection.key}
          isOpen={true}
          onClose={() => setModalSection(null)}
          sectionTitle={modalSection.title}
          initialEnabled={reminders[modalSection.key]?.enabled || false}
          initialDateTime={reminders[modalSection.key]?.dateTime || ''}
          onSave={(enabled, dt) => handleSaveReminder(modalSection.key, enabled, dt)}
        />
      )}
    </div>
  );
};
