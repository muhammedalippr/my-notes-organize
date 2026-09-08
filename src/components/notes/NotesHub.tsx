import React, { useState } from 'react';
import { Note } from '../../types';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { NoteEditorScreen } from './NoteEditorScreen';
import { ConfirmModal } from '../common/ConfirmModal';
import { Plus, Trash2, FileText, GripVertical } from 'lucide-react';

interface NotesHubProps {
  onEditorStateChange?: (isOpen: boolean) => void;
}

const getPreviewText = (html: string) => {
  if (!html) return 'Empty note...';
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return text || 'Empty note...';
};

export const NotesHub: React.FC<NotesHubProps> = ({ onEditorStateChange }) => {
  const [notes, setNotes] = useState<Note[]>(StorageService.getNotes());
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const openEditor = (note: Note | null) => {
    setEditingNote(note);
    setIsEditorOpen(true);
    onEditorStateChange?.(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
    onEditorStateChange?.(false);
  };

  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    StorageService.saveNotes(updated);
  };

  const executeDeleteNote = () => {
    if (!noteToDelete) return;
    soundService.triggerHaptic(20);
    const updated = notes.filter(n => n.id !== noteToDelete.id);
    saveNotes(updated);
    setNoteToDelete(null);
    if (editingNote?.id === noteToDelete.id) {
      closeEditor();
    }
  };

  const openNew = () => {
    soundService.triggerHaptic(15);
    openEditor(null);
  };

  const openEdit = (note: Note) => {
    soundService.triggerHaptic(15);
    openEditor(note);
  };

  const handleSaveNote = (
    noteData: { title: string; content: string; isPinned: boolean },
    editId?: string
  ) => {
    if (editId) {
      const updated = notes.map(n => 
        n.id === editId 
          ? { ...n, ...noteData, updatedAt: new Date().toISOString() } 
          : n
      );
      saveNotes(updated);
    } else {
      const newNote: Note = {
        id: 'note_' + Date.now(),
        title: noteData.title,
        content: noteData.content,
        categoryId: 'default',
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveNotes([newNote, ...notes]);
    }
    soundService.triggerHaptic(20);
  };

  // Drag and Drop reordering handlers
  const handleDragStart = (index: number) => {
    soundService.triggerHaptic(15);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...notes];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(index, 0, item);
    setDraggedIndex(index);
    setNotes(updated);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null) {
      saveNotes(notes);
      soundService.triggerHaptic(20);
      setDraggedIndex(null);
    }
  };

  if (isEditorOpen) {
    return (
      <NoteEditorScreen
        note={editingNote}
        onBack={closeEditor}
        onSave={handleSaveNote}
      />
    );
  }

  return (
    <div className="space-y-4 pb-24 relative font-sans">
      {/* NOTES NEO GRID */}
      {notes.length === 0 ? (
        <div className="neo-card p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-[var(--text-secondary)] mx-auto opacity-40" />
          <h3 className="text-base font-black text-[var(--text-primary)]">No Notes Yet</h3>
          <p className="text-xs font-bold text-[var(--text-secondary)]">Tap + below to create your first note</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {notes.map((note, index) => (
            <div
              key={note.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => openEdit(note)}
              className={`neo-card p-5 cursor-pointer hover:border-[#ff5e1a]/40 flex flex-col justify-between min-h-[140px] ${
                draggedIndex === index ? 'opacity-40 border-dashed border-[#ff5e1a]' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <span
                      title="Drag to rearrange"
                      className="cursor-grab active:cursor-grabbing p-0.5 hover:text-[#ff5e1a] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold">
                      {new Date(note.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNoteToDelete(note);
                    }}
                    title="Delete Note"
                    className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-black text-[var(--text-primary)] leading-snug">
                  {note.title}
                </h3>

                <p className="text-xs font-bold text-[var(--text-secondary)] line-clamp-3 mt-1.5 leading-relaxed">
                  {getPreviewText(note.content)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EXTENDED LONG FAB */}
      <div className="fixed bottom-6 left-0 right-0 max-w-4xl mx-auto px-5 pointer-events-none flex justify-end z-30">
        <button
          onClick={openNew}
          className="neo-btn-orange pointer-events-auto px-6 py-3.5 flex items-center gap-2 text-sm font-black shadow-2xl active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>New Note</span>
        </button>
      </div>

      {/* Custom Neo Confirmation Modal for Deleting Note */}
      <ConfirmModal
        isOpen={!!noteToDelete}
        title="Delete Note"
        message={`Are you sure you want to delete "${noteToDelete?.title || 'this note'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={executeDeleteNote}
        onCancel={() => setNoteToDelete(null)}
      />
    </div>
  );
};
