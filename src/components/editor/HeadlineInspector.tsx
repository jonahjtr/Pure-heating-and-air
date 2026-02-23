import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ColorPicker } from '@/components/admin/settings/ColorPicker';
import type { HeadlineBlockContent } from './types';

interface HeadlineInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: HeadlineBlockContent;
  onChange: (content: HeadlineBlockContent) => void;
}

export function HeadlineInspector({
  open,
  onOpenChange,
  content,
  onChange,
}: HeadlineInspectorProps) {
  const handleChange = <K extends keyof HeadlineBlockContent>(
    key: K,
    value: HeadlineBlockContent[K]
  ) => {
    onChange({ ...content, [key]: value });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle>Headline Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Text Content */}
          <div className="space-y-2">
            <Label>Text Content</Label>
            <Textarea
              value={content.text}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Enter headline text..."
              rows={3}
            />
          </div>

          {/* HTML Tag */}
          <div className="space-y-2">
            <Label>HTML Tag</Label>
            <Select
              value={content.tag}
              onValueChange={(v) => handleChange('tag', v as HeadlineBlockContent['tag'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1 - Main Title</SelectItem>
                <SelectItem value="h2">H2 - Section Title</SelectItem>
                <SelectItem value="h3">H3 - Subsection</SelectItem>
                <SelectItem value="h4">H4 - Small Heading</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Font Size</Label>
              <span className="text-sm text-muted-foreground">{content.fontSize}px</span>
            </div>
            <Slider
              value={[content.fontSize]}
              onValueChange={([v]) => handleChange('fontSize', v)}
              min={16}
              max={96}
              step={1}
            />
          </div>

          {/* Color */}
          <ColorPicker
            label="Color"
            value={content.color}
            onChange={(v) => handleChange('color', v)}
          />

          {/* Alignment */}
          <div className="space-y-2">
            <Label>Alignment</Label>
            <div className="flex gap-1">
              <Button
                variant={content.alignment === 'left' ? 'default' : 'outline'}
                size="icon"
                onClick={() => handleChange('alignment', 'left')}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant={content.alignment === 'center' ? 'default' : 'outline'}
                size="icon"
                onClick={() => handleChange('alignment', 'center')}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant={content.alignment === 'right' ? 'default' : 'outline'}
                size="icon"
                onClick={() => handleChange('alignment', 'right')}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
