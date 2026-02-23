import { useState, useCallback } from 'react';
import type { PageSection } from '@/types/sections';

interface UseUnifiedEditorOptions {
  sections: PageSection[];
  onUpdateContent: (sectionId: string, content: Record<string, unknown>) => Promise<boolean>;
  onToggleVisibility: (sectionId: string) => Promise<boolean>;
  onToggleLock: (sectionId: string) => Promise<boolean>;
  onDelete: (sectionId: string) => Promise<boolean>;
  onMoveUp: (sectionId: string) => Promise<boolean>;
  onMoveDown: (sectionId: string) => Promise<boolean>;
}

export function useUnifiedEditor({
  sections,
  onUpdateContent,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onMoveUp,
  onMoveDown,
}: UseUnifiedEditorOptions) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [styleInspectorOpen, setStyleInspectorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveReusableOpen, setSaveReusableOpen] = useState(false);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;

  const handleSelectSection = useCallback((sectionId: string) => {
    setSelectedSectionId((prev) => (prev === sectionId ? null : sectionId));
  }, []);

  const handleDeselectSection = useCallback(() => {
    setSelectedSectionId(null);
  }, []);

  const handleOpenSettings = useCallback(() => {
    if (selectedSectionId) {
      setSettingsOpen(true);
    }
  }, [selectedSectionId]);

  const handleOpenStyleInspector = useCallback(() => {
    if (selectedSectionId) {
      setStyleInspectorOpen(true);
    }
  }, [selectedSectionId]);

  const handleOpenDeleteDialog = useCallback(() => {
    if (selectedSectionId) {
      setDeleteDialogOpen(true);
    }
  }, [selectedSectionId]);

  const handleOpenSaveReusable = useCallback(() => {
    if (selectedSectionId) {
      setSaveReusableOpen(true);
    }
  }, [selectedSectionId]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedSectionId) return;
    await onDelete(selectedSectionId);
    setSelectedSectionId(null);
    setDeleteDialogOpen(false);
  }, [selectedSectionId, onDelete]);

  const handleMoveUp = useCallback(async () => {
    if (!selectedSectionId) return;
    await onMoveUp(selectedSectionId);
  }, [selectedSectionId, onMoveUp]);

  const handleMoveDown = useCallback(async () => {
    if (!selectedSectionId) return;
    await onMoveDown(selectedSectionId);
  }, [selectedSectionId, onMoveDown]);

  const handleToggleVisibility = useCallback(async () => {
    if (!selectedSectionId) return;
    await onToggleVisibility(selectedSectionId);
  }, [selectedSectionId, onToggleVisibility]);

  const handleToggleLock = useCallback(async () => {
    if (!selectedSectionId) return;
    await onToggleLock(selectedSectionId);
  }, [selectedSectionId, onToggleLock]);

  const handleUpdateContent = useCallback(
    async (content: Record<string, unknown>) => {
      if (!selectedSectionId) return;
      await onUpdateContent(selectedSectionId, content);
    },
    [selectedSectionId, onUpdateContent]
  );

  // Inline field update helper
  const handleInlineFieldUpdate = useCallback(
    async (sectionId: string, fieldName: string, value: unknown) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;

      const currentContent = section.content_json as Record<string, unknown>;
      const updatedContent = {
        ...currentContent,
        [fieldName]: value,
      };

      await onUpdateContent(sectionId, updatedContent);
    },
    [sections, onUpdateContent]
  );

  // Get section position helpers
  const getCanMoveUp = useCallback(
    (sectionId: string) => {
      const index = sections.findIndex((s) => s.id === sectionId);
      return index > 0;
    },
    [sections]
  );

  const getCanMoveDown = useCallback(
    (sectionId: string) => {
      const index = sections.findIndex((s) => s.id === sectionId);
      return index < sections.length - 1;
    },
    [sections]
  );

  return {
    selectedSectionId,
    selectedSection,
    settingsOpen,
    setSettingsOpen,
    styleInspectorOpen,
    setStyleInspectorOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    saveReusableOpen,
    setSaveReusableOpen,
    handleSelectSection,
    handleDeselectSection,
    handleOpenSettings,
    handleOpenStyleInspector,
    handleOpenDeleteDialog,
    handleOpenSaveReusable,
    handleConfirmDelete,
    handleMoveUp,
    handleMoveDown,
    handleToggleVisibility,
    handleToggleLock,
    handleUpdateContent,
    handleInlineFieldUpdate,
    getCanMoveUp,
    getCanMoveDown,
  };
}
