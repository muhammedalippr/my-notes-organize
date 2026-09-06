import React, { useState, useEffect } from 'react';
import { Note, NoteCategory } from '../../types';
import { backButtonService } from '../../services/soundService';
import { X, Check, FileText, Tag, Pin } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  categories: NoteCategory[];
  editingNote?: Note | null;
  defaultCategoryId?: string;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingNote,
  defaultCategoryId,
}) => {
  const [title, setTitle] = useState(editingNote ? editingNote.title : '');
  const [content, setContent] = useState(editingNote ? editingNote.content : '');
  const [categoryId, setCategoryId] = useState(editingNote ? editingNote.categoryId : (defaultCategoryId || (categories[0]?.id || 'cat_work')));
  const [isPinned, setIsPinned] = useState(editingNote ? !!editingNote.isPinned : false);

  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonService.register('note-modal', () => {
      onClose();
      return true;
    }, 100);
    return unregister;
  }, [isOpen, onClose]);

  React.useLayoutEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setCategoryId(editingNote.categoryId);
      setIsPinned(editingNote.isPinned);
    } else {
      setTitle('');
      setContent('');
      setCategoryId(defaultCategoryId || (categories[0]?.id || 'cat_work'));
      setIsPinned(false);
    }
  }, [editingNote, defaultCategoryId, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      content: content.trim(),
      categoryId,
      isPinned,
    }, editingNote ? editingNote.id : undefined);

    onClose();
  };

  return (
    <div className="modal-overlay flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title & Pin */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="flex-1 bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none text-sm font-semibold transition-all"
            />

            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin note' : 'Pin note to top'}
              className={`p-2.5 rounded-xl border transition-all ${
                isPinned 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              <Pin className="w-4 h-4" />
            </button>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Category / Folder
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none text-sm cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Note Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              rows={8}
              className="w-full bg-slate-950 text-slate-100 px-3.5 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none text-sm transition-all leading-relaxed placeholder:text-slate-600 font-sans"
            />
          </div>

          {/* Actions */}
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
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
