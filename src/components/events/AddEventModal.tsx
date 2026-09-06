import React, { useState, useEffect } from 'react';
import { AppEvent, ReminderOption, EventRepeatType } from '../../types';
import { soundService, backButtonService } from '../../services/soundService';
import { X, Check, Calendar, Clock, MapPin, Tag, Bell, SlidersHorizontal, ChevronDown, Repeat } from 'lucide-react';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<AppEvent, 'id' | 'createdAt'>) => void;
  initialEvent?: AppEvent | null;
}

const CATEGORIES = [
  'Event',
  'Wedding',
  'Function',
  'Birthday',
  'Celebration',
  'Meeting',
  'Work',
  'Personal',
  'Travel',
  'Health',
  'Finance',
];

export const REMINDER_SELECTIONS: { id: ReminderOption; label: string }[] = [
  { id: 'prev_night_9pm', label: 'Previous day night 9pm' },
  { id: 'morning_7am', label: 'Morning 7 am' },
  { id: '1hr_before', label: '1 hr before' },
  { id: '30min_before', label: '30 min before' },
  { id: 'on_time', label: 'On time' },
];

const REPEAT_OPTIONS: { id: EventRepeatType; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent = null,
}) => {
  const getTomorrowDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const DEFAULT_REMINDERS: ReminderOption[] = ['prev_night_9pm', '1hr_before', 'on_time'];

  const [title, setTitle] = useState(initialEvent ? initialEvent.title : '');
  const [dateTime, setDateTime] = useState(initialEvent ? initialEvent.dateTime.slice(0, 16) : getTomorrowDateTime());
  const [category, setCategory] = useState(initialEvent ? (initialEvent.category || 'Event') : 'Event');
  const [isRepeating, setIsRepeating] = useState(!!initialEvent?.repeat && initialEvent.repeat !== 'none');
  const [repeatFrequency, setRepeatFrequency] = useState<EventRepeatType>(
    initialEvent?.repeat && initialEvent.repeat !== 'none' ? initialEvent.repeat : 'daily'
  );
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [reminders, setReminders] = useState<ReminderOption[]>(
    initialEvent?.reminders && initialEvent.reminders.length > 0 ? initialEvent.reminders : DEFAULT_REMINDERS
  );
  const [notes, setNotes] = useState(initialEvent?.notes || '');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(!!(initialEvent?.location || initialEvent?.notes));

  React.useLayoutEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDateTime(initialEvent.dateTime.slice(0, 16));
      setCategory(initialEvent.category || 'Event');
      setIsRepeating(!!initialEvent.repeat && initialEvent.repeat !== 'none');
      setRepeatFrequency(initialEvent.repeat && initialEvent.repeat !== 'none' ? initialEvent.repeat : 'daily');
      setLocation(initialEvent.location || '');
      setReminders(initialEvent.reminders && initialEvent.reminders.length > 0 ? initialEvent.reminders : DEFAULT_REMINDERS);
      setNotes(initialEvent.notes || '');
      setIsAdvancedOpen(!!(initialEvent.location || initialEvent.notes));
    } else {
      setTitle('');
      setDateTime(getTomorrowDateTime());
      setCategory('Event');
      setIsRepeating(false);
      setRepeatFrequency('daily');
      setLocation('');
      setReminders(DEFAULT_REMINDERS);
      setNotes('');
      setIsAdvancedOpen(false);
    }
  }, [initialEvent]);

  // Handle hardware back button when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonService.register('add-event-modal', () => {
      onClose();
      return true;
    }, 100);
    return unregister;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleReminder = (optId: ReminderOption) => {
    setReminders(prev => 
      prev.includes(optId) ? prev.filter(r => r !== optId) : [...prev, optId]
    );
  };

  const toggleSelectAll = () => {
    if (reminders.length === REMINDER_SELECTIONS.length) {
      setReminders([]);
    } else {
      setReminders(REMINDER_SELECTIONS.map(r => r.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateTime) return;

    onSave({
      title: title.trim(),
      dateTime,
      category,
      repeat: isRepeating ? repeatFrequency : 'none',
      location: location.trim() || undefined,
      reminderMinutesBefore: 0,
      reminders: reminders.length > 0 ? reminders : DEFAULT_REMINDERS,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setLocation('');
    setNotes('');
    setIsRepeating(false);
    setRepeatFrequency('daily');
    setReminders(DEFAULT_REMINDERS);
    onClose();
  };

  return (
    <div className="modal-overlay flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#ff5e1a]" />
            <h3 className="text-base font-black text-[var(--text-primary)]">
              {initialEvent ? 'Edit Event' : 'Schedule New Event'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Event Title */}
          <div>
            <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Client Strategy Call, Flight to Delhi..."
              className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-soft)] focus:border-[#ff5e1a]/50 outline-none text-sm font-bold transition-all"
            />
          </div>

          {/* Date & Time Picker */}
          <div>
            <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-soft)] focus:border-[#ff5e1a]/50 outline-none text-sm font-black transition-all"
            />
          </div>

          {/* Category Selection (Moved above Advanced Options) */}
          <div>
            <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                    category === cat
                      ? 'bg-[#ff5e1a] text-white border-[#ff5e1a]'
                      : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Repeating Event Option */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-soft)] space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-[#ff5e1a]" />
                <div>
                  <span className="text-xs font-black text-[var(--text-primary)]">Repeating Event</span>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)]">Repeat this event automatically</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRepeating}
                onChange={(e) => setIsRepeating(e.target.checked)}
                className="w-4 h-4 rounded accent-[#ff5e1a] cursor-pointer"
              />
            </label>

            {isRepeating && (
              <div className="pt-2 border-t border-[var(--border-soft)] animate-in fade-in slide-in-from-top-1 duration-150">
                <span className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Repeat Frequency
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {REPEAT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRepeatFrequency(opt.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-black border transition-all text-center ${
                        repeatFrequency === opt.id
                          ? 'bg-[#ff5e1a] text-white border-[#ff5e1a] shadow-md shadow-[#ff5e1a]/20'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Options Toggle Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full py-2.5 px-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-primary)] flex items-center justify-between text-xs font-black transition-all border border-[var(--border-soft)]"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff5e1a]" />
                <span>Advanced Options</span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                  ({reminders.length} reminder{reminders.length !== 1 ? 's' : ''})
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 ${
                isAdvancedOpen ? 'rotate-180 text-[#ff5e1a]' : ''
              }`} />
            </button>
          </div>

          {/* Expandable Advanced Section */}
          {isAdvancedOpen && (
            <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Multi-Select Reminders Section */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-soft)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#ff5e1a]" />
                    <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">
                      Reminders ({reminders.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-[11px] font-black text-[#ff5e1a] hover:underline"
                  >
                    {reminders.length === REMINDER_SELECTIONS.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {REMINDER_SELECTIONS.map(opt => {
                    const isSelected = reminders.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleReminder(opt.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-[#ff5e1a] bg-[#ff5e1a]/10 text-[var(--text-primary)]'
                            : 'border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isSelected ? 'bg-[#ff5e1a] border-[#ff5e1a] text-white' : 'border-[var(--border-soft)]'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Location / Link (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Office Room 4 or Zoom link"
                  className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] px-4 py-2.5 rounded-2xl border border-[var(--border-soft)] focus:border-[#ff5e1a]/50 outline-none text-sm font-bold transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add details, agenda, or checklist..."
                  rows={2}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] px-4 py-2.5 rounded-2xl border border-[var(--border-soft)] focus:border-[#ff5e1a]/50 outline-none text-sm font-medium transition-all resize-none"
                />
              </div>

              {/* Collapse/Hide Button inside section */}
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(false)}
                className="w-full py-2 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-secondary)] text-[11px] font-bold transition-colors"
              >
                ▲ Hide Advanced Options
              </button>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-secondary)] font-black text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-[#ff5e1a] text-white font-black text-xs shadow-lg shadow-[#ff5e1a]/30 hover:bg-[#e54c09] transition-colors"
            >
              {initialEvent ? 'Update Event' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
