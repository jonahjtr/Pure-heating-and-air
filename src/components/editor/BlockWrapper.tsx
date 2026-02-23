import { ReactNode, useState } from 'react';
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Palette, Settings2, Package, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StyleInspector } from './StyleInspector';
import { SaveAsReusableDialog } from './SaveAsReusableDialog';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import type { StyleOverrides } from './types';

interface BlockWrapperProps {
  children: ReactNode;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  label: string;
  styleOverrides?: StyleOverrides;
  onStyleChange?: (overrides: StyleOverrides) => void;
  onInspectorOpen?: () => void;
  onSaveAsReusable?: (name: string, description: string) => Promise<void>;
  isReusable?: boolean;
  reusableName?: string;
}

export function BlockWrapper({
  children,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  label,
  styleOverrides,
  onStyleChange,
  onInspectorOpen,
  onSaveAsReusable,
  isReusable,
  reusableName,
}: BlockWrapperProps) {
  const [styleInspectorOpen, setStyleInspectorOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const hasCustomStyles = styleOverrides?.useCustomStyles;

  const handleDeleteConfirm = () => {
    onDelete();
  };

  return (
    <div className="group relative border border-transparent hover:border-border rounded-lg transition-all">
      {/* Controls bar */}
      <div className="absolute -top-3 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm px-2 py-1">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          <span className="text-xs font-medium text-muted-foreground capitalize">{label}</span>
          {hasCustomStyles && (
            <span className="ml-1 w-2 h-2 rounded-full bg-primary" title="Custom styles applied" />
          )}
          {isReusable && (
            <span className="ml-1 flex items-center gap-1 text-xs text-primary" title={`Linked to: ${reusableName}`}>
              <Link2 className="w-3 h-3" />
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-0.5 bg-background border rounded-md shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-border" />
          {onInspectorOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onInspectorOpen}
              title="Block settings"
            >
              <Settings2 className="w-4 h-4" />
            </Button>
          )}
          {onStyleChange && (
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7", hasCustomStyles && "text-primary")}
              onClick={() => setStyleInspectorOpen(true)}
              title="Style settings"
            >
              <Palette className="w-4 h-4" />
            </Button>
          )}
          {onSaveAsReusable && !isReusable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSaveDialogOpen(true)}
              title="Save as reusable component"
            >
              <Package className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDuplicate}
            title="Duplicate block"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
            title="Delete block"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Block content */}
      <div className={cn(
        'p-4 rounded-lg transition-colors',
        'group-hover:bg-muted/30',
        isReusable && 'ring-1 ring-primary/20'
      )}>
        {children}
      </div>

      {/* Style Inspector */}
      {onStyleChange && (
        <StyleInspector
          open={styleInspectorOpen}
          onOpenChange={setStyleInspectorOpen}
          overrides={styleOverrides}
          onChange={onStyleChange}
          blockType={label}
        />
      )}

      {/* Save as Reusable Dialog */}
      {onSaveAsReusable && (
        <SaveAsReusableDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          onSave={onSaveAsReusable}
          blockType={label}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Block"
        description={`Are you sure you want to delete this ${label} block? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
