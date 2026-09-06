import React, { useEffect, useState, useRef } from 'react';
import { soundService } from '../../services/soundService';

interface EditorAccessoryBarProps {
  getTextarea?: () => HTMLTextAreaElement | null;
  getEditableElement?: () => HTMLElement | null;
  onTextChange?: (newText: string) => void;
  onContentChange?: (html: string) => void;
}

const PREFIX_ITEMS = [
  { symbol: '•', label: '•' },
  { symbol: '>', label: '>' },
  { symbol: '👉', label: '👉' },
  { symbol: '✅', label: '✅' },
  { symbol: '⭕', label: '⭕' },
];

const ALL_PREFIXES = ['•', '>', '👉', '✅', '⭕', '-', '*'];

export const EditorAccessoryBar: React.FC<EditorAccessoryBarProps> = ({
  getEditableElement,
  onContentChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(0);
  const activeSelectionRef = useRef<Range | null>(null);

  // Helper to save selection
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      activeSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.isContentEditable ||
        target?.getAttribute('contenteditable') === 'true' ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLInputElement
      ) {
        setIsVisible(true);
        saveSelection();
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement as HTMLElement;
        if (
          !(active instanceof HTMLTextAreaElement) &&
          !active?.isContentEditable &&
          active?.getAttribute('contenteditable') !== 'true'
        ) {
          setIsVisible(false);
        }
      }, 200);
    };

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const el = getEditableElement ? getEditableElement() : null;
        if (el && el.contains(sel.anchorNode)) {
          activeSelectionRef.current = sel.getRangeAt(0).cloneRange();
        }
      }
    };

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const vp = window.visualViewport;
        const offset = Math.max(0, window.innerHeight - (vp.height + vp.offsetTop));
        setBottomOffset(offset);
        if (offset > 50) {
          setIsVisible(true);
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('selectionchange', handleSelectionChange);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, [getEditableElement]);

  // Helper to get active block/line container inside editor
  const getActiveBlock = (editor: HTMLElement): HTMLElement | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.getRangeAt(0).startContainer;

    while (node && node !== editor && node.nodeName !== 'DIV' && node.nodeName !== 'P' && node.nodeName !== 'LI') {
      node = node.parentNode;
    }
    return (node && node !== editor && node instanceof HTMLElement) ? node : null;
  };

  // 1. Independent Toggle for Bold, Underline, Strike (retains cursor at the end without jump)
  const handleToggleFormat = (tag: 'b' | 'u' | 's') => {
    soundService.triggerHaptic(15);
    const el = getEditableElement ? getEditableElement() : null;
    if (!el) return;

    el.focus();
    let block = getActiveBlock(el);

    if (!block) {
      document.execCommand('formatBlock', false, 'div');
      block = getActiveBlock(el);
    }

    if (!block) return;

    const tagName = tag.toUpperCase();
    const existingElement = block.querySelector(tagName);

    if (existingElement) {
      // Un-wrap: remove this tag while preserving other active styles
      const parent = existingElement.parentNode;
      while (existingElement.firstChild) {
        parent?.insertBefore(existingElement.firstChild, existingElement);
      }
      parent?.removeChild(existingElement);
    } else {
      // Wrap content with this tag
      const wrapper = document.createElement(tag);
      while (block.firstChild) {
        wrapper.appendChild(block.firstChild);
      }
      block.appendChild(wrapper);
    }

    // Place cursor precisely at the end of the text in this block
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(block);
      newRange.collapse(false); // place cursor at end
      sel.addRange(newRange);
      activeSelectionRef.current = newRange.cloneRange();
    }

    if (onContentChange) onContentChange(el.innerHTML);
  };

  // 2. Prefix Toggling (•, >, 👉, ✅, ⭕)
  const handlePrefix = (prefixSymbol: string) => {
    soundService.triggerHaptic(15);
    const el = getEditableElement ? getEditableElement() : null;
    if (!el) return;

    el.focus();
    let block = getActiveBlock(el);

    if (!block) {
      document.execCommand('formatBlock', false, 'div');
      block = getActiveBlock(el);
    }

    if (block) {
      const text = block.textContent || '';
      const trimmed = text.trimStart();
      let existingPrefix: string | null = null;

      for (const p of ALL_PREFIXES) {
        if (trimmed.startsWith(p + ' ') || trimmed.startsWith(p)) {
          existingPrefix = trimmed.startsWith(p + ' ') ? p + ' ' : p;
          break;
        }
      }

      if (existingPrefix) {
        const pure = trimmed.slice(existingPrefix.length).trimStart();
        if (existingPrefix.trim() === prefixSymbol.trim()) {
          // Same prefix -> Remove it
          block.textContent = pure || '\u200B';
        } else {
          // Different prefix -> Replace with new prefix
          block.textContent = prefixSymbol + ' ' + pure;
        }
      } else {
        // No prefix -> Prepend prefix
        block.textContent = prefixSymbol + ' ' + trimmed;
      }

      // Restore cursor at the end of this block
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(block);
        newRange.collapse(false);
        sel.addRange(newRange);
        activeSelectionRef.current = newRange.cloneRange();
      }
    }

    if (onContentChange) onContentChange(el.innerHTML);
  };

  // 3. Title Banner Toggle (T)
  const handleToggleTitle = () => {
    soundService.triggerHaptic(20);
    const el = getEditableElement ? getEditableElement() : null;
    if (!el) return;

    el.focus();
    let block = getActiveBlock(el);

    if (!block) {
      document.execCommand('formatBlock', false, 'div');
      block = getActiveBlock(el);
    }

    if (block) {
      if (block.classList.contains('note-title-banner')) {
        block.className = '';
      } else {
        block.className = 'note-title-banner';
      }

      // Retain cursor at the end
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(block);
        newRange.collapse(false);
        sel.addRange(newRange);
        activeSelectionRef.current = newRange.cloneRange();
      }
    }

    if (onContentChange) onContentChange(el.innerHTML);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{ bottom: `${bottomOffset}px` }}
      className="fixed left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-soft)] px-3 py-1.5 shadow-2xl transition-all duration-75 flex items-center justify-between gap-1 overflow-x-auto select-none"
    >
      <div className="flex items-center gap-1.5 min-w-max mx-auto">
        {/* Title Style Toggle (T) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleToggleTitle();
          }}
          title="Toggle Title Banner"
          className="h-8 min-w-[34px] px-2 rounded-xl bg-[var(--bg-main)] hover:bg-[#ff5e1a]/15 text-[#ff5e1a] border border-[var(--border-soft)] font-black text-sm flex items-center justify-center active:scale-90 transition-all shadow-sm"
        >
          T
        </button>

        <div className="w-[1px] h-5 bg-[var(--border-soft)] mx-0.5" />

        {/* Prefix Symbols */}
        {PREFIX_ITEMS.map((item) => (
          <button
            key={item.symbol}
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handlePrefix(item.symbol);
            }}
            className="h-8 min-w-[34px] px-2 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-primary)] border border-[var(--border-soft)] font-black text-xs sm:text-sm flex items-center justify-center active:scale-90 transition-all shadow-sm"
          >
            {item.label}
          </button>
        ))}

        <div className="w-[1px] h-5 bg-[var(--border-soft)] mx-0.5" />

        {/* BOLD */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleToggleFormat('b');
          }}
          title="Bold"
          className="h-8 min-w-[34px] px-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-primary)] border border-[var(--border-soft)] font-black text-xs flex items-center justify-center active:scale-90 transition-all shadow-sm"
        >
          <span className="font-black text-sm">B</span>
        </button>

        {/* UNDERLINE */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleToggleFormat('u');
          }}
          title="Underline"
          className="h-8 min-w-[34px] px-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-primary)] border border-[var(--border-soft)] font-black text-xs flex items-center justify-center active:scale-90 transition-all shadow-sm"
        >
          <span className="underline font-black text-sm">U</span>
        </button>

        {/* STRIKE */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleToggleFormat('s');
          }}
          title="Strikethrough"
          className="h-8 min-w-[34px] px-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--border-soft)] text-[var(--text-primary)] border border-[var(--border-soft)] font-black text-xs flex items-center justify-center active:scale-90 transition-all shadow-sm"
        >
          <span className="line-through font-black text-sm">S</span>
        </button>
      </div>
    </div>
  );
};

