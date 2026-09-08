import React, { useState, useEffect } from 'react';
import { backButtonService } from '../../services/soundService';
import { X, Check, User, Phone, FileText } from 'lucide-react';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (personName: string, contact?: string, notes?: string) => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [personName, setPersonName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonService.register('add-account-modal', () => {
      onClose();
      return true;
    }, 100);
    return unregister;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    onSave(personName.trim(), contact.trim() || undefined, notes.trim() || undefined);
    setPersonName('');
    setContact('');
    setNotes('');
    onClose();
  };

  return (
    <div className="modal-overlay flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ff5e1a]/15 text-[#ff5e1a] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-[var(--text-primary)]">
              New Account
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Person / Account Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#ff5e1a]" />
              <span>Account / Person Name *</span>
            </label>
            <input
              type="text"
              autoFocus
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Name / investment etc"
              className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-soft)] text-sm font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[#ff5e1a] outline-none transition-colors"
            />
          </div>

          {/* Contact Number (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>Contact / Phone (Optional)</span>
            </label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-soft)] text-sm font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[#ff5e1a] outline-none transition-colors"
            />
          </div>

          {/* Note (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>Note (Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Shopkeeper, Colleague, Landlord..."
              className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-soft)] text-sm font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[#ff5e1a] outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-primary)] font-black text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!personName.trim()}
              className="flex-1 py-3.5 rounded-2xl bg-[#ff5e1a] hover:bg-[#e54c09] text-white font-black text-xs shadow-lg shadow-[#ff5e1a]/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
