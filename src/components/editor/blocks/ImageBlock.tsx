import { useState } from 'react';
import { Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaPickerModal } from '../MediaPickerModal';
import { supabase } from '@/integrations/supabase/client';
import type { ImageBlockContent, MediaItem } from '../types';

interface ImageBlockProps {
  content: ImageBlockContent;
  onChange: (content: ImageBlockContent) => void;
}

export function ImageBlock({ content, onChange }: ImageBlockProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelect = (media: MediaItem) => {
    const url = supabase.storage.from('media').getPublicUrl(media.file_path).data.publicUrl;
    onChange({
      ...content,
      mediaId: media.id,
      url,
      alt: media.alt_text || media.name,
    });
  };

  return (
    <div className="space-y-4">
      {content.url ? (
        <div className="relative group">
          <img
            src={content.url}
            alt={content.alt}
            className="w-full max-h-[300px] object-contain rounded-lg bg-muted"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <Button variant="secondary" onClick={() => setPickerOpen(true)}>
              Change Image
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setPickerOpen(true)}
          className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-all"
        >
          <Image className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Click to select an image</span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="alt">Alt Text</Label>
          <Input
            id="alt"
            value={content.alt}
            onChange={(e) => onChange({ ...content, alt: e.target.value })}
            placeholder="Describe the image..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Input
            id="caption"
            value={content.caption}
            onChange={(e) => onChange({ ...content, caption: e.target.value })}
            placeholder="Optional caption..."
          />
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelect}
        fileType="image"
      />
    </div>
  );
}
