import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Edit, Trash2, FileText, Globe, GlobeLock, Settings } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentType {
  id: string;
  name: string;
  slug: string;
  page_id: string | null;
}

interface ContentTypeItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ContentTypeItems() {
  const { slug } = useParams<{ slug: string }>();
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [pageStatus, setPageStatus] = useState<string>('draft');
  const [items, setItems] = useState<ContentTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingPublish, setTogglingPublish] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: ContentTypeItem | null }>({
    open: false,
    item: null,
  });

  useEffect(() => {
    if (slug) {
      fetchContentTypeAndItems();
    }
  }, [slug]);

  const fetchContentTypeAndItems = async () => {
    try {
      // First fetch the content type by slug
      const { data: ct, error: ctError } = await supabase
        .from('content_types')
        .select('id, name, slug, page_id')
        .eq('slug', slug)
        .single();

      if (ctError) throw ctError;
      setContentType(ct);

      // Fetch page status if page exists
      if (ct.page_id) {
        const { data: page, error: pageError } = await supabase
          .from('pages')
          .select('status')
          .eq('id', ct.page_id)
          .single();

        if (!pageError && page) {
          setPageStatus(page.status);
        }
      }

      // Then fetch items for this content type
      const { data: itemsData, error: itemsError } = await supabase
        .from('content_type_items')
        .select('id, title, slug, status, created_at, updated_at')
        .eq('content_type_id', ct.id)
        .order('updated_at', { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching content type items:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!contentType?.page_id) {
      toast.error('No master page found for this content type');
      return;
    }

    setTogglingPublish(true);
    const newStatus = pageStatus === 'published' ? 'draft' : 'published';
    const now = newStatus === 'published' ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from('pages')
        .update({ 
          status: newStatus, 
          published_at: now,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contentType.page_id);

      if (error) throw error;

      setPageStatus(newStatus);
      toast.success(newStatus === 'published' 
        ? `${contentType.name} page is now live at /${contentType.slug}` 
        : `${contentType.name} page unpublished`
      );
    } catch (error) {
      console.error('Error updating page status:', error);
      toast.error('Failed to update page status');
    } finally {
      setTogglingPublish(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;

    try {
      const { error } = await supabase
        .from('content_type_items')
        .delete()
        .eq('id', deleteDialog.item.id);
      
      if (error) throw error;
      setItems(items.filter(item => item.id !== deleteDialog.item?.id));
      toast.success('Item deleted');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Loading..."
        breadcrumbs={[{ label: 'Content', href: '/admin' }, { label: 'Loading...' }]}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-muted rounded-lg" />
          <div className="h-[400px] bg-muted rounded-lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!contentType) {
    return (
      <AdminLayout
        title="Not Found"
        breadcrumbs={[{ label: 'Content' }]}
      >
        <p className="text-muted-foreground">Content type not found.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={contentType.name}
      breadcrumbs={[{ label: contentType.name }]}
      actions={
        <div className="flex items-center gap-3">
          {/* Page Published Toggle */}
          {contentType.page_id && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
              {pageStatus === 'published' ? (
                <Globe className="w-4 h-4 text-green-600" />
              ) : (
                <GlobeLock className="w-4 h-4 text-muted-foreground" />
              )}
              <Label htmlFor="page-publish" className="text-sm cursor-pointer">
                Page {pageStatus === 'published' ? 'Live' : 'Hidden'}
              </Label>
              <Switch
                id="page-publish"
                checked={pageStatus === 'published'}
                onCheckedChange={handleTogglePublish}
                disabled={togglingPublish}
              />
            </div>
          )}
          
          {/* Settings Button */}
          <Button variant="outline" size="icon" asChild>
            <Link to={`/admin/content-types/${contentType.id}`}>
              <Settings className="w-4 h-4" />
            </Link>
          </Button>

          {/* Add New Button */}
          <Button asChild className="gap-2">
            <Link to={`/admin/content/${slug}/new`}>
              <Plus className="w-4 h-4" />
              Add New
            </Link>
          </Button>
        </div>
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
                  placeholder={`Search ${contentType.name.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items table */}
        <Card className="shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No items match your search' : `No ${contentType.name.toLowerCase()} yet`}
                    </p>
                    {!searchQuery && (
                      <Button asChild variant="link" className="mt-2">
                        <Link to={`/admin/content/${slug}/new`}>Create your first {contentType.name.toLowerCase().replace(/s$/, '')}</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link 
                        to={`/admin/content/${slug}/${item.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.slug}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(item.updated_at)}
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
                            <Link to={`/admin/content/${slug}/${item.id}`} className="flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive flex items-center gap-2"
                            onClick={() => setDeleteDialog({ open: true, item })}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete Item"
        description={`Are you sure you want to delete "${deleteDialog.item?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </AdminLayout>
  );
}
