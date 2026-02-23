import { useState } from 'react';
import { Plus, Trash2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaPickerModal } from '../MediaPickerModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { CardGridBlockContent, CardItem, MediaItem } from '../types';

interface CardGridBlockProps {
  content: CardGridBlockContent;
  onChange: (content: CardGridBlockContent) => void;
}

export function CardGridBlock({ content, onChange }: CardGridBlockProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const handleAddCard = () => {
    const newCard: CardItem = {
      id: crypto.randomUUID(),
      title: 'Card Title',
      description: 'Card description goes here.',
      mediaId: null,
      imageUrl: '',
      linkUrl: '',
    };
    onChange({ ...content, cards: [...content.cards, newCard] });
  };

  const handleUpdateCard = (cardId: string, updates: Partial<CardItem>) => {
    const newCards = content.cards.map(card =>
      card.id === cardId ? { ...card, ...updates } : card
    );
    onChange({ ...content, cards: newCards });
  };

  const handleDeleteCard = (cardId: string) => {
    onChange({ ...content, cards: content.cards.filter(c => c.id !== cardId) });
  };

  const handleSelectImage = (cardId: string) => {
    setEditingCardId(cardId);
    setPickerOpen(true);
  };

  const handleMediaSelect = (media: MediaItem) => {
    if (!editingCardId) return;
    const url = supabase.storage.from('media').getPublicUrl(media.file_path).data.publicUrl;
    handleUpdateCard(editingCardId, { mediaId: media.id, imageUrl: url });
    setEditingCardId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Label>Columns</Label>
        <Select
          value={content.columns.toString()}
          onValueChange={(value) => onChange({ ...content, columns: parseInt(value) as 2 | 3 | 4 })}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={cn(
        'grid gap-4',
        content.columns === 2 && 'grid-cols-2',
        content.columns === 3 && 'grid-cols-3',
        content.columns === 4 && 'grid-cols-4'
      )}>
        {content.cards.map((card) => (
          <div
            key={card.id}
            className="border border-border rounded-lg p-3 space-y-3 bg-card"
          >
            <div className="relative">
              {card.imageUrl ? (
                <div className="relative group">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleSelectImage(card.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                  >
                    <span className="text-xs text-white">Change</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSelectImage(card.id)}
                  className="w-full h-24 border border-dashed border-border rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors"
                >
                  <Image className="w-6 h-6 text-muted-foreground" />
                </button>
              )}
            </div>

            <Input
              value={card.title}
              onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
              placeholder="Card title"
              className="h-8 text-sm"
            />

            <Textarea
              value={card.description}
              onChange={(e) => handleUpdateCard(card.id, { description: e.target.value })}
              placeholder="Card description"
              className="text-sm min-h-[60px] resize-none"
            />

            <Input
              value={card.linkUrl}
              onChange={(e) => handleUpdateCard(card.id, { linkUrl: e.target.value })}
              placeholder="Link URL (optional)"
              className="h-8 text-sm"
            />

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => handleDeleteCard(card.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Card
            </Button>
          </div>
        ))}

        <button
          onClick={handleAddCard}
          className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-all min-h-[200px]"
        >
          <Plus className="w-6 h-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Add Card</span>
        </button>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleMediaSelect}
        fileType="image"
      />
    </div>
  );
}
