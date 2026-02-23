import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { FieldRenderer } from '@/components/sections/editor/FieldRenderer';
import { getSectionConfig } from '@/lib/sectionRegistry';
import type { PageSection, FieldDefinition } from '@/types/sections';

interface SectionSettingsPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: PageSection | null;
  onUpdateContent: (content: Record<string, unknown>) => void;
  saving: boolean;
}

export function SectionSettingsPopover({
  open,
  onOpenChange,
  section,
  onUpdateContent,
  saving,
}: SectionSettingsPopoverProps) {
  if (!section) return null;

  const config = getSectionConfig(section.section_type);
  const content = section.content_json as Record<string, unknown>;

  const handleFieldChange = (fieldName: string, value: unknown) => {
    const updatedContent = {
      ...content,
      [fieldName]: value,
    };
    onUpdateContent(updatedContent);
  };

  // Filter to complex fields only (repeaters, images, selects)
  const complexFields = config.fields.filter(
    (field) =>
      field.type === 'repeater' ||
      field.type === 'image' ||
      field.type === 'select' ||
      field.type === 'richtext' ||
      field.type === 'color'
  );

  // If no complex fields, show all fields
  const fieldsToShow = complexFields.length > 0 ? complexFields : config.fields;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{config.label} Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {fieldsToShow.map((field) => (
            <div key={field.name} className={saving || section.is_locked ? 'opacity-50 pointer-events-none' : ''}>
              <FieldRenderer
                field={field}
                value={content[field.name]}
                onChange={(value) => handleFieldChange(field.name, value)}
              />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
