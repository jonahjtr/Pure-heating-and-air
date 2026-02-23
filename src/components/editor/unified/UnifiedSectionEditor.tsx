import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { SectionCanvas } from './SectionCanvas';
import { SectionPicker } from '@/components/sections/editor/SectionPicker';
import { SaveAsReusableDialog } from './SaveAsReusableDialog';
import { useUnifiedEditor } from './useUnifiedEditor';
import type { PageSection, SectionType } from '@/types/sections';
import type { ReusableComponent } from '@/hooks/useReusableComponents';
import { getSectionConfig } from '@/lib/sectionRegistry';

interface UnifiedSectionEditorProps {
  sections: PageSection[];
  loading: boolean;
  saving: boolean;
  isAdmin: boolean;
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  onAddSection: (type: SectionType) => Promise<PageSection | null>;
  onAddSectionFromReusable?: (reusableId: string, sectionType: SectionType, content: Record<string, unknown>) => Promise<PageSection | null>;
  onUpdateContent: (sectionId: string, content: Record<string, unknown>) => Promise<boolean>;
  onToggleVisibility: (sectionId: string) => Promise<boolean>;
  onToggleLock: (sectionId: string) => Promise<boolean>;
  onDelete: (sectionId: string) => Promise<boolean>;
  onMoveUp: (sectionId: string) => Promise<boolean>;
  onMoveDown: (sectionId: string) => Promise<boolean>;
}

export function UnifiedSectionEditor({
  sections,
  loading,
  saving,
  isAdmin,
  selectedSectionId,
  onSelectSection,
  onAddSection,
  onAddSectionFromReusable,
  onUpdateContent,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onMoveUp,
  onMoveDown,
}: UnifiedSectionEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveReusableOpen, setSaveReusableOpen] = useState(false);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;

  const handleInlineFieldUpdate = useCallback(
    async (sectionId: string, fieldKey: string, value: unknown) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;

      const currentContent = section.content_json as Record<string, unknown>;
      await onUpdateContent(sectionId, {
        ...currentContent,
        [fieldKey]: value,
      });
    },
    [sections, onUpdateContent]
  );

  const getCanMoveUp = (sectionId: string) => {
    const index = sections.findIndex((s) => s.id === sectionId);
    return index > 0;
  };

  const getCanMoveDown = (sectionId: string) => {
    const index = sections.findIndex((s) => s.id === sectionId);
    return index < sections.length - 1;
  };

  // Close selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('[data-section-wrapper]') &&
        !target.closest('[data-section-inspector]') &&
        !target.closest('[data-floating-toolbar]') &&
        !target.closest('[role="dialog"]') &&
        // Radix portals (Select/Popover/etc.) render outside the inspector.
        // If we don't whitelist them here, clicking a dropdown will deselect the
        // section and unmount the inspector, making menus “disappear”.
        !target.closest('[data-radix-popper-content-wrapper]') &&
        !target.closest('[role="listbox"]')
      ) {
        onSelectSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onSelectSection]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedSectionId) return;

      // Escape to deselect
      if (e.key === 'Escape') {
        onSelectSection(null);
      }

      // Delete with backspace/delete (when not in editable)
      if ((e.key === 'Delete' || e.key === 'Backspace') && isAdmin) {
        const target = e.target as HTMLElement;
        if (!target.isContentEditable && !target.closest('input') && !target.closest('textarea')) {
          e.preventDefault();
          setDeleteDialogOpen(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedSectionId, onSelectSection, isAdmin]);

  const handleAddSection = async (type: SectionType) => {
    await onAddSection(type);
    setPickerOpen(false);
  };

  const handleSelectReusable = async (component: ReusableComponent) => {
    if (onAddSectionFromReusable) {
      await onAddSectionFromReusable(
        component.id,
        component.block_type as SectionType,
        component.content as unknown as Record<string, unknown>
      );
    }
    setPickerOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (selectedSectionId) {
      await onDelete(selectedSectionId);
      onSelectSection(null);
    }
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Loading sections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Canvas with live preview */}
      <SectionCanvas
        sections={sections}
        selectedSectionId={selectedSectionId}
        isAdmin={isAdmin}
        saving={saving}
        onSelectSection={onSelectSection}
        onMoveUp={(id) => onMoveUp(id)}
        onMoveDown={(id) => onMoveDown(id)}
        onToggleVisibility={(id) => onToggleVisibility(id)}
        onToggleLock={(id) => onToggleLock(id)}
        onDelete={(id) => {
          onSelectSection(id);
          setDeleteDialogOpen(true);
        }}
        onOpenSettings={() => {}}
        onOpenStyleInspector={() => {}}
        onSaveAsReusable={(id) => {
          onSelectSection(id);
          setSaveReusableOpen(true);
        }}
        onInlineFieldUpdate={handleInlineFieldUpdate}
        getCanMoveUp={getCanMoveUp}
        getCanMoveDown={getCanMoveDown}
      />

      {/* Add section button */}
      {isAdmin && (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setPickerOpen(true)}
          disabled={saving}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      )}

      {/* Section picker dialog */}
      <SectionPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddSection}
        onSelectReusable={onAddSectionFromReusable ? handleSelectReusable : undefined}
      />

      {/* Delete confirmation */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Section"
        description={`Are you sure you want to delete this ${selectedSection ? getSectionConfig(selectedSection.section_type).label : 'section'}? This action cannot be undone.`}
      />

      {/* Save as reusable dialog */}
      <SaveAsReusableDialog
        open={saveReusableOpen}
        onOpenChange={setSaveReusableOpen}
        section={selectedSection}
        onSave={async (name, description) => {
          // TODO: Implement save as reusable for sections
          console.log('Save as reusable:', name, description);
          setSaveReusableOpen(false);
        }}
      />
    </div>
  );
}
