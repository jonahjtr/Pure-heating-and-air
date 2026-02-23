import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Layers, MoreHorizontal, Edit, Trash2, Globe, GlobeLock, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';
import { ContentTypePresetPicker } from '@/components/admin/ContentTypePresetPicker';
import type { ContentTypePreset } from '@/lib/contentTypePresets';

interface ContentType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  fields: Json;
  page_id: string | null;
  created_at: string;
}

interface PageStatus {
  id: string;
  status: string;
}

export default function ContentTypes() {
  const navigate = useNavigate();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [pageStatuses, setPageStatuses] = useState<Record<string, PageStatus>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  const handleSelectPreset = (preset: ContentTypePreset) => {
    // Navigate to editor with preset data in state
    navigate('/admin/content-types/new', { state: { preset } });
  };

  const handleStartFromScratch = () => {
    navigate('/admin/content-types/new');
  };

  const fetchContentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('content_types')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setContentTypes(data || []);

      // Fetch page statuses for content types that have pages
      const pageIds = (data || [])
        .filter(ct => ct.page_id)
        .map(ct => ct.page_id as string);

      if (pageIds.length > 0) {
        const { data: pages, error: pagesError } = await supabase
          .from('pages')
          .select('id, status')
          .in('id', pageIds);

        if (!pagesError && pages) {
          const statusMap: Record<string, PageStatus> = {};
          pages.forEach(p => {
            statusMap[p.id] = p;
          });
          setPageStatuses(statusMap);
        }
      }
    } catch (error) {
      console.error('Error fetching content types:', error);
      toast.error('Failed to load content types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentTypes();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('content_types').delete().eq('id', id);
      if (error) throw error;
      
      setContentTypes(contentTypes.filter(ct => ct.id !== id));
      toast.success('Content type deleted');
    } catch (error) {
      console.error('Error deleting content type:', error);
      toast.error('Failed to delete content type');
    }
  };

  const handleTogglePublish = async (ct: ContentType) => {
    if (!ct.page_id) {
      toast.error('No master page found for this content type');
      return;
    }

    const currentStatus = pageStatuses[ct.page_id]?.status || 'draft';
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const now = newStatus === 'published' ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from('pages')
        .update({ 
          status: newStatus, 
          published_at: now,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ct.page_id);

      if (error) throw error;

      setPageStatuses(prev => ({
        ...prev,
        [ct.page_id!]: { id: ct.page_id!, status: newStatus },
      }));

      toast.success(newStatus === 'published' 
        ? `${ct.name} page is now live at /${ct.slug}` 
        : `${ct.name} page unpublished`
      );
    } catch (error) {
      console.error('Error updating page status:', error);
      toast.error('Failed to update page status');
    }
  };

  const filteredTypes = contentTypes.filter(ct =>
    ct.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ct.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFieldCount = (fields: Json) => {
    if (Array.isArray(fields)) return fields.length;
    return 0;
  };

  const getPageStatus = (ct: ContentType) => {
    if (!ct.page_id) return 'no-page';
    return pageStatuses[ct.page_id]?.status || 'draft';
  };

  return (
    <>
      <ContentTypePresetPicker
        open={showPresetPicker}
        onOpenChange={setShowPresetPicker}
        onSelectPreset={handleSelectPreset}
        onStartFromScratch={handleStartFromScratch}
      />
      
      <AdminLayout
        title="Content Types"
        breadcrumbs={[{ label: 'Content Types' }]}
        actions={
          <Button onClick={() => setShowPresetPicker(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Content Type
          </Button>
        }
      >
      <div className="space-y-4 animate-fade-in">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search content types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content types table */}
        <Card className="shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Page Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <div className="h-12 bg-muted rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Layers className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No content types match your search' : 'No content types yet'}
                    </p>
                    {!searchQuery && (
                      <Button asChild variant="link" className="mt-2">
                        <Link to="/admin/content-types/new">Create your first content type</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTypes.map((ct) => {
                  const pageStatus = getPageStatus(ct);
                  return (
                    <TableRow key={ct.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Layers className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <span className="font-medium">{ct.name}</span>
                            {ct.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {ct.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">/{ct.slug}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getFieldCount(ct.fields)} fields
                      </TableCell>
                      <TableCell>
                        {pageStatus === 'published' ? (
                          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <Globe className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                        ) : pageStatus === 'no-page' ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            No Page
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <GlobeLock className="w-3 h-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(ct.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/content-types/${ct.id}`} className="flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {ct.page_id && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/pages/${ct.page_id}`} className="flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    Edit Master Page
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleTogglePublish(ct)}
                                  className="flex items-center gap-2"
                                >
                                  {pageStatus === 'published' ? (
                                    <>
                                      <GlobeLock className="w-4 h-4" />
                                      Unpublish Page
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="w-4 h-4" />
                                      Publish Page
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive flex items-center gap-2"
                              onClick={() => handleDelete(ct.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
    </>
  );
}
