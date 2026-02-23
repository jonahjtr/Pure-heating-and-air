import { useState } from 'react';
import { Plus, Trash2, Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import type { SocialLink } from '@/types/siteLayout';

interface SocialLinksEditorProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

const platformOptions: { value: SocialLink['platform']; label: string; icon: React.ElementType }[] = [
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'tiktok', label: 'TikTok', icon: Link },
  { value: 'pinterest', label: 'Pinterest', icon: Link },
  { value: 'custom', label: 'Custom', icon: Link },
];

export function SocialLinksEditor({ links, onChange }: SocialLinksEditorProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const addLink = () => {
    const newLink: SocialLink = {
      id: crypto.randomUUID(),
      platform: 'facebook',
      url: '',
    };
    onChange([...links, newLink]);
  };

  const updateLink = (index: number, updates: Partial<SocialLink>) => {
    const updated = [...links];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
    setDeleteIndex(null);
  };

  return (
    <div className="space-y-3">
      {links.map((link, index) => {
        const platform = platformOptions.find(p => p.value === link.platform);
        const Icon = platform?.icon || Link;
        
        return (
          <div 
            key={link.id} 
            className="flex items-center gap-2 border rounded-lg p-2 bg-muted/30"
          >
            <div className="p-2 bg-background rounded">
              <Icon className="w-4 h-4" />
            </div>
            <Select
              value={link.platform}
              onValueChange={(value) => updateLink(index, { platform: value as SocialLink['platform'] })}
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={link.url}
              onChange={(e) => updateLink(index, { url: e.target.value })}
              placeholder="https://..."
              className="flex-1 h-8"
            />
            {link.platform === 'custom' && (
              <Input
                value={link.label || ''}
                onChange={(e) => updateLink(index, { label: e.target.value })}
                placeholder="Label"
                className="w-24 h-8"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setDeleteIndex(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      })}

      <Button variant="outline" size="sm" onClick={addLink} className="w-full gap-2">
        <Plus className="w-4 h-4" />
        Add Social Link
      </Button>

      <ConfirmDeleteDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
        title="Delete Social Link"
        description="Are you sure you want to delete this social link?"
        onConfirm={() => deleteIndex !== null && removeLink(deleteIndex)}
      />
    </div>
  );
}
