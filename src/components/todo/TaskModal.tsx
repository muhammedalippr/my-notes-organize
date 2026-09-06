import React, { useState, useEffect } from 'react';
import { MatrixQuadrant, MatrixTask } from '../../types';
import { backButtonService } from '../../services/soundService';
import { X, Check, Flame, Calendar, Users, Trash } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<MatrixTask, 'id' | 'createdAt' | 'completed'>) => void;
  initialQuadrant?: MatrixQuadrant;
}

const QUADRANTS: { key: MatrixQuadrant; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; border: string }[] = [
  { 
    key: 'important_urgent', 
    title: 'Urgent & Important', 
    subtitle: 'Do First (Crises, Deadlines)', 
    icon: Flame, 
    border: 'border-rose-500/50 text-rose-400 bg-rose-500/10' 
  },
  { 
    key: 'important_not_urgent', 
    title: 'Important & Not Urgent', 
    subtitle: 'Schedule (Strategy, Growth)', 
    icon: Calendar, 
    border: 'border-amber-500/50 text-amber-400 bg-amber-500/10' 
  },
  { 
    key: 'urgent_not_important', 
    title: 'Urgent & Not Important', 
    subtitle: 'Delegate (Interrupts, Chores)', 
    icon: Users, 
    border: 'border-sky-500/50 text-sky-400 bg-sky-500/10' 
  },
  { 
    key: 'not_important_not_urgent', 
    title: 'Not Important & Not Urgent', 
    subtitle: 'Eliminate (Distractions, Time-wasters)', 
    icon: Trash, 
    border: 'border-slate-500/50 text-slate-400 bg-slate-500/10' 
  },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuadrant = 'important_urgent',
}) => {
  const [title, setTitle] = useState('');
  const [quadrant, setQuadrant] = useState<MatrixQuadrant>(initialQuadrant);

  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonService.register('task-modal', () => {
      onClose();
      return true;
    }, 100);
    return unregister;
  }, [isOpen, onClose]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      quadrant,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setNotes('');
    onClose();
  };

  return (
    <div className="modal-overlay flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100">Add Matrix Task</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Finalize project deliverable"
              className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Quadrant
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUADRANTS.map((q) => {
                const isSelected = quadrant === q.key;
                const Icon = q.icon;
                return (
                  <button
                    key={q.key}
                    type="button"
                    onClick={() => setQuadrant(q.key)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      isSelected 
                        ? `${q.border} ring-1 ring-offset-0 ring-indigo-500/40` 
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">{q.title}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{q.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details or context..."
              rows={2}
              className="w-full bg-slate-950 text-slate-100 px-3.5 py-2 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none text-sm transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
            >
              <Check className="w-3.5 h-3.5" />
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
