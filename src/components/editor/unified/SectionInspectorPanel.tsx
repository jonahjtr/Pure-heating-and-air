import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  BookMarked,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { getSectionConfig } from '@/lib/sectionRegistry';
import { FieldRenderer } from '@/components/sections/editor/FieldRenderer';
import { StyleOverrideEditor } from './StyleOverrideEditor';
import type { PageSection } from '@/types/sections';

interface SectionInspectorPanelProps {
  section: PageSection | null;
  isAdmin: boolean;
  saving: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onUpdateContent: (content: Record<string, unknown>) => void;
  onSaveAsReusable: () => void;
}

export function SectionInspectorPanel({
  section,
  isAdmin,
  saving,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onUpdateContent,
  onSaveAsReusable,
}: SectionInspectorPanelProps) {
  const [activeTab, setActiveTab] = useState('content');

  if (!section) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Select a section to edit
      </div>
    );
  }

  const config = getSectionConfig(section.section_type);
  const content = section.content_json as Record<string, unknown>;
  const canModify = isAdmin && !section.is_locked;
  const isLinked = (section as any).is_linked;

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    onUpdateContent({
      ...content,
      [fieldKey]: value,
    });
  };

  const handleStyleOverridesChange = (overrides: Record<string, unknown>) => {
    onUpdateContent({
      ...content,
      styleOverrides: overrides,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold truncate">{config.label}</h3>
            {isLinked && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                Linked
              </span>
            )}
            {section.is_locked && (
              <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1 mt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onMoveUp}
            disabled={!canMoveUp || !canModify || saving}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onMoveDown}
            disabled={!canMoveDown || !canModify || saving}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleVisibility}
            disabled={saving}
          >
            {section.is_visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleLock}
              disabled={saving}
            >
              {section.is_locked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>
          )}
          {canModify && !isLinked && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onSaveAsReusable}
              disabled={saving}
            >
              <BookMarked className="h-4 w-4" />
            </Button>
          )}
          {canModify && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
              disabled={saving}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start px-4 py-0 h-10 rounded-none border-b bg-transparent">
          <TabsTrigger value="content" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Content
          </TabsTrigger>
          <TabsTrigger value="style" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Style
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="content" className="m-0 p-4 space-y-4">
            {section.is_locked ? (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                This section is locked. Unlock it to make changes.
              </div>
            ) : (
              config.fields.map((field) => (
                <FieldRenderer
                  key={field.name}
                  field={field}
                  value={content[field.name]}
                  onChange={(value) => handleFieldChange(field.name, value)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="style" className="m-0 p-4">
            <StyleOverrideEditor
              overrides={(content.styleOverrides as Record<string, unknown>) || {}}
              onChange={handleStyleOverridesChange}
              disabled={section.is_locked}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