// Global keydown handler to prevent title format from leaking into subsequent lines on Enter
export const handleEditorKeyDown = (
  e: React.KeyboardEvent<HTMLDivElement>,
  onContentChange?: (html: string) => void
) => {
  if (e.key === 'Enter') {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    let node: Node | null = range.startContainer;
    while (node && node !== e.currentTarget && node.nodeName !== 'DIV' && node.nodeName !== 'P' && node.nodeName !== 'LI') {
      node = node.parentNode;
    }

    if (node && node instanceof HTMLElement && (node.classList.contains('note-title-banner') || ['H1', 'H2', 'H3'].includes(node.nodeName))) {
      e.preventDefault();

      // Create a fresh clean line block without title banner class
      const newBlock = document.createElement('div');

      // Extract any content after cursor
      try {
        const endRange = document.createRange();
        endRange.setStart(range.startContainer, range.startOffset);
        endRange.setEndAfter(node.lastChild || node);
        const extracted = endRange.extractContents();

        if (extracted && extracted.textContent && extracted.textContent.length > 0) {
          newBlock.appendChild(extracted);
        } else {
          newBlock.innerHTML = '<br>';
        }
      } catch {
        newBlock.innerHTML = '<br>';
      }

      // Ensure node is not completely empty
      if (!node.textContent || node.textContent.length === 0) {
        node.innerHTML = '<br>';
      }

      // Insert new block right after the title block
      if (node.nextSibling) {
        node.parentNode?.insertBefore(newBlock, node.nextSibling);
      } else {
        node.parentNode?.appendChild(newBlock);
      }

      // Place cursor into the new block
      const newRange = document.createRange();
      newRange.setStart(newBlock, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      if (onContentChange) {
        onContentChange(e.currentTarget.innerHTML);
      }
    }
  }
};
