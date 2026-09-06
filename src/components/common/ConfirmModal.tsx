import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { backButtonService } from '../../services/soundService';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Delete Confirmation',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonService.register('confirm-modal', () => {
      onCancel();
      return true;
    }, 120);
    return unregister;
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay flex items-center justify-center p-4 font-sans z-50">
      <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            isDestructive ? 'bg-rose-500/15 text-rose-500' : 'bg-[#ff5e1a]/15 text-[#ff5e1a]'
          }`}>
            {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-base font-black text-[var(--text-primary)]">
              {title}
            </h3>
            <p className="text-xs font-bold text-[var(--text-secondary)] mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-secondary)] font-black text-xs transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs text-white shadow-lg transition-transform active:scale-95 ${
              isDestructive 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25' 
                : 'bg-[#ff5e1a] hover:bg-[#e54c09] shadow-[#ff5e1a]/25'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
