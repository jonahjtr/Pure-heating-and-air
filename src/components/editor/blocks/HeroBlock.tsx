import { useState } from 'react';
import { Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MediaPickerModal } from '../MediaPickerModal';
import { UrlInputWithTest } from '@/components/ui/url-input-with-test';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { HeroBlockContent, MediaItem } from '../types';

interface HeroBlockProps {
  content: HeroBlockContent;
  onChange: (content: HeroBlockContent) => void;
}

export function HeroBlock({ content, onChange }: HeroBlockProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelectBackground = (media: MediaItem) => {
    const url = supabase.storage.from('media').getPublicUrl(media.file_path).data.publicUrl;
    onChange({
      ...content,
      mediaId: media.id,
      backgroundUrl: url,
    });
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div
        className={cn(
          'relative w-full h-48 rounded-lg overflow-hidden',
          !content.backgroundUrl && 'bg-muted'
        )}
        style={content.backgroundUrl ? { backgroundImage: `url(${content.backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {content.overlay && content.backgroundUrl && (
          <div className="absolute inset-0 bg-black/50" />
        )}
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          {!content.backgroundUrl ? (
            <button
              onClick={() => setPickerOpen(true)}
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Image className="w-8 h-8" />
              <span className="text-sm">Select background image</span>
            </button>
          ) : (
            <>
              <h2 className={cn(
                'text-2xl font-bold mb-2',
                content.overlay ? 'text-white' : 'text-foreground'
              )}>
                {content.title || 'Hero Title'}
              </h2>
              <p className={cn(
                'text-sm mb-4',
                content.overlay ? 'text-white/80' : 'text-muted-foreground'
              )}>
                {content.subtitle || 'Hero subtitle goes here'}
              </p>
              {content.buttonText && (
                <Button size="sm">
                  {content.buttonText}
                </Button>
              )}
            </>
          )}
        </div>

        {content.backgroundUrl && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => setPickerOpen(true)}
          >
            Change
          </Button>
        )}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hero-title">Title</Label>
          <Input
            id="hero-title"
            value={content.title}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
            placeholder="Hero Title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-subtitle">Subtitle</Label>
          <Input
            id="hero-subtitle"
            value={content.subtitle}
            onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
            placeholder="Hero subtitle..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hero-button-text">Button Text</Label>
          <Input
            id="hero-button-text"
            value={content.buttonText}
            onChange={(e) => onChange({ ...content, buttonText: e.target.value })}
            placeholder="Get Started"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-button-url">Button URL</Label>
          <UrlInputWithTest
            id="hero-button-url"
            value={content.buttonUrl}
            onChange={(url) => onChange({ ...content, buttonUrl: url })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="hero-overlay">Dark Overlay</Label>
          <p className="text-xs text-muted-foreground">Add dark overlay for better text readability</p>
        </div>
        <Switch
          id="hero-overlay"
          checked={content.overlay}
          onCheckedChange={(checked) => onChange({ ...content, overlay: checked })}
        />
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelectBackground}
        fileType="image"
      />
    </div>
  );
}
