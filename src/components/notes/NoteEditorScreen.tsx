import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../../types';
import { EditorAccessoryBar, handleEditorKeyDown } from '../common/EditorAccessoryBar';
import { soundService, backButtonService } from '../../services/soundService';
import { ChevronLeft, Check } from 'lucide-react';

interface NoteEditorScreenProps {
  note: Note | null; // null for new note
  onBack: () => void;
  onSave: (noteData: { title: string; content: string; isPinned: boolean }, editId?: string) => void;
}

export const NoteEditorScreen: React.FC<NoteEditorScreenProps> = ({
  note,
  onBack,
  onSave,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [isDirty, setIsDirty] = useState(false);
  const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef(note?.content || '');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      contentRef.current = note.content;
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content || '';
      }
    } else {
      setTitle('');
      contentRef.current = '';
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
    setIsDirty(false);
  }, [note]);

  const handleContentInput = () => {
    if (editorRef.current) {
      contentRef.current = editorRef.current.innerHTML;
      setIsDirty(true);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsDirty(true);
  };

  // Check if current note actually has meaningful changes from initial
  const hasChanges = () => {
    const rawContent = editorRef.current ? editorRef.current.innerHTML : contentRef.current;
    const textContent = editorRef.current ? editorRef.current.innerText : '';
    const initialContent = note?.content || '';
    const initialTitle = note?.title || '';

    // If new note and completely empty, not modified
    if (!note && !title.trim() && !textContent.trim() && !rawContent.trim()) {
      return false;
    }
    // If text or title differs
    if (title.trim() !== initialTitle.trim()) return true;
    if (rawContent.trim() !== initialContent.trim()) return true;

    return isDirty;
  };

  const executeSaveAndBack = () => {
    const rawContent = editorRef.current ? editorRef.current.innerHTML : contentRef.current;
    const textContent = editorRef.current ? editorRef.current.innerText : '';

    if (!title.trim() && !textContent.trim() && !rawContent.trim()) {
      onBack();
      return;
    }

    soundService.triggerHaptic(15);
    onSave({
      title: title.trim() || 'Untitled Note',
      content: rawContent,
      isPinned: false,
    }, note?.id);

    setIsDirty(false);
    onBack();
  };

  const handleBack = () => {
    soundService.triggerHaptic(15);
    if (hasChanges()) {
      setIsSavePromptOpen(true);
    } else {
      onBack();
    }
  };

  // Register physical back button listener for Note Editor
  useEffect(() => {
    const unregister = backButtonService.register('note-editor', () => {
      // If prompt is already open, close it
      if (isSavePromptOpen) {
        setIsSavePromptOpen(false);
        return true;
      }
      // If there are changes, show save/discard prompt
      if (hasChanges()) {
        setIsSavePromptOpen(true);
        return true;
      }
      // Otherwise cleanly navigate back to notes list
      onBack();
      return true;
    }, 50);

    return unregister;
  }, [isSavePromptOpen, title, note, isDirty]);

  return (
    <div className="w-full h-full min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-main)]/90 backdrop-blur-2xl px-5 pt-3 pb-3.5 safe-top transition-all border-b border-[var(--border-soft)] shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="neo-pill w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:border-[#ff5e1a]/40 transition-all active:scale-90 shrink-0"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5] text-[#ff5e1a] -ml-0.5" />
          </button>

          <button
            type="button"
            onClick={executeSaveAndBack}
            aria-label="Save"
            className="neo-pill w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:border-[#ff5e1a]/40 transition-all active:scale-90 shrink-0"
          >
            <Check className="w-6 h-6 stroke-[2.5] text-[#ff5e1a]" />
          </button>
        </div>
      </header>

      {/* Editor Canvas Area with extra top clearance */}
      <div className="flex-1 flex flex-col p-5 pt-7 max-w-4xl w-full mx-auto space-y-4 overflow-y-auto pb-24">
        {/* Title Input */}
        <input
          type="text"
          autoFocus={!note}
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title..."
          className="w-full bg-transparent text-xl sm:text-2xl font-black text-[var(--text-primary)] outline-none border-b border-[var(--border-soft)] pb-3 placeholder:text-[var(--text-secondary)]/50"
        />

        {/* Rich HTML ContentEditable Note Body */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={(e) => handleEditorKeyDown(e, (html) => {
            contentRef.current = html;
            setIsDirty(true);
          })}
          onInput={handleContentInput}
          data-placeholder="Start typing your note..."
          className="rich-note-editor w-full flex-1 bg-transparent text-sm sm:text-base font-medium text-[var(--text-primary)] outline-none"
        />
      </div>

      {/* On-screen Keyboard Accessory Toolbar */}
      <EditorAccessoryBar
        getEditableElement={() => editorRef.current}
        onContentChange={(html) => {
          contentRef.current = html;
          setIsDirty(true);
        }}
      />

      {/* Unsaved Changes Confirmation Modal */}
      {isSavePromptOpen && (
        <div className="modal-overlay flex items-center justify-center p-4 z-50 font-sans">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-black text-[var(--text-primary)]">Save Note Changes?</h3>
            <p className="text-xs font-bold text-[var(--text-secondary)] leading-relaxed">
              Do you want to save changes to &quot;{title.trim() || 'this note'}&quot; before leaving?
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={executeSaveAndBack}
                className="w-full py-3 rounded-2xl bg-[#ff5e1a] text-white font-black text-xs shadow-lg shadow-[#ff5e1a]/30 active:scale-95 transition-transform"
              >
                Save &amp; Exit
              </button>

              <button
                type="button"
                onClick={() => {
                  soundService.triggerHaptic(15);
                  setIsSavePromptOpen(false);
                  setIsDirty(false);
                  onBack();
                }}
                className="w-full py-2.5 rounded-2xl bg-[var(--bg-main)] hover:bg-rose-500/10 text-rose-500 font-black text-xs active:scale-95 transition-transform"
              >
                Discard Changes
              </button>

              <button
                type="button"
                onClick={() => setIsSavePromptOpen(false)}
                className="w-full py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
