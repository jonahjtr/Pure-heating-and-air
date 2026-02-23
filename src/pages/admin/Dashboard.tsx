import { useEffect, useState } from 'react';
import { FileText, Image, Users, Eye } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  totalMedia: number;
}

interface RecentPage {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPages: 0,
    publishedPages: 0,
    draftPages: 0,
    totalMedia: 0,
  });
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch page counts
        const { data: pages, error: pagesError } = await supabase
          .from('pages')
          .select('id, status');
        
        if (!pagesError && pages) {
          setStats(prev => ({
            ...prev,
            totalPages: pages.length,
            publishedPages: pages.filter(p => p.status === 'published').length,
            draftPages: pages.filter(p => p.status === 'draft').length,
          }));
        }

        // Fetch media count
        const { count: mediaCount } = await supabase
          .from('media')
          .select('id', { count: 'exact', head: true });
        
        setStats(prev => ({
          ...prev,
          totalMedia: mediaCount || 0,
        }));

        // Fetch recent pages
        const { data: recent } = await supabase
          .from('pages')
          .select('id, title, status, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5);
        
        if (recent) {
          setRecentPages(recent);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <AdminLayout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Pages"
            value={stats.totalPages}
            icon={<FileText className="w-5 h-5 text-primary" />}
            description="All content pages"
            variant="primary"
          />
          <StatCard
            title="Published"
            value={stats.publishedPages}
            icon={<Eye className="w-5 h-5 text-success" />}
            description="Live on site"
            variant="secondary"
          />
          <StatCard
            title="Drafts"
            value={stats.draftPages}
            icon={<FileText className="w-5 h-5 text-warning" />}
            description="Work in progress"
            variant="accent"
          />
          <StatCard
            title="Media Files"
            value={stats.totalMedia}
            icon={<Image className="w-5 h-5 text-info" />}
            description="Images & documents"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-lg">Recent Pages</CardTitle>
              <CardDescription>Latest content updates</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentPages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No pages yet</p>
                  <p className="text-sm">Create your first page to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{page.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(page.updated_at)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(page.status)} className="capitalize">
                        {page.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks at your fingertips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <QuickAction
                  icon={<FileText className="w-4 h-4" />}
                  title="Create New Page"
                  description="Add a new content page"
                  href="/admin/pages/new"
                />
                <QuickAction
                  icon={<Image className="w-4 h-4" />}
                  title="Upload Media"
                  description="Add images or files"
                  href="/admin/media"
                />
                {isAdmin && (
                  <QuickAction
                    icon={<Users className="w-4 h-4" />}
                    title="Manage Users"
                    description="Add or edit team members"
                    href="/admin/users"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function QuickAction({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all group"
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </a>
  );
}
