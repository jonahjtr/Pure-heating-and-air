import { 
  Type, 
  Image, 
  MousePointer2, 
  Columns, 
  LayoutGrid, 
  ChevronsUpDown, 
  Sparkles,
  Heading,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Block, BlockType } from './types';
import type { ReusableComponent } from '@/hooks/useReusableComponents';

interface BlockToolbarProps {
  onAddBlock: (type: BlockType) => void;
  onAddReusable?: (component: ReusableComponent) => void;
  reusableComponents?: ReusableComponent[];
}

const blockOptions: { type: BlockType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'headline', label: 'Headline', icon: Heading, description: 'Section heading with controls' },
  { type: 'text', label: 'Text', icon: Type, description: 'Rich text content' },
  { type: 'image', label: 'Image', icon: Image, description: 'Single image with caption' },
  { type: 'button', label: 'Button', icon: MousePointer2, description: 'Call to action button' },
  { type: 'columns', label: 'Columns', icon: Columns, description: '2 or 3 column layout' },
  { type: 'card-grid', label: 'Card Grid', icon: LayoutGrid, description: 'Grid of cards' },
  { type: 'accordion', label: 'Accordion', icon: ChevronsUpDown, description: 'Expandable sections' },
  { type: 'hero', label: 'Hero', icon: Sparkles, description: 'Full-width hero section' },
];

export function BlockToolbar({ onAddBlock, onAddReusable, reusableComponents = [] }: BlockToolbarProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full border-dashed gap-2">
          <Plus className="w-4 h-4" />
          Add Block
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2 max-h-[400px] overflow-y-auto" align="center">
        <div className="grid gap-1">
          {blockOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => onAddBlock(option.type)}
              className="flex items-center gap-3 w-full p-2 rounded-md text-left hover:bg-muted transition-colors"
            >
              <div className="p-2 rounded-md bg-primary/10">
                <option.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </button>
          ))}
          
          {reusableComponents.length > 0 && onAddReusable && (
            <>
              <Separator className="my-2" />
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Package className="w-3 h-3" />
                Reusable Components
              </p>
              {reusableComponents.map((component) => (
                <button
                  key={component.id}
                  onClick={() => onAddReusable(component)}
                  className="flex items-center gap-3 w-full p-2 rounded-md text-left hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-md bg-secondary">
                    <Package className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{component.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{component.block_type}</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
