import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UrlInputWithTest, ValidationMessage } from '@/components/ui/url-input-with-test';
import { cn } from '@/lib/utils';
import { validateRequired } from '@/lib/validation';
import type { ButtonBlockContent } from '../types';

interface ButtonBlockProps {
  content: ButtonBlockContent;
  onChange: (content: ButtonBlockContent) => void;
}

export function ButtonBlock({ content, onChange }: ButtonBlockProps) {
  const textValidation = validateRequired(content.text, 'Button text');

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className={cn(
        'p-4 bg-muted/50 rounded-lg',
        content.alignment === 'center' && 'text-center',
        content.alignment === 'right' && 'text-right'
      )}>
        <Button
          variant={content.variant === 'primary' ? 'default' : content.variant === 'secondary' ? 'secondary' : 'outline'}
          className="pointer-events-none"
        >
          {content.text || 'Button Text'}
        </Button>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="button-text">Button Text</Label>
          <Input
            id="button-text"
            value={content.text}
            onChange={(e) => onChange({ ...content, text: e.target.value })}
            placeholder="Click me"
            className={cn(!textValidation.valid && content.text !== '' && 'border-destructive')}
          />
          {!textValidation.valid && content.text !== '' && (
            <ValidationMessage message={textValidation.message} />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="button-url">Link URL</Label>
          <UrlInputWithTest
            id="button-url"
            value={content.url}
            onChange={(url) => onChange({ ...content, url })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Label>Style</Label>
          <Select
            value={content.variant}
            onValueChange={(value: 'primary' | 'secondary' | 'outline') => 
              onChange({ ...content, variant: value })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Alignment</Label>
          <div className="flex items-center gap-1">
            <Button
              variant={content.alignment === 'left' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9"
              onClick={() => onChange({ ...content, alignment: 'left' })}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={content.alignment === 'center' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9"
              onClick={() => onChange({ ...content, alignment: 'center' })}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant={content.alignment === 'right' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9"
              onClick={() => onChange({ ...content, alignment: 'right' })}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
