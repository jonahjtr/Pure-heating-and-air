import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TextBlockContent } from '../types';

interface TextBlockProps {
  content: TextBlockContent;
  onChange: (content: TextBlockContent) => void;
}

export function TextBlock({ content, onChange }: TextBlockProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Button
          variant={content.alignment === 'left' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange({ ...content, alignment: 'left' })}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant={content.alignment === 'center' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange({ ...content, alignment: 'center' })}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant={content.alignment === 'right' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange({ ...content, alignment: 'right' })}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>
      <Textarea
        value={content.text}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="Enter your text here..."
        className={cn(
          'min-h-[100px] resize-y',
          content.alignment === 'center' && 'text-center',
          content.alignment === 'right' && 'text-right'
        )}
      />
    </div>
  );
}
