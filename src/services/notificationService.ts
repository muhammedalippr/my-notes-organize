import { AppEvent, ReminderOption } from '../types';
import { soundService } from './soundService';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface CountdownInfo {
  nextEvent: AppEvent | null;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isDue: boolean;
  formattedText: string;
}

export const NotificationService = {
  // Request notification and exact alarm permission
  async requestPermission(): Promise<boolean> {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') return true;
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
      return false;
    }
  },

  // Calculate schedule dates for each selected reminder option
  calculateReminderDates(eventDateTimeIso: string, options: ReminderOption[]): { option: ReminderOption; date: Date }[] {
    const eventDate = new Date(eventDateTimeIso);
    if (isNaN(eventDate.getTime())) return [];

    const results: { option: ReminderOption; date: Date }[] = [];
    const now = new Date();

    options.forEach(opt => {
      let remDate: Date | null = null;

      if (opt === 'on_time') {
        remDate = new Date(eventDate);
      } else if (opt === '30min_before') {
        remDate = new Date(eventDate.getTime() - 30 * 60 * 1000);
      } else if (opt === '1hr_before') {
        remDate = new Date(eventDate.getTime() - 60 * 60 * 1000);
      } else if (opt === 'morning_7am') {
        // 7:00 AM on the day of the event
        remDate = new Date(eventDate);
        remDate.setHours(7, 0, 0, 0);
      } else if (opt === 'prev_night_9pm') {
        // 9:00 PM on the previous day
        remDate = new Date(eventDate);
        remDate.setDate(remDate.getDate() - 1);
        remDate.setHours(21, 0, 0, 0);
      }

      // Only schedule if the reminder time is in the future
      if (remDate && remDate.getTime() > now.getTime()) {
        results.push({ option: opt, date: remDate });
      }
    });

    return results;
  },

  // Schedule native Android AlarmManager notifications for an event
  async scheduleEventAlarms(event: AppEvent) {
    try {
      await this.requestPermission();
      
      const reminders = event.reminders && event.reminders.length > 0 
        ? event.reminders 
        : (['on_time'] as ReminderOption[]);

      const nextOccurDate = event.repeat && event.repeat !== 'none'
        ? (() => {
            const orig = new Date(event.dateTime);
            const now = new Date();
            const curr = new Date(orig);
            if (event.repeat === 'daily') {
              while (curr.getTime() <= now.getTime()) curr.setDate(curr.getDate() + 1);
            } else if (event.repeat === 'weekly') {
              while (curr.getTime() <= now.getTime()) curr.setDate(curr.getDate() + 7);
            } else if (event.repeat === 'monthly') {
              while (curr.getTime() <= now.getTime()) curr.setMonth(curr.getMonth() + 1);
            }
            return curr.toISOString().slice(0, 16);
          })()
        : event.dateTime;

      const reminderSchedules = this.calculateReminderDates(nextOccurDate, reminders);
      if (reminderSchedules.length === 0) return;

      // Hash event ID to numeric base ID for Capacitor LocalNotifications
      const baseId = Math.abs(this.hashCode(event.id)) % 100000;

      // Ensure high-priority Alarm channel is created on Android
      try {
        await LocalNotifications.createChannel({
          id: 'alarm_channel',
          name: 'Events & Todo Alarms',
          description: 'High priority alarms and reminders',
          importance: 5, // NotificationManager.IMPORTANCE_HIGH
          visibility: 1, // NotificationCompat.VISIBILITY_PUBLIC
          sound: 'default',
          vibration: true,
          lights: true,
        });
      } catch {}

      const notifications = reminderSchedules.map((item, idx) => {
        let label = 'Event starting now';
        if (item.option === '30min_before') label = 'Starting in 30 minutes';
        if (item.option === '1hr_before') label = 'Starting in 1 hour';
        if (item.option === 'morning_7am') label = 'Today at ' + new Date(nextOccurDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (item.option === 'prev_night_9pm') label = 'Tomorrow at ' + new Date(nextOccurDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const scheduleConfig: any = { at: item.date, allowWhileIdle: true };
        if (event.repeat === 'daily') scheduleConfig.every = 'day';
        if (event.repeat === 'weekly') scheduleConfig.every = 'week';
        if (event.repeat === 'monthly') scheduleConfig.every = 'month';

        return {
          id: baseId + idx + 1,
          title: event.title,
          body: `${label}${event.location ? ` • ${event.location}` : ''}`,
          schedule: scheduleConfig,
          sound: 'default',
          channelId: 'alarm_channel',
          smallIcon: 'ic_stat_name',
          actionTypeId: '',
          extra: { eventId: event.id, option: item.option }
        };
      });

      await LocalNotifications.schedule({ notifications });
    } catch (err) {
      console.warn('Native alarm schedule failed, falling back:', err);
    }
  },

  // Cancel scheduled alarms for an event
  async cancelEventAlarms(eventId: string) {
    try {
      const baseId = Math.abs(this.hashCode(eventId)) % 100000;
      const idsToCancel = [1, 2, 3, 4, 5, 6].map(offset => ({ id: baseId + offset }));
      await LocalNotifications.cancel({ notifications: idsToCancel });
    } catch {
      // Ignored
    }
  },

  hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  },

  // Send system notification
  sendNotification(title: string, body: string) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
        });
      } catch {
        // Fallback
      }
    }
  },

  // Calculate live countdown to the closest upcoming event
  calculateCountdown(events: AppEvent[]): CountdownInfo {
    const now = new Date().getTime();
    
    // Filter strictly future events and sort ascending by date
    const upcoming = events
      .map(e => ({ event: e, time: new Date(e.dateTime).getTime() }))
      .filter(item => !isNaN(item.time) && item.time > now)
      .sort((a, b) => a.time - b.time);

    if (upcoming.length === 0) {
      return {
        nextEvent: null,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isDue: false,
        formattedText: 'No upcoming events scheduled',
      };
    }

    const next = upcoming[0];
    const diff = next.time - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let formatted = '';
    if (days > 0) {
      formatted = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes}m ${seconds}s`;
    } else {
      formatted = `${minutes}m ${seconds}s`;
    }

    return {
      nextEvent: next.event,
      days,
      hours,
      minutes,
      seconds,
      isDue: diff <= 0,
      formattedText: formatted,
    };
  },

  // Check today's todo reminder
  checkTodayTodoReminder(reminderTime: string, todayText: string): boolean {
    if (!reminderTime || !todayText || todayText.trim().length === 0) return false;
    
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    if (currentTime === reminderTime) {
      this.sendNotification(
        "Today's Tasks Pending",
        `You have tasks remaining in your Today's list:\n${todayText.trim().slice(0, 100)}...`
      );
      soundService.playAlarmChime();
      soundService.triggerHaptic([100, 50, 100]);
      return true;
    }
    return false;
  }
};
