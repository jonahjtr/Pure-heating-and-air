import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { AccordionBlockContent, AccordionItem as AccordionItemType } from '../types';

interface AccordionBlockProps {
  content: AccordionBlockContent;
  onChange: (content: AccordionBlockContent) => void;
}

export function AccordionBlock({ content, onChange }: AccordionBlockProps) {
  const handleAddItem = () => {
    const newItem: AccordionItemType = {
      id: crypto.randomUUID(),
      title: 'New Question',
      content: 'Answer goes here...',
    };
    onChange({ ...content, items: [...content.items, newItem] });
  };

  const handleUpdateItem = (itemId: string, updates: Partial<AccordionItemType>) => {
    const newItems = content.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    onChange({ ...content, items: newItems });
  };

  const handleDeleteItem = (itemId: string) => {
    onChange({ ...content, items: content.items.filter(i => i.id !== itemId) });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.items.length) return;

    const newItems = [...content.items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onChange({ ...content, items: newItems });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Create expandable FAQ or accordion sections
      </p>

      {content.items.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No accordion items yet</p>
          <Button onClick={handleAddItem} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {content.items.map((item, index) => (
            <div key={item.id} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 p-3 bg-muted/30">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <Input
                  value={item.title}
                  onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                  placeholder="Question or title..."
                  className="flex-1 h-8 bg-background"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-3">
                <Textarea
                  value={item.content}
                  onChange={(e) => handleUpdateItem(item.id, { content: e.target.value })}
                  placeholder="Answer or content..."
                  className="min-h-[80px] resize-y"
                />
              </div>
            </div>
          ))}

          <Button onClick={handleAddItem} variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      )}

      {/* Preview */}
      {content.items.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm font-medium mb-3">Preview</p>
          <Accordion type="single" collapsible className="w-full">
            {content.items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
