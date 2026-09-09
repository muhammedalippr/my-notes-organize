import React, { useState } from 'react';
import { AppSettings, ModuleKey } from '../../types';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { ConfirmModal } from '../common/ConfirmModal';
import { Toast } from '../common/Toast';
import { 
  Download, 
  Upload, 
  Sun, 
  Moon,
  SunMoon,
  Layers,
  RotateCcw,
  Volume2,
  FolderOpen
} from 'lucide-react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { AuthService } from '../../services/authService';

interface SettingsPageProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  onRefreshData: () => void;
}

const MODULE_DEFINITIONS: { key: ModuleKey; label: string }[] = [
  { key: 'horizon_todo', label: 'Todo List' },
  { key: 'eisenhower', label: '4 Quadrants' },
  { key: 'shopping', label: 'Shopping List' },
  { key: 'events', label: 'Events & Alarms' },
  { key: 'finance', label: 'Finance' },
  { key: 'notes', label: 'Custom Notes' },
  { key: 'mindmap', label: 'Mind Map' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  setSettings,
  onRefreshData,
}) => {
  const [backupInfo, setBackupInfo] = useState(StorageService.getLocalBackupInfo());
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleCreateLocalSnapshot = async () => {
    const authenticated = await AuthService.authenticate('Authenticate to create backup snapshot');
    if (!authenticated) return;

    StorageService.createManualBackup();
    setBackupInfo(StorageService.getLocalBackupInfo());
    soundService.playCompleteSound();
    setBackupSuccess('Snapshot saved');
    setTimeout(() => setBackupSuccess(null), 2500);
  };

  const handleOpenRestoreConfirm = async () => {
    const authenticated = await AuthService.authenticate('Authenticate to restore backup data');
    if (!authenticated) return;

    setIsRestoreConfirmOpen(true);
  };

  const executeRestoreLocalSnapshot = () => {
    const success = StorageService.restoreDailyBackup();
    if (success) {
      setSettings(StorageService.getSettings());
      onRefreshData();
      soundService.playCompleteSound();
      setBackupSuccess('Snapshot restored');
      setTimeout(() => setBackupSuccess(null), 2500);
    } else {
      alert('No saved snapshot found to restore.');
    }
    setIsRestoreConfirmOpen(false);
  };

  const toggleModule = (key: ModuleKey) => {
    const currentVal = settings.enabledModules[key] !== false;
    const updated = {
      ...settings,
      enabledModules: {
        ...settings.enabledModules,
        [key]: !currentVal,
      },
    };
    updateSettings(updated);
  };

  const handleExportBackup = async () => {
    const authenticated = await AuthService.authenticate('Authenticate to export backup file');
    if (!authenticated) return;

    const json = StorageService.exportBackup();
    const fileName = `my_notes_backup_${new Date().toISOString().slice(0, 10)}.json`;

    try {
      // 1. Write file to Cache/Documents
      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data: json,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      // 2. Open native Android system share/save sheet so user can choose 'Save to Downloads / Files'
      const canShare = await Share.canShare();
      if (canShare.value && writeResult.uri) {
        await Share.share({
          title: 'Export My Notes Backup',
          text: `My Notes Backup JSON (${new Date().toISOString().slice(0, 10)})`,
          url: writeResult.uri,
          dialogTitle: 'Save / Share Backup JSON',
        });
      }

      soundService.playCompleteSound();
      setBackupSuccess('Saved to Downloads');
      setTimeout(() => setBackupSuccess(null), 3000);
    } catch (fsErr) {
      console.log('Export backup fallback notice:', fsErr);
      // Web browser download fallback
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      
      soundService.playCompleteSound();
      setBackupSuccess('Saved to Downloads');
      setTimeout(() => setBackupSuccess(null), 3000);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const authenticated = await AuthService.authenticate('Authenticate to import backup file');
    if (!authenticated) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && StorageService.importBackup(content)) {
        setSettings(StorageService.getSettings());
        onRefreshData();
        soundService.playCompleteSound();
        setBackupSuccess('Backup restored successfully');
        setTimeout(() => setBackupSuccess(null), 2500);
      } else {
        alert('Failed to import backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 pb-14 font-sans">
      
      {/* 1. THEME NEO CARD (Auto, Dark, Light) */}
      <div className="neo-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#ff5e1a]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
            Theme
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'system', label: 'Auto', icon: SunMoon },
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = (settings.theme || 'system') === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => updateSettings({ ...settings, theme: t.id as any })}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  isSelected 
                    ? 'border-[#ff5e1a] bg-[#ff5e1a] text-white shadow-lg shadow-[#ff5e1a]/30' 
                    : 'border-[var(--border-soft)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-black">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SOUND PALETTE DEFINITION HELPER */}
      {(() => {
        const soundOptions = [
          // Crisp Core Tones
          { id: 'chime', label: 'Bell Chime', group: 'Tones' },
          { id: 'digital', label: 'Digital Beep', group: 'Tones' },
          { id: 'celeste', label: 'Celeste Box', group: 'Tones' },
          { id: 'multi_alarm', label: 'Multi-Alarm (4s)', group: 'Tones' },
          // 3x 30-Second Long Alerts
          { id: 'long_30s_alarm', label: '⏰ Multi-Alarm (30s)', group: 'Long Alerts (30s)' },
          { id: 'long_30s_melody', label: '🎼 Orchestral Chime (30s)', group: 'Long Alerts (30s)' },
          { id: 'long_30s_marimba', label: '🎵 Marimba Rhythms (30s)', group: 'Long Alerts (30s)' },
          // Custom Storage Sound
          { id: 'custom', label: settings.customSoundName ? `🎵 ${settings.customSoundName}` : '📁 Custom Audio (Storage)', group: 'Custom' },
        ];

        const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>, targetSetting: 'alarmSound' | 'todoAlertSound') => {
          const file = e.target.files?.[0];
          if (!file) return;

          // Limit to max 5MB for storage performance
          if (file.size > 5 * 1024 * 1024) {
            alert('Please select an audio file under 5MB.');
            e.target.value = '';
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUri = event.target?.result as string;
            if (dataUri) {
              const updated = {
                ...settings,
                [targetSetting]: 'custom' as any,
                customSoundData: dataUri,
                customSoundName: file.name.replace(/\.[^/.]+$/, ''),
              };
              updateSettings(updated);
              soundService.playAlarmChime('custom', dataUri);
            }
          };
          reader.readAsDataURL(file);
          e.target.value = '';
        };

        const renderSoundGrid = (
          title: string,
          selectedSoundId: string,
          onSelect: (soundId: string) => void,
          fileInputId: string,
          targetSetting: 'alarmSound' | 'todoAlertSound'
        ) => (
          <div className="neo-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#ff5e1a]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                  {title}
                </h3>
              </div>
              <label
                htmlFor={fileInputId}
                className="w-8 h-8 rounded-xl bg-[#ff5e1a]/10 hover:bg-[#ff5e1a]/20 text-[#ff5e1a] flex items-center justify-center cursor-pointer transition-all active:scale-90"
                title="Select custom audio from device storage"
              >
                <FolderOpen className="w-4 h-4" />
              </label>
              <input
                id={fileInputId}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleCustomAudioUpload(e, targetSetting)}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {soundOptions.map((sound) => {
                const isSelected = selectedSoundId === sound.id;
                const isCustomOption = sound.id === 'custom';
                const hasCustomAudio = !!settings.customSoundData;

                return (
                  <button
                    key={sound.id}
                    type="button"
                    onClick={() => {
                      if (isCustomOption && !hasCustomAudio) {
                        // Trigger file chooser if custom selected but no audio loaded yet
                        document.getElementById(fileInputId)?.click();
                        return;
                      }
                      soundService.playAlarmChime(sound.id as any, isCustomOption ? settings.customSoundData : undefined);
                      onSelect(sound.id);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                      isSelected
                        ? 'border-[#ff5e1a] bg-[#ff5e1a]/10 text-[var(--text-primary)]'
                        : 'border-[var(--border-soft)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-xs font-black truncate pr-1">{sound.label}</span>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSelected ? 'bg-[#ff5e1a]' : 'bg-[var(--border-soft)]'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        );

        return (
          <>
            {/* EVENT ALERT SOUND */}
            {renderSoundGrid(
              'Event Alert Sound',
              settings.alarmSound || 'multi_alarm',
              (soundId) => updateSettings({ ...settings, alarmSound: soundId as any }),
              'custom-event-sound-input',
              'alarmSound'
            )}

            {/* TODO ALERT SOUND */}
            {renderSoundGrid(
              'Todo Alert Sound',
              settings.todoAlertSound || 'multi_alarm',
              (soundId) => updateSettings({ ...settings, todoAlertSound: soundId as any }),
              'custom-todo-sound-input',
              'todoAlertSound'
            )}
          </>
        );
      })()}

      {/* 4. ACTIVE MODULE VISIBILITY */}
      <div className="neo-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#ff5e1a]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
            Active Modules
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {MODULE_DEFINITIONS.map((m) => {
            const isEnabled = settings.enabledModules[m.key] !== false;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => toggleModule(m.key)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                  isEnabled 
                    ? 'border-[#ff5e1a]/30 bg-[#ff5e1a]/10 text-[var(--text-primary)]' 
                    : 'border-[var(--border-soft)] bg-[var(--bg-main)] text-[var(--text-secondary)] opacity-60'
                }`}
              >
                <span className="text-xs font-black truncate">{m.label}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${isEnabled ? 'bg-[#ff5e1a]' : 'bg-[var(--border-soft)]'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. DATA BACKUP & RESTORE */}
      <div className="neo-card p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#ff5e1a]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
              Device Backup &amp; Restore
            </h3>
          </div>
        </div>

        {/* Daily Auto Snapshot Box */}
        <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-soft)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#ff5e1a] shrink-0" />
              <div>
                <p className="text-xs font-black text-[var(--text-primary)]">Daily Auto-Backup</p>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold mt-0.5">
                  {backupInfo.exists 
                    ? `Saved: ${backupInfo.date} • ${backupInfo.time || '18:00'}`
                    : 'Auto-saved daily'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-soft)]">
            <button
              onClick={handleCreateLocalSnapshot}
              className="flex-1 py-2 rounded-xl bg-[var(--bg-surface)] hover:border-[#ff5e1a] border border-[var(--border-soft)] text-xs font-black text-[var(--text-primary)] active:scale-95 transition-all text-center"
            >
              Backup Now
            </button>
            {backupInfo.exists && (
              <button
                onClick={handleOpenRestoreConfirm}
                className="flex-1 py-2 rounded-xl bg-[#ff5e1a] text-white text-xs font-black shadow-sm active:scale-95 transition-all text-center"
              >
                Restore
              </button>
            )}
          </div>
        </div>

        {/* File Export & Import Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleExportBackup}
            className="p-3 rounded-xl bg-[var(--bg-main)] hover:border-[#ff5e1a]/40 border border-[var(--border-soft)] text-[var(--text-primary)] text-xs font-black flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#ff5e1a]" />
            <span>Export JSON</span>
          </button>

          <label className="p-3 rounded-xl bg-[var(--bg-main)] hover:border-[#ff5e1a]/40 border border-[var(--border-soft)] text-[var(--text-primary)] text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer text-center active:scale-95">
            <Upload className="w-3.5 h-3.5 text-sky-500" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Custom Confirmation Popup for Restore Snapshot */}
      <ConfirmModal
        isOpen={isRestoreConfirmOpen}
        title="Restore Backup Snapshot"
        message={`Are you sure you want to restore the backup saved on ${
          backupInfo.date || 'a previous session'
        }${backupInfo.time ? ` at ${backupInfo.time}` : ''}? This will reload your saved lists and data.`}
        confirmLabel="Restore"
        isDestructive={false}
        onConfirm={executeRestoreLocalSnapshot}
        onCancel={() => setIsRestoreConfirmOpen(false)}
      />

      {/* Normal Popup Overlay Toast Message */}
      <Toast message={backupSuccess} />
    </div>
  );
};
