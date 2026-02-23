import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Upload, Image, FileText, Check, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { TagFilter } from '@/components/media/TagFilter';
import type { MediaItem } from './types';

interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: MediaItem) => void;
  fileType?: 'image' | 'all';
}

export function MediaPickerModal({ 
  open, 
  onOpenChange, 
  onSelect,
  fileType = 'all' 
}: MediaPickerModalProps) {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchMedia = async () => {
    try {
      let query = supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (fileType === 'image') {
        query = query.like('file_type', 'image/%');
      }

      const { data, error } = await query;
      if (error) throw error;
      // Ensure tags is always an array
      const mediaWithTags = (data || []).map((item) => ({
        ...item,
        tags: item.tags || [],
      }));
      setMedia(mediaWithTags);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
      setSelected(null);
      setSearchQuery('');
      setSelectedTags([]);
    }
  }, [open, fileType]);

  // Extract all unique tags
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    media.forEach((item) => {
      (item.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [media]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error: dbError } = await supabase.from('media').insert([{
        name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
        tags: [],
      }]).select().single();

      if (dbError) throw dbError;

      toast.success('File uploaded');
      fetchMedia();
      
      // Auto-select the newly uploaded file
      if (data) {
        setSelected({ ...data, tags: data.tags || [] });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [user]);

  const getPublicUrl = (filePath: string) => {
    return supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl;
  };

  const isImage = (fileType: string) => fileType.startsWith('image/');

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.alt_text || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // Tag filter
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every((tag) => (item.tags || []).includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [media, searchQuery, selectedTags]);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {availableTags.length > 0 && (
              <Button
                variant={showFilters ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            )}
            <div>
              <input
                type="file"
                accept={fileType === 'image' ? 'image/*' : 'image/*,.pdf,.doc,.docx'}
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
                id="media-picker-upload"
                disabled={uploading}
              />
              <Button asChild variant="outline" disabled={uploading}>
                <label htmlFor="media-picker-upload" className="cursor-pointer gap-2">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </label>
              </Button>
            </div>
          </div>

          {showFilters && (
            <TagFilter
              availableTags={availableTags}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          )}
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'flex-1 overflow-y-auto min-h-[300px] border rounded-lg transition-all',
            dragActive ? 'border-primary bg-primary/5' : 'border-border'
          )}
        >
          {loading ? (
            <div className="grid grid-cols-4 gap-3 p-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Image className="w-10 h-10 mb-2 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery || selectedTags.length > 0 
                  ? 'No media matches your search or filters' 
                  : 'No media uploaded yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop files here or click Upload
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 p-4">
              {filteredMedia.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={cn(
                    'aspect-square relative rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring',
                    selected?.id === item.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-border'
                  )}
                >
                  {isImage(item.file_type) ? (
                    <img
                      src={getPublicUrl(item.file_path)}
                      alt={item.alt_text || item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  {selected?.id === item.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5">
                      {item.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 bg-black/60 text-white border-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selected ? `Selected: ${selected.name}` : 'No file selected'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selected}>
              Select
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
