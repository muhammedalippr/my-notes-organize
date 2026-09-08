import React, { useState, useEffect } from 'react';
import { FinanceDirection, FinanceRecord } from '../../types';
import { backButtonService } from '../../services/soundService';
import { X, Check, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface AddFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<FinanceRecord, 'id' | 'createdAt' | 'status'>, editId?: string) => void;
  currencySymbol: string;
  initialPersonName?: string;
  editingRecord?: FinanceRecord | null;
}

export const AddFinanceModal: React.FC<AddFinanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currencySymbol,
  initialPersonName = '',
  editingRecord = null,
}) => {
  const [personName, setPersonName] = useState(editingRecord ? editingRecord.personName : (initialPersonName || ''));
  const [amount, setAmount] = useState(editingRecord?.amount ? editingRecord.amount.toString() : '');
  const [direction, setDirection] = useState<FinanceDirection>(editingRecord ? editingRecord.direction : 'gave');
  const [date, setDate] = useState(editingRecord ? editingRecord.date : new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(editingRecord?.dueDate || '');
  const [notes, setNotes] = useState(editingRecord?.notes || '');

  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonService.register('add-finance-modal', () => {
      onClose();
      return true;
    }, 100);
    return unregister;
  }, [isOpen, onClose]);

  // Synchronize state before paint when props change
  React.useLayoutEffect(() => {
    if (isOpen) {
      if (editingRecord) {
        setPersonName(editingRecord.personName);
        setAmount(editingRecord.amount ? editingRecord.amount.toString() : '');
        setDirection(editingRecord.direction);
        setDate(editingRecord.date);
        setDueDate(editingRecord.dueDate || '');
        setNotes(editingRecord.notes || '');
      } else {
        setPersonName(initialPersonName || '');
        setAmount('');
        setDirection('gave');
        setDate(new Date().toISOString().slice(0, 10));
        setDueDate('');
        setNotes('');
      }
    }
  }, [isOpen, initialPersonName, editingRecord]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    // Amount can be optional or default to 0 if only adding a person contact
    const numAmount = parseFloat(amount) || 0;

    onSave({
      personName: personName.trim(),
      amount: numAmount,
      direction,
      date,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    }, editingRecord?.id);

    setPersonName('');
    setAmount('');
    setDueDate('');
    setNotes('');
    onClose();
  };

  return (
    <div className="modal-overlay flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)]">
          <h3 className="text-base font-black text-[var(--text-primary)]">
            {editingRecord ? 'Edit Entry' : 'Record Entry'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Person Name (Required) */}
          <div>
            <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Person / Contact Name *
            </label>
            <input
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Name / investment etc"
              className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-soft)] focus:border-[#ff5e1a]/50 outline-none text-sm font-bold transition-all"
            />
          </div>

          {/* Direction Toggle */}
          <div>
            <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDirection('gave')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                  direction === 'gave'
                    ? 'border-[#10b981] bg-[#10b981]/15 text-[#10b981]'
                    : 'border-[var(--border-soft)] bg-[var(--bg-main)] text-[var(--text-secondary)]'
                }`}
              >
                <div className={`p-2 rounded-xl ${direction === 'gave' ? 'bg-[#10b981] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black">Gave</div>
                  <div className="text-[10px] font-bold opacity-80">To receive</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDirection('received')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                  direction === 'received'
                    ? 'border-[#ef4444] bg-[#ef4444]/15 text-[#ef4444]'
                    : 'border-[var(--border-soft)] bg-[var(--bg-main)] text-[var(--text-secondary)]'
                }`}
              >
                <div className={`p-2 rounded-xl ${direction === 'received' ? 'bg-[#ef4444] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}>
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black">Received</div>
                  <div className="text-[10px] font-bold opacity-80">To return</div>
                </div>
              </button>
            </div>
          </div>

          {/* Amount & Date in 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Optional or 0"
                className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] px-4 py-2.5 rounded-2xl border border-[var(--border-soft)] focus:border-[#ff5e1a]/50 outline-none text-sm font-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] px-4 py-2.5 rounded-2xl border border-[var(--border-soft)] focus:border-[#ff5e1a]/50 outline-none text-sm font-bold transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Hotel booking advance, Dinner bill split..."
              rows={2}
              className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] p-4 rounded-2xl border border-[var(--border-soft)] focus:border-[#ff5e1a]/50 outline-none text-sm font-medium resize-none transition-all"
            />
          </div>

          {/* Actions */}
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
              className="flex-1 py-3 px-4 rounded-2xl bg-[#ff5e1a] text-white font-black text-xs shadow-lg shadow-[#ff5e1a]/30 hover:bg-[#e54c09] transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingRecord ? 'Update Entry' : 'Save Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
