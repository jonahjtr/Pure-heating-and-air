import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PageSection, SectionType } from '@/types/sections';
import type { Json } from '@/integrations/supabase/types';
import { getDefaultContent } from '@/lib/sectionRegistry';

interface UsePageSectionsOptions {
  pageId: string | undefined;
}

// Internal type for database updates
interface DbSectionUpdate {
  section_type?: string;
  content_json?: Json;
  order?: number;
  is_locked?: boolean;
  is_visible?: boolean;
}

export function usePageSections({ pageId }: UsePageSectionsOptions) {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch sections for the page
  const fetchSections = useCallback(async () => {
    if (!pageId) {
      setSections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_id', pageId)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load page sections');
    } else {
      setSections((data as PageSection[]) || []);
    }
    setLoading(false);
  }, [pageId]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Add a new section
  const addSection = useCallback(
    async (type: SectionType) => {
      if (!pageId) return null;

      setSaving(true);
      const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.order)) + 1 : 0;

      const newSection = {
        page_id: pageId,
        section_type: type,
        content_json: getDefaultContent(type) as Json,
        order: maxOrder,
        is_locked: false,
        is_visible: true,
      };

      const { data, error } = await supabase
        .from('page_sections')
        .insert(newSection)
        .select()
        .single();

      setSaving(false);

      if (error) {
        console.error('Error adding section:', error);
        toast.error('Failed to add section');
        return null;
      }

      const addedSection = data as PageSection;
      setSections((prev) => [...prev, addedSection]);
      toast.success('Section added');
      return addedSection;
    },
    [pageId, sections]
  );

  // Add a section from a reusable template
  const addSectionFromReusable = useCallback(
    async (reusableId: string, sectionType: SectionType, content: Record<string, unknown>) => {
      if (!pageId) return null;

      setSaving(true);
      const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.order)) + 1 : 0;

      const newSection = {
        page_id: pageId,
        section_type: sectionType,
        content_json: content as Json,
        order: maxOrder,
        is_locked: false,
        is_visible: true,
        reusable_id: reusableId,
        is_linked: true,
      };

      const { data, error } = await supabase
        .from('page_sections')
        .insert(newSection)
        .select()
        .single();

      setSaving(false);

      if (error) {
        console.error('Error adding section from reusable:', error);
        toast.error('Failed to add section');
        return null;
      }

      const addedSection = data as PageSection;
      setSections((prev) => [...prev, addedSection]);
      toast.success('Section added from template');
      return addedSection;
    },
    [pageId, sections]
  );

  // Update a section with properly typed updates
  const updateSection = useCallback(
    async (sectionId: string, updates: DbSectionUpdate) => {
      setSaving(true);

      const { error } = await supabase
        .from('page_sections')
        .update(updates)
        .eq('id', sectionId);

      setSaving(false);

      if (error) {
        console.error('Error updating section:', error);
        toast.error('Failed to update section');
        return false;
      }

      setSections((prev) =>
        prev.map((s) => 
          s.id === sectionId 
            ? { 
                ...s, 
                section_type: (updates.section_type ?? s.section_type) as SectionType,
                order: updates.order ?? s.order,
                is_locked: updates.is_locked ?? s.is_locked,
                is_visible: updates.is_visible ?? s.is_visible,
                content_json: (updates.content_json as Record<string, unknown>) ?? s.content_json,
              } 
            : s
        )
      );
      return true;
    },
    []
  );

  // Update section content
  const updateSectionContent = useCallback(
    async (sectionId: string, content: Record<string, unknown>) => {
      return updateSection(sectionId, { content_json: content as Json });
    },
    [updateSection]
  );

  // Toggle section visibility
  const toggleVisibility = useCallback(
    async (sectionId: string) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return false;

      return updateSection(sectionId, { is_visible: !section.is_visible });
    },
    [sections, updateSection]
  );

  // Toggle section lock
  const toggleLock = useCallback(
    async (sectionId: string) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return false;

      return updateSection(sectionId, { is_locked: !section.is_locked });
    },
    [sections, updateSection]
  );

  // Delete a section
  const deleteSection = useCallback(
    async (sectionId: string) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return false;

      if (section.is_locked) {
        toast.error('Cannot delete a locked section');
        return false;
      }

      setSaving(true);

      const { error } = await supabase
        .from('page_sections')
        .delete()
        .eq('id', sectionId);

      setSaving(false);

      if (error) {
        console.error('Error deleting section:', error);
        toast.error('Failed to delete section');
        return false;
      }

      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      toast.success('Section deleted');
      return true;
    },
    [sections]
  );

  // Reorder sections
  const reorderSections = useCallback(
    async (fromIndex: number, toIndex: number) => {
      const section = sections[fromIndex];
      if (!section || section.is_locked) {
        toast.error('Cannot move a locked section');
        return false;
      }

      // Optimistically update local state
      const newSections = [...sections];
      const [removed] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, removed);

      // Update order values
      const updatedSections = newSections.map((s, i) => ({ ...s, order: i }));
      setSections(updatedSections);

      // Batch update in database
      setSaving(true);
      const updates = updatedSections.map((s) =>
        supabase.from('page_sections').update({ order: s.order }).eq('id', s.id)
      );

      const results = await Promise.all(updates);
      setSaving(false);

      const hasError = results.some((r) => r.error);
      if (hasError) {
        console.error('Error reordering sections');
        toast.error('Failed to save new order');
        fetchSections(); // Reload to get correct state
        return false;
      }

      return true;
    },
    [sections, fetchSections]
  );

  // Move section up
  const moveUp = useCallback(
    async (sectionId: string) => {
      const index = sections.findIndex((s) => s.id === sectionId);
      if (index <= 0) return false;
      return reorderSections(index, index - 1);
    },
    [sections, reorderSections]
  );

  // Move section down
  const moveDown = useCallback(
    async (sectionId: string) => {
      const index = sections.findIndex((s) => s.id === sectionId);
      if (index < 0 || index >= sections.length - 1) return false;
      return reorderSections(index, index + 1);
    },
    [sections, reorderSections]
  );

  return {
    sections,
    loading,
    saving,
    addSection,
    addSectionFromReusable,
    updateSection,
    updateSectionContent,
    toggleVisibility,
    toggleLock,
    deleteSection,
    moveUp,
    moveDown,
    reorderSections,
    refetch: fetchSections,
  };
}
