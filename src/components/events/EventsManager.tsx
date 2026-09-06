import React, { useState, useEffect } from 'react';
import { AppEvent, ReminderOption, EventRepeatType } from '../../types';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { NotificationService } from '../../services/notificationService';
import { AddEventModal } from './AddEventModal';
import { EventReminderModal } from './EventReminderModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { Illustration3DCalendar } from '../illustrations/3DIllustrations';
import { Plus, Trash2, Clock, Bell, Repeat } from 'lucide-react';

export function getNextEventDate(isoString: string, repeat?: EventRepeatType): Date {
  const orig = new Date(isoString);
  if (isNaN(orig.getTime())) return new Date();
  if (!repeat || repeat === 'none') return orig;

  const now = new Date();
  const current = new Date(orig);

  if (repeat === 'daily') {
    while (current.getTime() <= now.getTime()) {
      current.setDate(current.getDate() + 1);
    }
  } else if (repeat === 'weekly') {
    while (current.getTime() <= now.getTime()) {
      current.setDate(current.getDate() + 7);
    }
  } else if (repeat === 'monthly') {
    while (current.getTime() <= now.getTime()) {
      current.setMonth(current.getMonth() + 1);
    }
  }

  return current;
}

export const EventsManager: React.FC = () => {
  const [events, setEvents] = useState<AppEvent[]>(StorageService.getEvents());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AppEvent | null>(null);
  const [reminderModalEvent, setReminderModalEvent] = useState<AppEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<AppEvent | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const saveEvents = (updated: AppEvent[]) => {
    setEvents(updated);
    StorageService.saveEvents(updated);
  };

  const handleSaveEvent = (eventData: Omit<AppEvent, 'id' | 'createdAt'>) => {
    if (editingEvent) {
      const modified: AppEvent = {
        ...editingEvent,
        ...eventData,
      };
      const updated = events.map(e => e.id === editingEvent.id ? modified : e);
      saveEvents(updated);
      NotificationService.cancelEventAlarms(editingEvent.id);
      NotificationService.scheduleEventAlarms(modified);
      setEditingEvent(null);
    } else {
      const newEvent: AppEvent = {
        ...eventData,
        id: 'event_' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      saveEvents([newEvent, ...events]);
      NotificationService.scheduleEventAlarms(newEvent);
    }
    soundService.triggerHaptic(20);
  };

  const handleOpenEdit = (event: AppEvent) => {
    soundService.triggerHaptic(15);
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const executeDeleteEvent = () => {
    if (!eventToDelete) return;
    NotificationService.cancelEventAlarms(eventToDelete.id);
    const updated = events.filter(e => e.id !== eventToDelete.id);
    saveEvents(updated);
    soundService.triggerHaptic(20);
    setEventToDelete(null);
  };

  const handleUpdateReminders = (eventId: string, reminders: ReminderOption[]) => {
    const updated = events.map(e => {
      if (e.id === eventId) {
        const modified = { ...e, reminders };
        NotificationService.scheduleEventAlarms(modified);
        return modified;
      }
      return e;
    });
    saveEvents(updated);
    soundService.triggerHaptic(25);
    setReminderModalEvent(null);
  };

  const upcomingEvents = events
    .map(e => {
      const nextDate = getNextEventDate(e.dateTime, e.repeat);
      return {
        ...e,
        effectiveDate: nextDate.toISOString().slice(0, 16),
        effectiveTime: nextDate.getTime(),
      };
    })
    .filter(e => e.effectiveTime >= now)
    .sort((a, b) => a.effectiveTime - b.effectiveTime);

  const nextEvent = upcomingEvents[0];

  const getCountdownString = (targetIso: string) => {
    const diff = Math.max(0, new Date(targetIso).getTime() - now);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatEventDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full space-y-4 pb-24 relative font-sans">
      {/* 1. NEXT EVENT (Flat Header without card) */}
      {nextEvent ? (
        <div
          onClick={() => handleOpenEdit(nextEvent)}
          className="w-full px-1 py-1 cursor-pointer active:opacity-80 transition-opacity block"
        >
          <div className="flex items-center justify-between gap-3 w-full">
            {/* Left: 2 Lines (Line 1: "Next Event", Line 2: Event Title) */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-[#ff5e1a]">
                Next Event
              </p>
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate">
                {nextEvent.title}
              </h2>
            </div>

            {/* Right: Live Countdown */}
            <div className="shrink-0 flex items-center">
              <div className="px-3 py-1.5 rounded-2xl bg-[#ff5e1a]/10 border border-[#ff5e1a]/25 flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#ff5e1a] whitespace-nowrap shadow-sm min-w-[92px] justify-center tabular-nums">
                <Clock className="w-3.5 h-3.5 animate-pulse shrink-0" />
                <span className="tabular-nums font-mono">in {getCountdownString(nextEvent.effectiveDate)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. UPCOMING EVENTS FEED */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
            Upcoming Events ({upcomingEvents.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {upcomingEvents.map((event) => {
            const reminderCount = event.reminders?.length || 1;
            return (
              <div
                key={event.id}
                onClick={() => handleOpenEdit(event)}
                className="neo-card p-4 sm:p-5 flex flex-col justify-between min-h-[120px] cursor-pointer hover:border-[#ff5e1a]/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff5e1a] bg-[#ff5e1a]/10 px-2 py-0.5 rounded-full">
                        {event.category}
                      </span>
                      {event.repeat && event.repeat !== 'none' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>{event.repeat}</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReminderModalEvent(event);
                        }}
                        className="p-1.5 rounded-xl bg-[var(--bg-main)] hover:border-[#ff5e1a] border border-[var(--border-soft)] text-[var(--text-primary)] hover:text-[#ff5e1a] transition-all flex items-center gap-1"
                        title="Configure Reminders"
                      >
                        <Bell className="w-3.5 h-3.5 text-[#ff5e1a]" />
                        <span className="text-[10px] font-black">{reminderCount}</span>
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventToDelete(event);
                        }} 
                        className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 rounded-xl hover:bg-[var(--bg-main)] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-black text-[var(--text-primary)] leading-snug">
                    {event.title}
                  </h4>
                  {event.location && (
                    <p className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">
                      {event.location}
                    </p>
                  )}
                </div>

                <div className="pt-2.5 mt-2 border-t border-[var(--border-soft)] flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                  <span>{formatEventDate(event.effectiveDate)}</span>
                  <span className="text-[10px] text-[#ff5e1a] font-black">Tap to edit</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. EXTENDED LONG FAB */}
      <div className="fixed bottom-6 left-0 right-0 max-w-4xl mx-auto px-5 pointer-events-none flex justify-end z-30">
        <button
          onClick={() => {
            soundService.triggerHaptic(15);
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
          className="neo-btn-orange pointer-events-auto px-6 py-3.5 flex items-center gap-2 text-sm font-black shadow-2xl active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>New Event</span>
        </button>
      </div>

      {isModalOpen && (
        <AddEventModal
          key={editingEvent ? editingEvent.id : 'new'}
          isOpen={isModalOpen}
          initialEvent={editingEvent}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
        />
      )}

      {reminderModalEvent && (
        <EventReminderModal
          isOpen={!!reminderModalEvent}
          onClose={() => setReminderModalEvent(null)}
          eventTitle={reminderModalEvent.title}
          currentReminders={reminderModalEvent.reminders || ['on_time']}
          onSave={(rems) => handleUpdateReminders(reminderModalEvent.id, rems)}
        />
      )}

      {/* Custom Confirmation Popup for Event Delete */}
      <ConfirmModal
        isOpen={!!eventToDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${eventToDelete?.title}"?`}
        onConfirm={executeDeleteEvent}
        onCancel={() => setEventToDelete(null)}
      />
    </div>
  );
};
