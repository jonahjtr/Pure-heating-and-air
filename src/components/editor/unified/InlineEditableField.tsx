import { useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface InlineEditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  multiline?: boolean;
  tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
}

// Helper to move caret to end of contentEditable element
function setCaretToEnd(el: HTMLElement) {
  const range = document.createRange();
  const sel = window.getSelection();
  if (!sel) return;
  
  if (el.childNodes.length > 0) {
    const lastChild = el.childNodes[el.childNodes.length - 1];
    if (lastChild.nodeType === Node.TEXT_NODE) {
      range.setStart(lastChild, lastChild.textContent?.length || 0);
    } else {
      range.setStartAfter(lastChild);
    }
  } else {
    range.setStart(el, 0);
  }
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function InlineEditableField({
  value,
  onChange,
  placeholder = 'Click to edit...',
  className,
  disabled = false,
  multiline = false,
  tag: Tag = 'div',
}: InlineEditableFieldProps) {
  const ref = useRef<HTMLElement>(null);
  
  // Use refs instead of state to avoid re-renders during editing
  const isEditingRef = useRef(false);
  const snapshotValueRef = useRef(value);
  const lastPropValueRef = useRef(value);

  // Sync DOM content from props only when NOT editing
  useEffect(() => {
    if (!isEditingRef.current && ref.current && value !== lastPropValueRef.current) {
      ref.current.textContent = value || '';
      lastPropValueRef.current = value;
    }
  }, [value]);

  // Initial mount: set content
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = value || '';
      lastPropValueRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFocus = useCallback(() => {
    if (disabled) return;
    isEditingRef.current = true;
    snapshotValueRef.current = ref.current?.textContent || '';
    
    // Move caret to end after focus settles
    requestAnimationFrame(() => {
      if (ref.current) {
        setCaretToEnd(ref.current);
      }
    });
  }, [disabled]);

  const handleBlur = useCallback(() => {
    isEditingRef.current = false;
    const next = ref.current?.textContent ?? '';
    
    // Update our tracking ref to prevent re-sync from stale prop
    lastPropValueRef.current = next;
    
    // Only notify parent if value actually changed
    if (next !== snapshotValueRef.current) {
      onChange(next);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      ref.current?.blur();
    }
    if (e.key === 'Escape') {
      // Revert to snapshot value
      if (ref.current) {
        ref.current.textContent = snapshotValueRef.current;
        lastPropValueRef.current = snapshotValueRef.current;
      }
      ref.current?.blur();
    }
  }, [multiline]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    // Use modern Selection API instead of deprecated execCommand
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    
    const range = sel.getRangeAt(0);
    range.deleteContents();
    
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    
    // Move caret after inserted text
    range.setStartAfter(textNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }, []);

  return (
    <Tag
      ref={ref as any}
      contentEditable={!disabled}
      suppressContentEditableWarning
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={cn(
        'inline-editable outline-none transition-colors cursor-text min-w-[1ch]',
        'focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-sm',
        disabled && 'cursor-default opacity-60',
        className
      )}
      data-placeholder={placeholder}
    />
  );
}
