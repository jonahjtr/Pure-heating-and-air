import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FieldRenderer } from './FieldRenderer';
import { getSectionConfig } from '@/lib/sectionRegistry';
import type { PageSection } from '@/types/sections';
import { Loader2 } from 'lucide-react';

interface SectionEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: PageSection | null;
  onSave: (content: Record<string, unknown>) => Promise<boolean>;
  saving?: boolean;
}

export function SectionEditSheet({
  open,
  onOpenChange,
  section,
  onSave,
  saving = false,
}: SectionEditSheetProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when section changes
  useEffect(() => {
    if (section) {
      setFormData({ ...section.content_json });
      setHasChanges(false);
    }
  }, [section]);

  if (!section) return null;

  const config = getSectionConfig(section.section_type);

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await onSave(formData);
    if (success) {
      setHasChanges(false);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      // Could add a confirmation dialog here
    }
    setFormData({ ...section.content_json });
    setHasChanges(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit {config.label}</SheetTitle>
          <SheetDescription>{config.description}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 py-4">
          <div className="space-y-6">
            {config.fields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={(value) => handleFieldChange(field.name, value)}
              />
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
