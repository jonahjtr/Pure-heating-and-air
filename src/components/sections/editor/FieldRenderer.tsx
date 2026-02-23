import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DeferredInput, DeferredTextarea } from '@/components/ui/deferred-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UrlInputWithTest } from '@/components/ui/url-input-with-test';
import { MediaPickerModal } from '@/components/editor/MediaPickerModal';
import { Plus, Trash2, GripVertical, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { FieldDefinition } from '@/types/sections';

// Helper to get public URL from file_path
function getPublicUrl(filePath: string): string {
  return supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl;
}

interface FieldRendererProps {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}

// Component for content type selection
function ContentTypeSelect({ value, onChange, field }: { value: string; onChange: (v: string) => void; field: FieldDefinition }) {
  const [contentTypes, setContentTypes] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContentTypes = async () => {
      const { data, error } = await supabase
        .from('content_types')
        .select('slug, name')
        .order('name');
      
      if (!error && data) {
        setContentTypes(data);
      }
      setLoading(false);
    };
    fetchContentTypes();
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value || ''} onValueChange={onChange} disabled={loading}>
        <SelectTrigger>
          <SelectValue placeholder={loading ? 'Loading...' : 'Select content type...'} />
        </SelectTrigger>
        <SelectContent>
          {contentTypes.map((ct) => (
            <SelectItem key={ct.slug} value={ct.slug}>
              {ct.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  switch (field.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <DeferredInput
            id={field.name}
            value={(value as string) || ''}
            onValueChange={(v) => onChange(v)}
            placeholder={field.placeholder}
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <DeferredTextarea
            id={field.name}
            value={(value as string) || ''}
            onValueChange={(v) => onChange(v)}
            placeholder={field.placeholder}
            rows={4}
          />
        </div>
      );

    case 'richtext':
      // For now, use a textarea - could be enhanced with a rich text editor
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <DeferredTextarea
            id={field.name}
            value={(value as string) || ''}
            onValueChange={(v) => onChange(v)}
            placeholder={field.placeholder}
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">Supports basic HTML formatting</p>
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={field.name}
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.valueAsNumber || 0)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
          />
        </div>
      );

    case 'link':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <UrlInputWithTest
            value={(value as string) || ''}
            onChange={onChange as (value: string) => void}
            placeholder={field.placeholder || 'https://...'}
          />
        </div>
      );

    case 'select':
      // Special handling for content_type_slug field
      if (field.name === 'content_type_slug') {
        return (
          <ContentTypeSelect
            value={(value as string) || ''}
            onChange={onChange as (value: string) => void}
            field={field}
          />
        );
      }

      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={(value as string) || (field.defaultValue as string) || ''}
            onValueChange={onChange as (value: string) => void}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={(value as boolean) ?? (field.defaultValue as boolean) ?? false}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <Label htmlFor={field.name} className="cursor-pointer">
            {field.label}
          </Label>
        </div>
      );

    case 'color':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id={field.name}
              value={(value as string) || (field.defaultValue as string) || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <Input
              value={(value as string) || (field.defaultValue as string) || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>
      );

    case 'image':
      const imageValue = value as { mediaId?: string; url: string; alt: string } | null;
      return (
        <div className="space-y-2">
          <Label>{field.label}</Label>
          <div className="border rounded-lg p-4 space-y-3">
            {imageValue?.url ? (
              <div className="relative">
                <img
                  src={imageValue.url}
                  alt={imageValue.alt || 'Preview'}
                  className="w-full max-h-48 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onChange(null)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 bg-muted rounded border-2 border-dashed">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMediaPickerOpen(true)}
                className="flex-1"
              >
                {imageValue?.url ? 'Change Image' : 'Select Image'}
              </Button>
            </div>
            {imageValue?.url && (
              <Input
                placeholder="Alt text..."
                value={imageValue.alt || ''}
                onChange={(e) =>
                  onChange({ ...imageValue, alt: e.target.value })
                }
              />
            )}
          </div>
          <MediaPickerModal
            open={mediaPickerOpen}
            onOpenChange={setMediaPickerOpen}
            onSelect={(media) => {
              onChange({
                mediaId: media.id,
                url: getPublicUrl(media.file_path),
                alt: media.alt_text || '',
              });
              setMediaPickerOpen(false);
            }}
          />
        </div>
      );

    case 'repeater':
      return (
        <RepeaterField
          field={field}
          value={value as Record<string, unknown>[]}
          onChange={onChange}
        />
      );

    default:
      return (
        <div className="text-sm text-muted-foreground">
          Unsupported field type: {field.type}
        </div>
      );
  }
}

// Repeater field component for handling arrays
interface RepeaterFieldProps {
  field: FieldDefinition;
  value: Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
}

function RepeaterField({ field, value, onChange }: RepeaterFieldProps) {
  const items = value || [];

  const addItem = () => {
    const newItem: Record<string, unknown> = { id: crypto.randomUUID() };
    field.fields?.forEach((f) => {
      newItem[f.name] = f.defaultValue ?? '';
    });
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: string, val: unknown) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: val };
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
          No items yet. Click "Add" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id as string || index}
              className="border rounded-lg p-4 space-y-3 bg-muted/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span>Item {index + 1}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {field.fields?.map((subField) => (
                <FieldRenderer
                  key={subField.name}
                  field={subField}
                  value={item[subField.name]}
                  onChange={(val) => updateItem(index, subField.name, val)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
