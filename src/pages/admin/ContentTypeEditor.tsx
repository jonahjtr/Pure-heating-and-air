import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';
import type { ContentTypePreset } from '@/lib/contentTypePresets';

interface FieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext' | 'number' | 'date' | 'image' | 'select' | 'checkbox' | 'repeater' | 'link';
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select type
}

interface ContentTypeData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  fields: FieldDefinition[];
  publishPageOnCreate: boolean;
}

const defaultData: ContentTypeData = {
  name: '',
  slug: '',
  description: '',
  icon: 'file-text',
  fields: [],
  publishPageOnCreate: false,
};

const fieldTypes = [
  { value: 'text', label: 'Text (single line)' },
  { value: 'textarea', label: 'Text Area (multi-line)' },
  { value: 'richtext', label: 'Rich Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'image', label: 'Image (media picker)' },
  { value: 'link', label: 'Link (URL)' },
  { value: 'select', label: 'Select (dropdown)' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'repeater', label: 'Repeater (list)' },
];

export default function ContentTypeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = !id; // On /new route, id is undefined

  // Check for preset data passed via navigation state
  const presetFromState = (location.state as { preset?: ContentTypePreset })?.preset;

  const [data, setData] = useState<ContentTypeData>(() => {
    if (presetFromState) {
      return {
        name: presetFromState.name,
        slug: presetFromState.slug,
        description: presetFromState.description,
        icon: presetFromState.icon,
        fields: presetFromState.fields.map(f => ({
          ...f,
          id: crypto.randomUUID(), // Generate fresh IDs
        })),
        publishPageOnCreate: false,
      };
    }
    return defaultData;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
    } else if (id) {
      fetchContentType(id);
    }
  }, [id, isNew]);

  const fetchContentType = async (ctId: string) => {
    try {
      const { data: ct, error } = await supabase
        .from('content_types')
        .select('*')
        .eq('id', ctId)
        .single();

      if (error) throw error;

      setData({
        id: ct.id,
        name: ct.name,
        slug: ct.slug,
        description: ct.description || '',
        icon: ct.icon || 'file-text',
        fields: (ct.fields as unknown as FieldDefinition[]) || [],
        publishPageOnCreate: false, // Not relevant for existing content types
      });
    } catch (error) {
      console.error('Error fetching content type:', error);
      toast.error('Failed to load content type');
      navigate('/admin/content-types');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleAddField = () => {
    const newField: FieldDefinition = {
      id: crypto.randomUUID(),
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
    };
    setData(prev => ({ ...prev, fields: [...prev.fields, newField] }));
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FieldDefinition>) => {
    setData(prev => ({
      ...prev,
      fields: prev.fields.map(f =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    }));
  };

  const handleDeleteField = (fieldId: string) => {
    setData(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
    }));
  };

  const handleFieldLabelChange = (fieldId: string, label: string) => {
    const name = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    handleUpdateField(fieldId, { label, name });
  };

  const handleSave = async () => {
    if (!data.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    if (!data.slug.trim()) {
      toast.error('Please enter a slug');
      return;
    }

    // Validate fields
    for (const field of data.fields) {
      if (!field.label.trim()) {
        toast.error('All fields must have a label');
        return;
      }
    }

    setSaving(true);

    try {
      // Get current user for author_id
      const { data: { user } } = await supabase.auth.getUser();

      if (isNew) {
        // First, create the master page for this content type
        const pageStatus = data.publishPageOnCreate ? 'published' : 'draft';
        const publishedAt = data.publishPageOnCreate ? new Date().toISOString() : null;
        
        const { data: newPage, error: pageError } = await supabase
          .from('pages')
          .insert({
            title: data.name,
            slug: data.slug,
            status: pageStatus,
            published_at: publishedAt,
            content: [],
            author_id: user?.id,
            seo_title: data.name,
            seo_description: data.description || `Browse all ${data.name} items`,
          })
          .select()
          .single();

        if (pageError) throw pageError;

        // Create a content-feed section for the page
        const { error: sectionError } = await supabase
          .from('page_sections')
          .insert({
            page_id: newPage.id,
            section_type: 'content-feed',
            content_json: {
              content_type_slug: data.slug,
              title: data.name,
              display_style: 'grid',
              items_per_page: 12,
              show_date: true,
              show_excerpt: true,
              link_to_detail: true,
            },
            order: 0,
            is_locked: true,
            is_visible: true,
          });

        if (sectionError) throw sectionError;

        // Now create the content type with reference to the page
        const { error: ctError } = await supabase.from('content_types').insert({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          icon: data.icon || 'file-text',
          fields: data.fields as unknown as Json,
          page_id: newPage.id,
        });

        if (ctError) throw ctError;

        toast.success('Content type created with its master page!');
        navigate('/admin/content-types');
      } else {
        // Update existing content type
        const payload = {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          icon: data.icon || 'file-text',
          fields: data.fields as unknown as Json,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('content_types')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
        toast.success('Content type saved!');
      }
    } catch (error: any) {
      console.error('Error saving content type:', error);
      if (error.code === '23505') {
        toast.error('A content type with this slug already exists');
      } else {
        toast.error('Failed to save content type');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Loading..."
        breadcrumbs={[{ label: 'Content Types', href: '/admin/content-types' }, { label: 'Loading...' }]}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded-lg w-1/3" />
          <div className="h-[400px] bg-muted rounded-lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? 'New Content Type' : 'Edit Content Type'}
      breadcrumbs={[
        { label: 'Content Types', href: '/admin/content-types' },
        { label: isNew ? 'New' : data.name || 'Untitled' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/content-types')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main settings */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Blog Post"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={data.slug}
                    onChange={(e) => setData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="blog-post"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this content type..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fields</CardTitle>
              <Button onClick={handleAddField} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent>
              {data.fields.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">No fields defined yet</p>
                  <Button onClick={handleAddField} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add First Field
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border border-border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Field {index + 1}
                        </span>
                        <div className="flex-1" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteField(field.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => handleFieldLabelChange(field.id, e.target.value)}
                            placeholder="Field Label"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => handleUpdateField(field.id, { type: value as FieldDefinition['type'] })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldTypes.map(ft => (
                                <SelectItem key={ft.value} value={ft.value}>
                                  {ft.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`required-${field.id}`}
                            checked={field.required}
                            onCheckedChange={(checked) => handleUpdateField(field.id, { required: checked })}
                          />
                          <Label htmlFor={`required-${field.id}`} className="text-sm">
                            Required
                          </Label>
                        </div>
                        <div className="flex-1">
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                            placeholder="Placeholder text..."
                            className="h-8"
                          />
                        </div>
                      </div>

                      {field.type === 'select' && (
                        <div className="space-y-2">
                          <Label>Options (comma-separated)</Label>
                          <Input
                            value={(field.options || []).join(', ')}
                            onChange={(e) => handleUpdateField(field.id, {
                              options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            })}
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Slug</Label>
                <p className="text-sm text-muted-foreground">{data.slug || 'Not set'}</p>
              </div>
              <div className="space-y-2">
                <Label>Total Fields</Label>
                <p className="text-sm text-muted-foreground">{data.fields.length} fields</p>
              </div>
            </CardContent>
          </Card>

          {/* Page Settings - only show for new content types */}
          {isNew && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Page Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="publish-on-create">Publish page immediately</Label>
                    <p className="text-xs text-muted-foreground">
                      Make the master page visible on the site
                    </p>
                  </div>
                  <Switch
                    id="publish-on-create"
                    checked={data.publishPageOnCreate}
                    onCheckedChange={(checked) => setData(prev => ({ ...prev, publishPageOnCreate: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
