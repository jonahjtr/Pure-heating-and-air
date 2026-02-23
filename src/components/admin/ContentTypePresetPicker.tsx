import { useState } from 'react';
import { FileText, Video, Images, Star, GitCompare, Newspaper, ShoppingBag, Check, Sparkles, PenLine } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { contentTypePresets, type ContentTypePreset } from '@/lib/contentTypePresets';

interface ContentTypePresetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPreset: (preset: ContentTypePreset) => void;
  onStartFromScratch: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  'file-text': FileText,
  'video': Video,
  'images': Images,
  'star': Star,
  'git-compare': GitCompare,
  'newspaper': Newspaper,
  'shopping-bag': ShoppingBag,
  'custom': PenLine,
};

export function ContentTypePresetPicker({
  open,
  onOpenChange,
  onSelectPreset,
  onStartFromScratch,
}: ContentTypePresetPickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedId === 'custom') {
      onStartFromScratch();
      onOpenChange(false);
      return;
    }
    if (selectedId) {
      const preset = contentTypePresets.find(p => p.id === selectedId);
      if (preset) {
        onSelectPreset(preset);
        onOpenChange(false);
      }
    }
  };

  // All options including custom at the end
  const allOptions = [
    ...contentTypePresets.map(p => ({ ...p, isCustom: false })),
    { id: 'custom', name: 'Custom', description: 'Start from scratch', icon: 'custom', fields: [], isCustom: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Choose a Content Type
          </DialogTitle>
          <DialogDescription>
            Start with a preset to get pre-configured fields, or create your own.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allOptions.map((option) => {
              const Icon = iconMap[option.icon] || FileText;
              const isSelected = selectedId === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedId(option.id)}
                  className={cn(
                    'relative text-left p-4 rounded-lg border-2 transition-all',
                    'hover:border-primary/50 hover:bg-accent/50',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border bg-card'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2.5 rounded-lg shrink-0',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground">{option.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {option.description}
                      </p>
                      {!option.isCustom && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {option.fields.length} fields
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={!selectedId}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
