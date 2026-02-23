import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { HeadlineBlockContent } from '../types';

interface HeadlineBlockProps {
  content: HeadlineBlockContent;
  onChange: (content: HeadlineBlockContent) => void;
}

export function HeadlineBlock({ content, onChange }: HeadlineBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLHeadingElement>(null);

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[content.alignment];

  const handleBlur = () => {
    setIsEditing(false);
    if (editableRef.current) {
      const newText = editableRef.current.innerText;
      if (newText !== content.text) {
        onChange({ ...content, text: newText });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editableRef.current?.blur();
    }
    if (e.key === 'Escape') {
      if (editableRef.current) {
        editableRef.current.innerText = content.text;
      }
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const sharedProps = {
    ref: editableRef,
    contentEditable: isEditing,
    suppressContentEditableWarning: true as const,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    className: cn(
      'outline-none font-display transition-colors',
      isEditing && 'ring-2 ring-primary/20 rounded px-2 -mx-2',
      !content.text && 'text-muted-foreground'
    ),
    style: {
      fontSize: `${content.fontSize}px`,
      color: content.color,
    },
    children: content.text || 'Click to add headline...',
  };

  return (
    <div
      className={cn('min-h-[1.5em] cursor-text', alignmentClass)}
      onClick={() => setIsEditing(true)}
    >
      {content.tag === 'h1' && <h1 {...sharedProps} />}
      {content.tag === 'h2' && <h2 {...sharedProps} />}
      {content.tag === 'h3' && <h3 {...sharedProps} />}
      {content.tag === 'h4' && <h4 {...sharedProps} />}
    </div>
  );
}
