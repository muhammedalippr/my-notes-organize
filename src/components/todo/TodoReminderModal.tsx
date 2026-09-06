import React, { useState, useEffect } from 'react';
import { soundService, backButtonService } from '../../services/soundService';
import { X, Bell, Calendar, Clock, Check } from 'lucide-react';

interface TodoReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  initialEnabled: boolean;
  initialDateTime: string;
  onSave: (enabled: boolean, dateTime: string) => void;
}

export const TodoReminderModal: React.FC<TodoReminderModalProps> = ({
  isOpen,
  onClose,
  sectionTitle,
  initialEnabled,
  initialDateTime,
  onSave,
}) => {
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [enabled, setEnabled] = useState(initialEnabled);
  const [dateTime, setDateTime] = useState(initialDateTime || getDefaultDateTime());

  React.useLayoutEffect(() => {
    setEnabled(initialEnabled);
    setDateTime(initialDateTime || getDefaultDateTime());
  }, [initialEnabled, initialDateTime, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonService.register('todo-reminder-modal', () => {
      onClose();
      return true;
    }, 100);
    return unregister;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    soundService.triggerHaptic(20);
    onSave(enabled, dateTime);
    onClose();
  };

  return (
    <div className="modal-overlay flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ff5e1a]/15 text-[#ff5e1a] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)]">
                {sectionTitle} Reminder
              </h3>
              <p className="text-[10px] font-bold text-[var(--text-secondary)]">Set exact alarm & notification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Toggle On/Off Switch */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-soft)] flex items-center justify-between">
            <span className="text-xs font-black text-[var(--text-primary)]">Enable Reminder</span>
            <button
              type="button"
              onClick={() => {
                soundService.triggerHaptic(15);
                setEnabled(!enabled);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                enabled ? 'bg-[#ff5e1a]' : 'bg-[var(--border-soft)]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Date & Time Picker */}
          {enabled && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <label className="block text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                Reminder Date & Time
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-soft)] focus:border-[#ff5e1a]/50 outline-none text-xs font-black transition-all"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--bg-main)] text-[var(--text-secondary)] font-black text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#ff5e1a] text-white font-black text-xs shadow-lg shadow-[#ff5e1a]/30 hover:bg-[#e54c09] transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
