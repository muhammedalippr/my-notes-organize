// Web Audio API lightweight sound synthesizer (offline, native, zero audio file downloads)

import { AlertSoundType } from '../types';

class SoundService {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play subtle crisp completion chime (disabled)
  playCompleteSound() {
    // Sound effect removed per user request
  }

  private customAudio: HTMLAudioElement | null = null;
  private activeOscillators: OscillatorNode[] = [];

  // Stop currently playing long synthesized tones or custom audio
  stopAllAlerts() {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.currentTime = 0;
      this.customAudio = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];
  }

  // Play selected alarm tone for events or reminder
  playAlarmChime(toneType: AlertSoundType = 'chime', customDataUri?: string) {
    try {
      this.stopAllAlerts();

      // If custom user sound selected from storage
      if (toneType === 'custom' || customDataUri) {
        if (customDataUri) {
          this.customAudio = new Audio(customDataUri);
          this.customAudio.play().catch(() => {});
          return;
        }
      }

      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (toneType === 'digital') {
        // Crisp dual digital beeps
        [880, 880, 1174.66].forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + index * 0.1);
          gain.gain.setValueAtTime(0.08, now + index * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + index * 0.1);
          osc.stop(now + index * 0.1 + 0.08);
        });
      } else if (toneType === 'celeste') {
        // Sparkling Celeste / Music Box
        [587.33, 739.99, 880.00, 1174.66, 1479.98].forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + index * 0.09);
          gain.gain.setValueAtTime(0.18, now + index * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.09 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + index * 0.09);
          osc.stop(now + index * 0.09 + 0.45);
        });
      } else if (toneType === 'multi_alarm') {
        // Multi-Alarm: 4 bursts (~3.6 seconds)
        for (let burst = 0; burst < 4; burst++) {
          const burstStart = now + burst * 0.9;
          [800, 1000, 800, 1000].forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(f, burstStart + idx * 0.1);
            gain.gain.setValueAtTime(0.09, burstStart + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, burstStart + idx * 0.1 + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(burstStart + idx * 0.1);
            osc.stop(burstStart + idx * 0.1 + 0.08);
          });
        }
      } else if (toneType === 'long_30s_marimba') {
        // 30s Long Alert 1: Warm Marimba Rhythmic Flow (30 seconds)
        const notes = [440, 554.37, 659.25, 880, 659.25, 554.37];
        const noteStep = 0.14;
        const patternLength = notes.length * noteStep;
        const totalLoops = Math.ceil(30 / patternLength);
        for (let l = 0; l < totalLoops; l++) {
          notes.forEach((freq, idx) => {
            const time = now + l * patternLength + idx * noteStep;
            if (time < now + 30) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, time);
              gain.gain.setValueAtTime(0.2, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(time);
              osc.stop(time + 0.3);
              this.activeOscillators.push(osc);
            }
          });
        }
      } else if (toneType === 'long_30s_alarm') {
        // 30s Long Alert 2: Rhythmic high-urgency multi-beep alarm (30 seconds)
        const cycles = 30; // 1 cycle per second
        for (let c = 0; c < cycles; c++) {
          const cycleStart = now + c * 1.0;
          [900, 1100, 900, 1100].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            const noteStart = cycleStart + idx * 0.12;
            osc.frequency.setValueAtTime(freq, noteStart);
            gain.gain.setValueAtTime(0.08, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.09);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(noteStart);
            osc.stop(noteStart + 0.09);
            this.activeOscillators.push(osc);
          });
        }
      } else if (toneType === 'long_30s_melody') {
        // 30s Long Alert 3: Ambient orchestral bell loop (30 seconds)
        const sequence = [
          { f: 523.25, d: 0.35 },
          { f: 659.25, d: 0.35 },
          { f: 783.99, d: 0.45 },
          { f: 1046.50, d: 0.55 },
          { f: 880.00, d: 0.4 },
          { f: 1046.50, d: 0.4 },
          { f: 1174.66, d: 0.5 },
          { f: 1318.51, d: 0.8 },
        ];
        const loopLength = 3.8;
        const totalLoops = Math.ceil(30 / loopLength);
        for (let loop = 0; loop < totalLoops; loop++) {
          let offset = loop * loopLength;
          if (offset >= 30) break;
          sequence.forEach((note) => {
            const noteTime = now + offset;
            if (offset < 30) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(note.f, noteTime);
              gain.gain.setValueAtTime(0, noteTime);
              gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.03);
              gain.gain.exponentialRampToValueAtTime(0.001, noteTime + note.d);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(noteTime);
              osc.stop(noteTime + note.d);
              this.activeOscillators.push(osc);
            }
            offset += note.d * 0.8;
          });
        }
      } else {
        // Bell Chime (default)
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + index * 0.15);
          gain.gain.setValueAtTime(0.18, now + index * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.15 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + index * 0.15);
          osc.stop(now + index * 0.15 + 0.5);
        });
      }
    } catch {
      // Audio not permitted
    }
  }

  // Trigger subtle device vibration if supported
  triggerHaptic(pattern: number | number[] = 30) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignored
      }
    }
  }

  triggerNotificationHaptic() {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 60, 40]);
      }
    } catch (e) {}
  }
}

export const soundService = new SoundService();

// ==========================================
// Centralized Physical / Browser Back Button Service
// ==========================================
export type BackHandler = () => boolean | Promise<boolean>;

interface RegisteredHandler {
  id: string;
  priority: number;
  handler: BackHandler;
}

class BackButtonService {
  private handlers: RegisteredHandler[] = [];

  /**
   * Register a back button handler.
   * Return `true` if handled and event should NOT bubble.
   * Return `false` to pass to lower-priority handlers.
   * Priority: higher executed first (e.g., 100 for modals, 50 for editors).
   */
  register(id: string, handler: BackHandler, priority: number = 50): () => void {
    this.handlers = this.handlers.filter(h => h.id !== id);
    this.handlers.push({ id, handler, priority });
    this.handlers.sort((a, b) => b.priority - a.priority);

    return () => {
      this.unregister(id);
    };
  }

  unregister(id: string) {
    this.handlers = this.handlers.filter(h => h.id !== id);
  }

  async handleBack(): Promise<boolean> {
    for (const item of this.handlers) {
      try {
        const handled = await item.handler();
        if (handled) {
          return true;
        }
      } catch (err) {
        console.error('Error in back handler ' + item.id + ':', err);
      }
    }
    return false;
  }
}

export const backButtonService = new BackButtonService();
