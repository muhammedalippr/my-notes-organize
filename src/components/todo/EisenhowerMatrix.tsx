import React, { useState, useRef, useEffect } from 'react';
import { MatrixData, MatrixQuadrant } from '../../types';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { Plus } from 'lucide-react';

interface QuadrantConfig {
  key: MatrixQuadrant;
  title: string;
  subtitle: string;
  badgeBg: string;
}

const QUADRANTS: QuadrantConfig[] = [
  {
    key: 'important_urgent',
    title: '1. Do First',
    subtitle: 'Urgent & Important',
    badgeBg: 'text-rose-500',
  },
  {
    key: 'important_not_urgent',
    title: '2. Schedule',
    subtitle: 'Important, Not Urgent',
    badgeBg: 'text-[#ff5e1a]',
  },
  {
    key: 'urgent_not_important',
    title: '3. Delegate',
    subtitle: 'Urgent, Not Important',
    badgeBg: 'text-amber-500',
  },
  {
    key: 'not_important_not_urgent',
    title: '4. Eliminate',
    subtitle: 'Neither',
    badgeBg: 'text-slate-400',
  },
];

const AutoExpandingTextarea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
  minHeight?: number;
}> = ({ value, onChange, placeholder, className = '', minHeight = 85 }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      // Extra 44px (approx 2 line heights) breathing room below the text
      el.style.height = `${Math.max(el.scrollHeight + 44, minHeight)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        adjustHeight();
      }}
      placeholder={placeholder}
      className={`${className} overflow-hidden resize-none transition-[height] duration-75`}
      rows={1}
    />
  );
};

export const EisenhowerMatrix: React.FC = () => {
  const [data, setData] = useState<MatrixData>(StorageService.getMatrix());

  const handleChange = (key: MatrixQuadrant, value: string) => {
    const updated = { ...data, [key]: value };
    setData(updated);
    StorageService.saveMatrix(updated);
  };

  const addBullet = (key: MatrixQuadrant) => {
    const current = data[key] || '';
    const updated = current.length === 0 || current.endsWith('\n') 
      ? `${current}• ` 
      : `${current}\n• `;
    
    handleChange(key, updated);
    soundService.triggerHaptic(15);
  };

  const getLineCount = (text: string) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split('\n').filter(line => line.trim() && !line.includes('(Sample list)')).length;
  };

  return (
    <div className="space-y-4 pb-14 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {QUADRANTS.map((quadrant) => {
          const content = data[quadrant.key] || '';
          const lineCount = getLineCount(content);

          return (
            <div key={quadrant.key} className="neo-card overflow-hidden">
              {/* Header Area */}
              <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    {quadrant.title}
                  </h3>
                  <span className={`text-xs font-bold ${quadrant.badgeBg}`}>
                    {lineCount === 0 ? 'No tasks' : lineCount === 1 ? '1 task active' : `${lineCount} tasks active`}
                  </span>
                </div>

                <button
                  onClick={() => addBullet(quadrant.key)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] hover:bg-[#ff5e1a] hover:text-white text-[var(--text-primary)] border border-[var(--border-soft)] text-xs font-extrabold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Bullet</span>
                </button>
              </div>

              {/* Edge-to-edge expanded typing canvas with distinct background & zero side margins */}
              <div className="w-full bg-[var(--bg-main)]/70 dark:bg-[var(--bg-main)] border-t border-[var(--border-soft)] px-4 py-3.5 focus-within:bg-[var(--bg-main)] transition-colors">
                <AutoExpandingTextarea
                  value={content}
                  onChange={(val) => handleChange(quadrant.key, val)}
                  placeholder={`Plan for ${quadrant.title.toLowerCase()}...`}
                  minHeight={75}
                  className="w-full bg-transparent text-[var(--text-primary)] p-0 outline-none text-xs sm:text-sm font-bold leading-relaxed transition-colors border-none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
