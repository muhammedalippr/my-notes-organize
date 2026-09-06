import React, { useState, useEffect } from 'react';
import { ReminderOption } from '../../types';
import { REMINDER_SELECTIONS } from './AddEventModal';
import { backButtonService } from '../../services/soundService';
import { X, Bell, Check } from 'lucide-react';

interface EventReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  currentReminders: ReminderOption[];
  onSave: (reminders: ReminderOption[]) => void;
}

export const EventReminderModal: React.FC<EventReminderModalProps> = ({
  isOpen,
  onClose,
  eventTitle,
  currentReminders,
  onSave,
}) => {
  const [selected, setSelected] = useState<ReminderOption[]>(currentReminders || ['on_time']);

  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonService.register('event-reminder-modal', () => {
      onClose();
      return true;
    }, 100);
    return unregister;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleOption = (optId: ReminderOption) => {
    setSelected(prev => 
      prev.includes(optId) ? prev.filter(r => r !== optId) : [...prev, optId]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === REMINDER_SELECTIONS.length) {
      setSelected([]);
    } else {
      setSelected(REMINDER_SELECTIONS.map(r => r.id));
    }
  };

  const handleSave = () => {
    onSave(selected.length > 0 ? selected : ['on_time']);
    onClose();
  };

  return (
    <div className="modal-overlay flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)]">
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-4 h-4 text-[#ff5e1a] shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-black text-[var(--text-primary)] truncate">
                Reminders
              </h3>
              <p className="text-[11px] font-bold text-[var(--text-secondary)] truncate">
                {eventTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
              Selected ({selected.length})
            </span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-black text-[#ff5e1a] hover:underline"
            >
              {selected.length === REMINDER_SELECTIONS.length ? 'Clear All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2">
            {REMINDER_SELECTIONS.map(opt => {
              const isSelected = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleOption(opt.id)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-98 ${
                    isSelected
                      ? 'border-[#ff5e1a] bg-[#ff5e1a]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-soft)] bg-[var(--bg-main)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span className="text-xs font-black">{opt.label}</span>
                  <span className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#ff5e1a] border-[#ff5e1a] text-white' : 'border-[var(--border-soft)] bg-[var(--bg-surface)]'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-secondary)] font-black text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#ff5e1a] text-white font-black text-xs shadow-lg shadow-[#ff5e1a]/30 hover:bg-[#e54c09] transition-colors"
            >
              Save Alarms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
