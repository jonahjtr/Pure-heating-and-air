import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Image, Settings, Users, LogOut, Layers, ChevronRight, Palette, FileType, LayoutTemplate, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
interface ContentType {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}
const mainNavItems = [{
  icon: LayoutDashboard,
  label: 'Dashboard',
  href: '/admin'
}, {
  icon: FileText,
  label: 'Pages',
  href: '/admin/pages'
}, {
  icon: Image,
  label: 'Media',
  href: '/admin/media'
}];
const settingsNavItems = [{
  icon: Layers,
  label: 'Content Types',
  href: '/admin/content-types',
  adminOnly: true
}, {
  icon: LayoutTemplate,
  label: 'Header & Footer',
  href: '/admin/site-layout',
  adminOnly: true
}, {
  icon: Globe,
  label: 'General Settings',
  href: '/admin/general-settings',
  adminOnly: true
}, {
  icon: Users,
  label: 'Users',
  href: '/admin/users',
  adminOnly: true
}, {
  icon: Settings,
  label: 'My Settings',
  href: '/admin/settings'
}, {
  icon: Palette,
  label: 'Branding',
  href: '/admin/settings/branding',
  adminOnly: true
}];
export function AdminSidebar() {
  const location = useLocation();
  const {
    user,
    signOut,
    isAdmin,
    role
  } = useAuth();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  useEffect(() => {
    fetchContentTypes();

    // Subscribe to changes
    const channel = supabase.channel('content_types_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'content_types'
    }, () => {
      fetchContentTypes();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchContentTypes = async () => {
    const {
      data
    } = await supabase.from('content_types').select('id, name, slug, icon').order('name', {
      ascending: true
    });
    setContentTypes(data || []);
  };
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };
  return <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">Leap Site </h1>
            <p className="text-xs text-muted-foreground capitalize">{role} mode</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 mb-2">
            Content
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(item => <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} className={cn('w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all', location.pathname === item.href ? 'bg-primary text-primary-foreground shadow-soft' : 'hover:bg-sidebar-accent')}>
                    <Link to={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                      {location.pathname === item.href && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
              
              {/* Dynamic content types */}
              {contentTypes.map(ct => <SidebarMenuItem key={ct.id}>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith(`/admin/content/${ct.slug}`)} className={cn('w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all', location.pathname.startsWith(`/admin/content/${ct.slug}`) ? 'bg-primary text-primary-foreground shadow-soft' : 'hover:bg-sidebar-accent')}>
                    <Link to={`/admin/content/${ct.slug}`}>
                      <FileType className="w-4 h-4" />
                      <span className="font-medium">{ct.name}</span>
                      {location.pathname.startsWith(`/admin/content/${ct.slug}`) && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 mb-2">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.filter(item => !item.adminOnly || isAdmin).map(item => <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.href} className={cn('w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all', location.pathname === item.href ? 'bg-primary text-primary-foreground shadow-soft' : 'hover:bg-sidebar-accent')}>
                      <Link to={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9 border-2 border-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
              {user?.email ? getInitials(user.email) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={signOut}>
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>;
}