import { useState, useCallback } from 'react';
import { Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaPickerModal } from '@/components/editor/MediaPickerModal';
import { supabase } from '@/integrations/supabase/client';
import type { MediaItem } from '@/components/editor/types';

interface LogoPickerProps {
  logo: {
    mediaId: string | null;
    url: string;
    alt: string;
  };
  onChange: (logo: { mediaId: string | null; url: string; alt: string }) => void;
}

export function LogoPicker({ logo, onChange }: LogoPickerProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const getPublicUrl = (filePath: string) => {
    return supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl;
  };

  const handleMediaSelect = useCallback((media: MediaItem) => {
    onChange({
      mediaId: media.id,
      url: getPublicUrl(media.file_path),
      alt: media.alt_text || logo.alt,
    });
    setMediaPickerOpen(false);
  }, [logo.alt, onChange]);

  const clearLogo = () => {
    onChange({ mediaId: null, url: '', alt: 'Logo' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-32 h-20 border rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden">
          {logo.url ? (
            <img 
              src={logo.url} 
              alt={logo.alt} 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <Image className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setMediaPickerOpen(true)}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {logo.url ? 'Change' : 'Select'} Logo
            </Button>
            {logo.url && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearLogo}
              >
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended: SVG or PNG with transparent background
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input
          value={logo.alt}
          onChange={(e) => onChange({ ...logo, alt: e.target.value })}
          placeholder="Company Logo"
        />
      </div>

      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={handleMediaSelect}
        fileType="image"
      />
    </div>
  );
}
