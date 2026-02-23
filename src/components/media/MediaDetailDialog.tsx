import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  alt_text: string | null;
  tags: string[];
  created_at: string;
}

interface MediaDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem | null;
  onUpdate: (media: MediaItem) => void;
}

export function MediaDetailDialog({
  open,
  onOpenChange,
  media,
  onUpdate,
}: MediaDetailDialogProps) {
  const [altText, setAltText] = useState(media?.alt_text || '');
  const [tags, setTags] = useState<string[]>(media?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync state when media changes
  useState(() => {
    setAltText(media?.alt_text || '');
    setTags(media?.tags || []);
  });

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!media) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('media')
        .update({
          alt_text: altText || null,
          tags,
        })
        .eq('id', media.id);

      if (error) throw error;

      onUpdate({ ...media, alt_text: altText || null, tags });
      toast.success('Media updated');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Failed to update media');
    } finally {
      setSaving(false);
    }
  };

  const getPublicUrl = (filePath: string) => {
    return supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!media) return null;

  const isImage = media.file_type.startsWith('image/');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Media Details</DialogTitle>
          <DialogDescription>
            Update alt text and tags for better organization and accessibility.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Preview */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {isImage ? (
              <img
                src={getPublicUrl(media.file_path)}
                alt={media.alt_text || media.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="font-medium">{media.name}</p>
                <p className="text-sm">{media.file_type}</p>
              </div>
            )}
          </div>

          {/* File info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{media.name}</span>
            <span>{formatFileSize(media.file_size)}</span>
          </div>

          {/* Alt text */}
          <div className="space-y-2">
            <Label htmlFor="alt-text">Alt Text</Label>
            <Textarea
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this image for accessibility..."
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Alt text helps screen readers describe images to visually impaired users.
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {tags.length === 0 && (
                <span className="text-sm text-muted-foreground">No tags added</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}