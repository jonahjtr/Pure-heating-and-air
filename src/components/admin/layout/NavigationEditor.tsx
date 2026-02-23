import { useState } from 'react';
import { Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import type { NavMenuItem } from '@/types/siteLayout';

interface NavigationEditorProps {
  items: NavMenuItem[];
  onChange: (items: NavMenuItem[]) => void;
  maxDepth?: number;
}

export function NavigationEditor({ items, onChange, maxDepth = 1 }: NavigationEditorProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const addItem = () => {
    const newItem: NavMenuItem = {
      id: crypto.randomUUID(),
      label: 'New Link',
      url: '/',
      openInNewTab: false,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, updates: Partial<NavMenuItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    setDeleteIndex(null);
  };

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= items.length) return;
    
    const updated = [...items];
    [updated[fromIndex], updated[toIndex]] = [updated[toIndex], updated[fromIndex]];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className="border rounded-lg p-3 space-y-3 bg-muted/30"
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input
                value={item.label}
                onChange={(e) => updateItem(index, { label: e.target.value })}
                placeholder="Label"
                className="h-8"
              />
              <Input
                value={item.url}
                onChange={(e) => updateItem(index, { url: e.target.value })}
                placeholder="/page or https://..."
                className="h-8"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => setDeleteIndex(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pl-6">
            <div className="flex items-center gap-2">
              <Switch
                id={`new-tab-${item.id}`}
                checked={item.openInNewTab || false}
                onCheckedChange={(checked) => updateItem(index, { openInNewTab: checked })}
              />
              <Label htmlFor={`new-tab-${item.id}`} className="text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Open in new tab
              </Label>
            </div>
          </div>

          {/* Nested items - simplified for now */}
          {maxDepth > 0 && item.children && item.children.length > 0 && (
            <div className="pl-6 border-l-2 border-muted ml-2">
              <NavigationEditor
                items={item.children}
                onChange={(children) => updateItem(index, { children })}
                maxDepth={maxDepth - 1}
              />
            </div>
          )}
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem} className="w-full gap-2">
        <Plus className="w-4 h-4" />
        Add Menu Item
      </Button>

      <ConfirmDeleteDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
        title="Delete Menu Item"
        description="Are you sure you want to delete this menu item?"
        onConfirm={() => deleteIndex !== null && removeItem(deleteIndex)}
      />
    </div>
  );
}
