import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ availableTags, selectedTags, onTagsChange }: TagFilterProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAll = () => {
    onTagsChange([]);
  };

  if (availableTags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Filter by tags:</span>
      {availableTags.slice(0, 10).map((tag) => (
        <Badge
          key={tag}
          variant={selectedTags.includes(tag) ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer transition-colors',
            selectedTags.includes(tag)
              ? 'hover:bg-primary/80'
              : 'hover:bg-muted'
          )}
          onClick={() => toggleTag(tag)}
        >
          {tag}
        </Badge>
      ))}
      {selectedTags.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 px-2">
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}