import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { NavigationEditor } from './NavigationEditor';
import type { FooterColumn } from '@/types/siteLayout';

interface FooterColumnsEditorProps {
  columns: FooterColumn[];
  onChange: (columns: FooterColumn[]) => void;
}

export function FooterColumnsEditor({ columns, onChange }: FooterColumnsEditorProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const addColumn = () => {
    const newColumn: FooterColumn = {
      id: crypto.randomUUID(),
      title: 'New Column',
      links: [],
    };
    onChange([...columns, newColumn]);
  };

  const updateColumn = (index: number, updates: Partial<FooterColumn>) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeColumn = (index: number) => {
    onChange(columns.filter((_, i) => i !== index));
    setDeleteIndex(null);
  };

  const moveColumn = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= columns.length) return;
    
    const updated = [...columns];
    [updated[fromIndex], updated[toIndex]] = [updated[toIndex], updated[fromIndex]];
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {columns.map((column, index) => (
          <Card key={column.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <Input
                  value={column.title}
                  onChange={(e) => updateColumn(index, { title: e.target.value })}
                  className="h-8 font-medium"
                  placeholder="Column Title"
                />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveColumn(index, 'left')}
                    disabled={index === 0}
                  >
                    ←
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveColumn(index, 'right')}
                    disabled={index === columns.length - 1}
                  >
                    →
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
            </CardHeader>
            <CardContent>
              <NavigationEditor
                items={column.links}
                onChange={(links) => updateColumn(index, { links })}
                maxDepth={0}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addColumn} className="gap-2">
        <Plus className="w-4 h-4" />
        Add Column
      </Button>

      <ConfirmDeleteDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
        title="Delete Column"
        description="Are you sure you want to delete this footer column and all its links?"
        onConfirm={() => deleteIndex !== null && removeColumn(deleteIndex)}
      />
    </div>
  );
}
