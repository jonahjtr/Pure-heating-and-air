import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { SectionFloatingToolbar } from './SectionFloatingToolbar';
import type { PageSection } from '@/types/sections';
import { getSectionConfig } from '@/lib/sectionRegistry';

interface SectionWrapperProps {
  section: PageSection;
  isSelected: boolean;
  isAdmin: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  saving: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onOpenSettings: () => void;
  onOpenStyleInspector: () => void;
  onSaveAsReusable: () => void;
  children: React.ReactNode;
}

export function SectionWrapper({
  section,
  isSelected,
  isAdmin,
  canMoveUp,
  canMoveDown,
  saving,
  onSelect,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onOpenSettings,
  onOpenStyleInspector,
  onSaveAsReusable,
  children,
}: SectionWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0, width: 0 });

  const config = getSectionConfig(section.section_type);

  // Update toolbar position when selected
  const updatePosition = useCallback(() => {
    if (wrapperRef.current && isSelected) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isSelected]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isSelected) return;

    const handleUpdate = () => updatePosition();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isSelected, updatePosition]);

  const handleClick = (e: React.MouseEvent) => {
    // Don't select if clicking on an editable element or interactive element
    const target = e.target as HTMLElement;
    if (
      target.isContentEditable ||
      target.closest('[contenteditable="true"]') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('[data-floating-toolbar]')
    ) {
      return;
    }
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      ref={wrapperRef}
      onClick={handleClick}
      className={cn(
        'relative transition-all group cursor-pointer',
        isSelected && 'ring-2 ring-primary ring-offset-2 rounded-lg',
        !section.is_visible && 'opacity-50',
        section.is_locked && 'cursor-default'
      )}
    >
      {/* Selection indicator on hover */}
      {!isSelected && (
        <div 
          className="absolute inset-0 ring-2 ring-primary/0 group-hover:ring-primary/30 rounded-lg transition-all pointer-events-none"
        />
      )}

      {/* Hidden indicator for non-visible sections */}
      {!section.is_visible && (
        <div className="absolute top-2 right-2 z-10 bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
          Hidden
        </div>
      )}

      {/* Section content */}
      <div className={cn(section.is_locked && 'pointer-events-none select-none')}>
        {children}
      </div>

      {/* Floating toolbar when selected */}
      {isSelected && (
        <SectionFloatingToolbar
          sectionId={section.id}
          sectionLabel={config.label}
          isVisible={section.is_visible}
          isLocked={section.is_locked}
          isAdmin={isAdmin}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          isLinked={(section as any).is_linked}
          reusableName={(section as any).reusable_id ? 'Linked' : undefined}
          position={toolbarPosition}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onToggleVisibility={onToggleVisibility}
          onToggleLock={onToggleLock}
          onDelete={onDelete}
          onOpenSettings={onOpenSettings}
          onOpenStyleInspector={onOpenStyleInspector}
          onSaveAsReusable={onSaveAsReusable}
          saving={saving}
        />
      )}
    </div>
  );
}
