import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { ConfirmModal } from '../common/ConfirmModal';
import { Trash2 } from 'lucide-react';

export const Notepad: React.FC = () => {
  const [content, setContent] = useState<string>(StorageService.getNotepad());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleChange = (newVal: string) => {
    setContent(newVal);
    StorageService.saveNotepad(newVal);
  };

  const handleClear = () => {
    handleChange('');
    soundService.triggerHaptic(20);
    setIsConfirmOpen(false);
  };

  return (
    <div className="space-y-4 pb-14 font-sans">
      {/* NEO EDITOR CANVAS */}
      <div className="neo-card p-6 border-[#ff5e1a]/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
            Instant Autosave
          </span>
          {content.length > 0 && (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="text-xs font-bold text-[var(--text-secondary)] hover:text-rose-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Start typing your thoughts here..."
          className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] p-5 rounded-2xl border border-[var(--border-soft)] outline-none text-sm font-medium resize-none min-h-[360px] leading-relaxed transition-colors"
        />
      </div>

      {/* Custom Confirmation Popup for Notepad Clear */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Clear Notepad"
        message="Are you sure you want to clear all text in your quick notepad?"
        confirmLabel="Clear"
        onConfirm={handleClear}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
