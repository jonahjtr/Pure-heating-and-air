import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, ArrowLeft, Settings, Image } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedSectionEditor, SectionInspectorPanel } from '@/components/editor/unified';
import { MediaPickerModal } from '@/components/editor/MediaPickerModal';
import { usePageSections } from '@/hooks/usePageSections';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MediaItem } from '@/components/editor/types';
import type { Json } from '@/integrations/supabase/types';

interface PageData {
  id?: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  seo_title: string;
  seo_description: string;
  seo_image: string;
}

const defaultPageData: PageData = {
  id: undefined,
  title: '',
  slug: '',
  status: 'draft',
  seo_title: '',
  seo_description: '',
  seo_image: '',
};

export default function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const isNew = !id;
  const isAdmin = role === 'admin';

  const [pageData, setPageData] = useState<PageData>(defaultPageData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoPickerOpen, setSeoPickerOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Page sections hook (unified editor)
  const {
    sections,
    loading: sectionsLoading,
    saving: sectionsSaving,
    addSection,
    addSectionFromReusable,
    updateSectionContent,
    toggleVisibility,
    toggleLock,
    deleteSection,
    moveUp,
    moveDown,
  } = usePageSections({ pageId: pageData.id });

  // Get selected section
  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;

  // Helper functions for section operations
  const getCanMoveUp = (sectionId: string) => {
    const index = sections.findIndex((s) => s.id === sectionId);
    return index > 0;
  };

  const getCanMoveDown = (sectionId: string) => {
    const index = sections.findIndex((s) => s.id === sectionId);
    return index < sections.length - 1;
  };

  useEffect(() => {
    if (isNew) {
      setLoading(false);
    } else if (id) {
      fetchPage(id);
    }
  }, [id, isNew]);

  const fetchPage = async (pageId: string) => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (error) throw error;
      
      setPageData({
        id: data.id,
        title: data.title,
        slug: data.slug,
        status: data.status as 'draft' | 'published' | 'scheduled',
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        seo_image: data.seo_image || '',
      });
    } catch (error) {
      console.error('Error fetching page:', error);
      toast.error('Failed to load page');
      navigate('/admin/pages');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setPageData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSave = async (publish = false) => {
    if (!pageData.title.trim()) {
      toast.error('Please enter a page title');
      return;
    }

    if (!pageData.slug.trim()) {
      toast.error('Please enter a page slug');
      return;
    }

    setSaving(true);

    try {
      const status = publish ? 'published' : pageData.status;
      const now = new Date().toISOString();

      const pagePayload = {
        title: pageData.title,
        slug: pageData.slug,
        status,
        content: {} as Json, // Legacy field, sections are now stored in page_sections
        seo_title: pageData.seo_title || null,
        seo_description: pageData.seo_description || null,
        seo_image: pageData.seo_image || null,
        updated_at: now,
        ...(status === 'published' && !pageData.id ? { published_at: now } : {}),
      };

      if (isNew) {
        const { data, error } = await supabase
          .from('pages')
          .insert({
            ...pagePayload,
            author_id: user?.id,
          })
          .select()
          .single();

        if (error) throw error;

        toast.success(publish ? 'Page published!' : 'Page created!');
        navigate(`/admin/pages/${data.id}`, { replace: true });
      } else {
        const { error } = await supabase
          .from('pages')
          .update(pagePayload)
          .eq('id', id);

        if (error) throw error;

        toast.success(publish ? 'Page published!' : 'Page saved!');
        setPageData(prev => ({ ...prev, status }));
      }
    } catch (error: any) {
      console.error('Error saving page:', error);
      if (error.code === '23505') {
        toast.error('A page with this slug already exists');
      } else {
        toast.error('Failed to save page');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSeoImageSelect = (media: MediaItem) => {
    const url = supabase.storage.from('media').getPublicUrl(media.file_path).data.publicUrl;
    setPageData(prev => ({ ...prev, seo_image: url }));
  };

  if (loading) {
    return (
      <AdminLayout
        title="Loading..."
        breadcrumbs={[{ label: 'Pages', href: '/admin/pages' }, { label: 'Loading...' }]}
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
      title={isNew ? 'New Page' : 'Edit Page'}
      breadcrumbs={[
        { label: 'Pages', href: '/admin/pages' },
        { label: isNew ? 'New Page' : pageData.title || 'Untitled' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/pages')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {!isNew && pageData.slug && (
            <Button
              variant="outline"
              size="icon"
              asChild
            >
              <a href={`/${pageData.slug}`} target="_blank" rel="noopener noreferrer" title="Preview page">
                <Eye className="w-4 h-4" />
              </a>
            </Button>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Page Settings</SheetTitle>
              </SheetHeader>
              
              <Tabs defaultValue="general" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">/</span>
                      <Input
                        id="slug"
                        value={pageData.slug}
                        onChange={(e) => setPageData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="page-url"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={pageData.status}
                      onValueChange={(value: 'draft' | 'published' | 'scheduled') =>
                        setPageData(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="seo" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo-title">SEO Title</Label>
                    <Input
                      id="seo-title"
                      value={pageData.seo_title}
                      onChange={(e) => setPageData(prev => ({ ...prev, seo_title: e.target.value }))}
                      placeholder="Page title for search engines"
                    />
                    <p className="text-xs text-muted-foreground">
                      {pageData.seo_title.length}/60 characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seo-description">SEO Description</Label>
                    <Textarea
                      id="seo-description"
                      value={pageData.seo_description}
                      onChange={(e) => setPageData(prev => ({ ...prev, seo_description: e.target.value }))}
                      placeholder="Brief description for search engines"
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      {pageData.seo_description.length}/160 characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>SEO Image (og:image)</Label>
                    {pageData.seo_image ? (
                      <div className="relative group">
                        <img
                          src={pageData.seo_image}
                          alt="SEO preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSeoPickerOpen(true)}
                          >
                            Change
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setPageData(prev => ({ ...prev, seo_image: '' }))}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSeoPickerOpen(true)}
                        className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-all"
                      >
                        <Image className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Select image</span>
                      </button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <Eye className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <Input
                value={pageData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Page Title"
                className="text-2xl font-display font-bold border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Content</CardTitle>
            </CardHeader>
            <CardContent>
              {isNew ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Save the page first to add sections</p>
                  <p className="text-sm mt-1">Sections are saved directly to the database</p>
                </div>
              ) : (
                <UnifiedSectionEditor
                  sections={sections}
                  loading={sectionsLoading}
                  saving={sectionsSaving}
                  isAdmin={isAdmin}
                  selectedSectionId={selectedSectionId}
                  onSelectSection={setSelectedSectionId}
                  onAddSection={addSection}
                  onAddSectionFromReusable={addSectionFromReusable}
                  onUpdateContent={updateSectionContent}
                  onToggleVisibility={toggleVisibility}
                  onToggleLock={toggleLock}
                  onDelete={deleteSection}
                  onMoveUp={moveUp}
                  onMoveDown={moveDown}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Sticky */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Page Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Page Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL</Label>
                <p className="text-sm text-muted-foreground">/{pageData.slug || 'untitled'}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    pageData.status === 'published' ? 'bg-green-500' :
                    pageData.status === 'scheduled' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm capitalize">{pageData.status}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Content</Label>
                <p className="text-sm text-muted-foreground">
                  {sections.length} sections
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section Inspector */}
          <Card data-section-inspector className="overflow-hidden">
            <CardHeader className="pb-0 pt-3 px-0">
              <CardTitle className="text-lg px-4">
                {selectedSection ? 'Section Settings' : 'Section Editor'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SectionInspectorPanel
                section={selectedSection}
                isAdmin={isAdmin}
                saving={sectionsSaving}
                canMoveUp={selectedSectionId ? getCanMoveUp(selectedSectionId) : false}
                canMoveDown={selectedSectionId ? getCanMoveDown(selectedSectionId) : false}
                onMoveUp={() => selectedSectionId && moveUp(selectedSectionId)}
                onMoveDown={() => selectedSectionId && moveDown(selectedSectionId)}
                onToggleVisibility={() => selectedSectionId && toggleVisibility(selectedSectionId)}
                onToggleLock={() => selectedSectionId && toggleLock(selectedSectionId)}
                onDelete={() => {
                  if (selectedSectionId) {
                    deleteSection(selectedSectionId);
                    setSelectedSectionId(null);
                  }
                }}
                onUpdateContent={async (content) => {
                  if (selectedSectionId) {
                    await updateSectionContent(selectedSectionId, content);
                  }
                }}
                onSaveAsReusable={() => {
                  // TODO: Implement save as reusable
                  toast.info('Save as reusable coming soon');
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <MediaPickerModal
        open={seoPickerOpen}
        onOpenChange={setSeoPickerOpen}
        onSelect={handleSeoImageSelect}
        fileType="image"
      />
    </AdminLayout>
  );
}
