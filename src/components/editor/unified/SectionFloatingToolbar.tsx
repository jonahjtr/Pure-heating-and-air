import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Settings,
  Copy,
  Palette,
  BookMarked,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionFloatingToolbarProps {
  sectionId: string;
  sectionLabel: string;
  isVisible: boolean;
  isLocked: boolean;
  isAdmin: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isLinked?: boolean;
  reusableName?: string;
  position: { top: number; left: number; width: number };
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onOpenSettings: () => void;
  onOpenStyleInspector: () => void;
  onSaveAsReusable: () => void;
  saving?: boolean;
}

export function SectionFloatingToolbar({
  sectionLabel,
  isVisible,
  isLocked,
  isAdmin,
  canMoveUp,
  canMoveDown,
  isLinked,
  reusableName,
  position,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onOpenSettings,
  onOpenStyleInspector,
  onSaveAsReusable,
  saving = false,
}: SectionFloatingToolbarProps) {
  const canModify = isAdmin && !isLocked;

  const toolbarStyle: React.CSSProperties = {
    position: 'fixed',
    top: Math.max(position.top - 48, 8),
    left: position.left,
    width: position.width,
    zIndex: 50,
  };

  const toolbar = (
    <div 
      style={toolbarStyle}
      data-floating-toolbar
      className="flex items-center justify-between gap-2 bg-background border rounded-lg shadow-lg px-2 py-1.5"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 text-sm font-medium px-2 min-w-0">
        <span className="truncate">{sectionLabel}</span>
        {isLinked && reusableName && (
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded truncate max-w-[100px]">
            {reusableName}
          </span>
        )}
        {isLocked && (
          <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        {/* Move buttons */}
        {canModify && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onMoveUp}
                  disabled={!canMoveUp || saving}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move up</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onMoveDown}
                  disabled={!canMoveDown || saving}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move down</TooltipContent>
            </Tooltip>
          </>
        )}

        <div className="w-px h-4 bg-border mx-1" />

        {/* Style inspector */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onOpenStyleInspector}
              disabled={isLocked || saving}
            >
              <Palette className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Style overrides</TooltipContent>
        </Tooltip>

        {/* Settings (for complex fields) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onOpenSettings}
              disabled={isLocked || saving}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Section settings</TooltipContent>
        </Tooltip>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Visibility toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleVisibility}
              disabled={saving}
            >
              {isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isVisible ? 'Hide section' : 'Show section'}</TooltipContent>
        </Tooltip>

        {/* Lock toggle (admin only) */}
        {isAdmin && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onToggleLock}
                disabled={saving}
              >
                {isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isLocked ? 'Unlock section' : 'Lock section'}</TooltipContent>
          </Tooltip>
        )}

        {/* Save as reusable */}
        {canModify && !isLinked && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onSaveAsReusable}
                disabled={saving}
              >
                <BookMarked className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save as reusable</TooltipContent>
          </Tooltip>
        )}

        {/* Delete button */}
        {canModify && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={onDelete}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete section</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return createPortal(toolbar, document.body);
}
