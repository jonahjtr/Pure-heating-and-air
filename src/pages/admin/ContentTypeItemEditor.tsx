import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, Send } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaPickerModal } from '@/components/editor/MediaPickerModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface FieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext' | 'number' | 'date' | 'image' | 'select' | 'checkbox' | 'repeater';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface ContentType {
  id: string;
  name: string;
  slug: string;
  fields: FieldDefinition[];
}

export default function ContentTypeItemEditor() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id || id === 'new';

  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [title, setTitle] = useState('');
  const [itemSlug, setItemSlug] = useState('');
  const [data, setData] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaPickerField, setMediaPickerField] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchContentType();
    }
  }, [slug, id]);

  const fetchContentType = async () => {
    try {
      // Fetch content type
      const { data: ct, error: ctError } = await supabase
        .from('content_types')
        .select('id, name, slug, fields')
        .eq('slug', slug)
        .single();

      if (ctError) throw ctError;
      
      const contentTypeData: ContentType = {
        id: ct.id,
        name: ct.name,
        slug: ct.slug,
        fields: (ct.fields as unknown as FieldDefinition[]) || [],
      };
      setContentType(contentTypeData);

      // If editing, fetch the item
      if (!isNew && id) {
        const { data: item, error: itemError } = await supabase
          .from('content_type_items')
          .select('*')
          .eq('id', id)
          .single();

        if (itemError) throw itemError;

        setTitle(item.title);
        setItemSlug(item.slug);
        setData((item.data as Record<string, any>) || {});
        setStatus(item.status as 'draft' | 'published');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load content');
      navigate(`/admin/content/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (isNew || !itemSlug) {
      setItemSlug(generateSlug(newTitle));
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = async (publishNow = false) => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!itemSlug.trim()) {
      toast.error('Please enter a slug');
      return;
    }

    if (!contentType) return;

    // Validate required fields
    for (const field of contentType.fields) {
      if (field.required && !data[field.name]) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    setSaving(true);
    const newStatus = publishNow ? 'published' : status;

    try {
      const payload = {
        content_type_id: contentType.id,
        title,
        slug: itemSlug,
        data: data as Json,
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { error } = await supabase
          .from('content_type_items')
          .insert({ ...payload, author_id: user?.id });

        if (error) throw error;
        toast.success(`${contentType.name.replace(/s$/, '')} created!`);
        navigate(`/admin/content/${slug}`);
      } else {
        const { error } = await supabase
          .from('content_type_items')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
        setStatus(newStatus);
        toast.success(`${contentType.name.replace(/s$/, '')} saved!`);
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      if (error.code === '23505') {
        toast.error('An item with this slug already exists');
      } else {
        toast.error('Failed to save');
      }
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FieldDefinition) => {
    const value = data[field.name] ?? '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
      case 'richtext':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.type === 'richtext' ? 8 : 4}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(v) => handleFieldChange(field.name, v)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.id}
              checked={!!value}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
            <Label htmlFor={field.id} className="text-sm font-normal">
              {field.placeholder || 'Yes'}
            </Label>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            {value?.url && (
              <img
                src={value.url}
                alt={value.alt || ''}
                className="w-32 h-32 object-cover rounded-lg border"
              />
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setMediaPickerField(field.name)}
            >
              {value?.url ? 'Change Image' : 'Select Image'}
            </Button>
          </div>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  if (loading || !contentType) {
    return (
      <AdminLayout
        title="Loading..."
        breadcrumbs={[{ label: 'Content' }, { label: 'Loading...' }]}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded-lg w-1/3" />
          <div className="h-[400px] bg-muted rounded-lg" />
        </div>
      </AdminLayout>
    );
  }

  const singularName = contentType.name.replace(/s$/, '');

  return (
    <AdminLayout
      title={isNew ? `New ${singularName}` : `Edit ${singularName}`}
      breadcrumbs={[
        { label: contentType.name, href: `/admin/content/${slug}` },
        { label: isNew ? 'New' : title || 'Untitled' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/content/${slug}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            <Send className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Publish'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={`Enter ${singularName.toLowerCase()} title...`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={itemSlug}
                  onChange={(e) => setItemSlug(e.target.value)}
                  placeholder="url-friendly-slug"
                />
              </div>
            </CardContent>
          </Card>

          {contentType.fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contentType.fields.map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label>Published</Label>
                <Switch
                  checked={status === 'published'}
                  onCheckedChange={(checked) => setStatus(checked ? 'published' : 'draft')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MediaPickerModal
        open={!!mediaPickerField}
        onOpenChange={(open) => !open && setMediaPickerField(null)}
        onSelect={(media) => {
          if (mediaPickerField) {
            const publicUrl = supabase.storage
              .from('media')
              .getPublicUrl(media.file_path).data.publicUrl;
            handleFieldChange(mediaPickerField, {
              mediaId: media.id,
              url: publicUrl,
              alt: media.alt_text || media.name,
            });
          }
          setMediaPickerField(null);
        }}
        fileType="image"
      />
    </AdminLayout>
  );
}
