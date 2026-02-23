import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { SectionEditSheet } from './SectionEditSheet';
import { SectionPicker } from './SectionPicker';
import { getSectionConfig } from '@/lib/sectionRegistry';
import type { PageSection, SectionType } from '@/types/sections';
import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Plus,
  GripVertical,
  Image,
  Grid3X3,
  Quote,
  Megaphone,
  FileText,
  Images,
  TrendingUp,
  HelpCircle,
  Mail,
  Users,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionListProps {
  sections: PageSection[];
  loading: boolean;
  saving: boolean;
  isAdmin: boolean;
  onAddSection: (type: SectionType) => Promise<PageSection | null>;
  onUpdateContent: (sectionId: string, content: Record<string, unknown>) => Promise<boolean>;
  onToggleVisibility: (sectionId: string) => Promise<boolean>;
  onToggleLock: (sectionId: string) => Promise<boolean>;
  onDelete: (sectionId: string) => Promise<boolean>;
  onMoveUp: (sectionId: string) => Promise<boolean>;
  onMoveDown: (sectionId: string) => Promise<boolean>;
}

// Map of icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  image: Image,
  'grid-3x3': Grid3X3,
  quote: Quote,
  megaphone: Megaphone,
  'file-text': FileText,
  images: Images,
  'trending-up': TrendingUp,
  'help-circle': HelpCircle,
  mail: Mail,
  users: Users,
  layers: Layers,
};

export function SectionList({
  sections,
  loading,
  saving,
  isAdmin,
  onAddSection,
  onUpdateContent,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SectionListProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PageSection | null>(null);

  const handleAddSection = async (type: SectionType) => {
    await onAddSection(type);
  };

  const handleSaveContent = async (content: Record<string, unknown>) => {
    if (!editingSection) return false;
    return onUpdateContent(editingSection.id, content);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await onDelete(deleteTarget.id);
    setDeleteTarget(null);
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
      {sections.length === 0 ? (
        <Card className="p-8 text-center border-2 border-dashed">
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Layers className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">No sections yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add sections to build your page content
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => setPickerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {sections.map((section, index) => {
            const config = getSectionConfig(section.section_type);
            const IconComponent = iconMap[config.icon] || FileText;
            const canModify = isAdmin && !section.is_locked;

            return (
              <Card
                key={section.id}
                className={cn(
                  'p-4 transition-opacity',
                  !section.is_visible && 'opacity-50',
                  saving && 'pointer-events-none'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Drag handle (visual only for now) */}
                  <div
                    className={cn(
                      'cursor-grab text-muted-foreground',
                      section.is_locked && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Section icon and label */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{config.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {section.is_locked && (
                          <span className="inline-flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Move buttons */}
                    {canModify && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onMoveUp(section.id)}
                          disabled={index === 0 || saving}
                          title="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onMoveDown(section.id)}
                          disabled={index === sections.length - 1 || saving}
                          title="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {/* Visibility toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleVisibility(section.id)}
                      disabled={saving}
                      title={section.is_visible ? 'Hide section' : 'Show section'}
                    >
                      {section.is_visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Lock toggle (admin only) */}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleLock(section.id)}
                        disabled={saving}
                        title={section.is_locked ? 'Unlock section' : 'Lock section'}
                      >
                        {section.is_locked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Unlock className="h-4 w-4" />
                        )}
                      </Button>
                    )}

                    {/* Edit button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingSection(section)}
                      disabled={saving}
                      title="Edit content"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* Delete button */}
                    {canModify && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(section)}
                        disabled={saving}
                        className="text-destructive hover:text-destructive"
                        title="Delete section"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

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
        </>
      )}

      {/* Section picker dialog */}
      <SectionPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddSection}
      />

      {/* Section edit sheet */}
      <SectionEditSheet
        open={!!editingSection}
        onOpenChange={(open) => !open && setEditingSection(null)}
        section={editingSection}
        onSave={handleSaveContent}
        saving={saving}
      />

      {/* Delete confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Section"
        description={`Are you sure you want to delete this ${deleteTarget ? getSectionConfig(deleteTarget.section_type).label : 'section'}? This action cannot be undone.`}
      />
    </div>
  );
}
