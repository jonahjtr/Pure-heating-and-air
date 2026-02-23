import { useState, useEffect } from 'react';
import { Save, Loader2, Layout, LayoutTemplate, Eye } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LogoPicker } from '@/components/admin/layout/LogoPicker';
import { NavigationEditor } from '@/components/admin/layout/NavigationEditor';
import { SocialLinksEditor } from '@/components/admin/layout/SocialLinksEditor';
import { ContactInfoEditor } from '@/components/admin/layout/ContactInfoEditor';
import { FooterColumnsEditor } from '@/components/admin/layout/FooterColumnsEditor';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { 
  HeaderConfig, 
  FooterConfig, 
  defaultHeaderConfig, 
  defaultFooterConfig 
} from '@/types/siteLayout';

export default function SiteLayoutBuilder() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [header, setHeader] = useState<HeaderConfig>(defaultHeaderConfig);
  const [footer, setFooter] = useState<FooterConfig>(defaultFooterConfig);
  const [activeTab, setActiveTab] = useState('header');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('key, value')
        .in('key', ['header_config', 'footer_config']);

      if (error) throw error;

      if (data) {
        for (const row of data) {
          if (row.key === 'header_config' && row.value) {
            setHeader({ ...defaultHeaderConfig, ...row.value as unknown as HeaderConfig });
          }
          if (row.key === 'footer_config' && row.value) {
            setFooter({ ...defaultFooterConfig, ...row.value as unknown as FooterConfig });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Upsert header config
      const { error: headerError } = await supabase
        .from('global_settings')
        .upsert(
          [{ key: 'header_config', value: JSON.parse(JSON.stringify(header)) }],
          { onConflict: 'key' }
        );

      if (headerError) throw headerError;

      // Upsert footer config
      const { error: footerError } = await supabase
        .from('global_settings')
        .upsert(
          [{ key: 'footer_config', value: JSON.parse(JSON.stringify(footer)) }],
          { onConflict: 'key' }
        );

      if (footerError) throw footerError;

      toast.success('Layout settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Header & Footer">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Header & Footer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6" />
              Header & Footer Builder
            </h1>
            <p className="text-muted-foreground">
              Configure your site's header navigation and footer content
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPreviewOpen(!previewOpen)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {previewOpen ? 'Hide' : 'Show'} Preview
            </Button>
            <Button onClick={saveSettings} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Preview Section */}
        {previewOpen && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0 border-t overflow-hidden rounded-b-lg">
              <div className="bg-background">
                <SiteHeader config={header} />
                <div className="min-h-[100px] flex items-center justify-center border-y border-dashed text-muted-foreground text-sm">
                  Page content goes here
                </div>
                <SiteFooter config={footer} />
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="header" className="gap-2">
              <Layout className="w-4 h-4" />
              Header
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          {/* Header Tab */}
          <TabsContent value="header" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Logo & Site Name */}
              <Card>
                <CardHeader>
                  <CardTitle>Logo & Branding</CardTitle>
                  <CardDescription>Configure your site logo and name</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <LogoPicker
                    logo={header.logo}
                    onChange={(logo) => setHeader({ ...header, logo })}
                  />
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-site-name">Show Site Name</Label>
                      <Switch
                        id="show-site-name"
                        checked={header.showSiteName}
                        onCheckedChange={(checked) => setHeader({ ...header, showSiteName: checked })}
                      />
                    </div>
                    {header.showSiteName && (
                      <div className="space-y-2">
                        <Label>Site Name</Label>
                        <Input
                          value={header.siteName}
                          onChange={(e) => setHeader({ ...header, siteName: e.target.value })}
                          placeholder="My Site"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Header Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Header Options</CardTitle>
                  <CardDescription>Layout and behavior settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Layout Style</Label>
                    <Select
                      value={header.layout}
                      onValueChange={(value: 'left' | 'center' | 'split') => 
                        setHeader({ ...header, layout: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Logo Left, Nav Right</SelectItem>
                        <SelectItem value="center">Centered Logo</SelectItem>
                        <SelectItem value="split">Split (Logo Center, Nav Sides)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sticky-header">Sticky Header</Label>
                      <p className="text-xs text-muted-foreground">Header stays visible on scroll</p>
                    </div>
                    <Switch
                      id="sticky-header"
                      checked={header.sticky}
                      onCheckedChange={(checked) => setHeader({ ...header, sticky: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="header-social">Show Social Links</Label>
                      <p className="text-xs text-muted-foreground">Display social icons in header</p>
                    </div>
                    <Switch
                      id="header-social"
                      checked={header.showSocialLinks}
                      onCheckedChange={(checked) => setHeader({ ...header, showSocialLinks: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="header-contact">Show Contact Info</Label>
                      <p className="text-xs text-muted-foreground">Display contact in header</p>
                    </div>
                    <Switch
                      id="header-contact"
                      checked={header.showContactInfo}
                      onCheckedChange={(checked) => setHeader({ ...header, showContactInfo: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation Menu</CardTitle>
                <CardDescription>Add and arrange your main navigation links</CardDescription>
              </CardHeader>
              <CardContent>
                <NavigationEditor
                  items={header.navigation}
                  onChange={(navigation) => setHeader({ ...header, navigation })}
                />
              </CardContent>
            </Card>

            {/* Social Links (if enabled) */}
            {header.showSocialLinks && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Add your social media profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <SocialLinksEditor
                    links={header.socialLinks}
                    onChange={(socialLinks) => setHeader({ ...header, socialLinks })}
                  />
                </CardContent>
              </Card>
            )}

            {/* Contact Info (if enabled) */}
            {header.showContactInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Contact details to display in the header</CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactInfoEditor
                    info={header.contactInfo}
                    onChange={(contactInfo) => setHeader({ ...header, contactInfo })}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value="footer" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Footer Logo & Style */}
              <Card>
                <CardHeader>
                  <CardTitle>Footer Branding</CardTitle>
                  <CardDescription>Configure footer logo and style</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <LogoPicker
                    logo={footer.logo}
                    onChange={(logo) => setFooter({ ...footer, logo })}
                  />
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="footer-show-site-name">Show Site Name</Label>
                      <Switch
                        id="footer-show-site-name"
                        checked={footer.showSiteName}
                        onCheckedChange={(checked) => setFooter({ ...footer, showSiteName: checked })}
                      />
                    </div>
                    {footer.showSiteName && (
                      <div className="space-y-2">
                        <Label>Site Name</Label>
                        <Input
                          value={footer.siteName}
                          onChange={(e) => setFooter({ ...footer, siteName: e.target.value })}
                          placeholder="My Site"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Footer Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Footer Options</CardTitle>
                  <CardDescription>Layout and content settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Footer Layout</Label>
                    <Select
                      value={footer.layout}
                      onValueChange={(value: 'simple' | 'columns' | 'minimal') => 
                        setFooter({ ...footer, layout: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple (Stacked)</SelectItem>
                        <SelectItem value="columns">Multi-Column</SelectItem>
                        <SelectItem value="minimal">Minimal (Copyright Only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="footer-social">Show Social Links</Label>
                      <p className="text-xs text-muted-foreground">Display social icons in footer</p>
                    </div>
                    <Switch
                      id="footer-social"
                      checked={footer.showSocialLinks}
                      onCheckedChange={(checked) => setFooter({ ...footer, showSocialLinks: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="footer-contact">Show Contact Info</Label>
                      <p className="text-xs text-muted-foreground">Display contact in footer</p>
                    </div>
                    <Switch
                      id="footer-contact"
                      checked={footer.showContactInfo}
                      onCheckedChange={(checked) => setFooter({ ...footer, showContactInfo: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-copyright">Show Copyright</Label>
                      <p className="text-xs text-muted-foreground">Display copyright notice</p>
                    </div>
                    <Switch
                      id="show-copyright"
                      checked={footer.showCopyright}
                      onCheckedChange={(checked) => setFooter({ ...footer, showCopyright: checked })}
                    />
                  </div>

                  {footer.showCopyright && (
                    <div className="space-y-2">
                      <Label>Copyright Text</Label>
                      <Input
                        value={footer.copyrightText}
                        onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                        placeholder="© 2024 My Site. All rights reserved."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Footer Columns (for columns layout) */}
            {footer.layout === 'columns' && (
              <Card>
                <CardHeader>
                  <CardTitle>Footer Columns</CardTitle>
                  <CardDescription>Organize links into columns</CardDescription>
                </CardHeader>
                <CardContent>
                  <FooterColumnsEditor
                    columns={footer.columns}
                    onChange={(columns) => setFooter({ ...footer, columns })}
                  />
                </CardContent>
              </Card>
            )}

            {/* Social Links (if enabled) */}
            {footer.showSocialLinks && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Add your social media profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <SocialLinksEditor
                    links={footer.socialLinks}
                    onChange={(socialLinks) => setFooter({ ...footer, socialLinks })}
                  />
                </CardContent>
              </Card>
            )}

            {/* Contact Info (if enabled) */}
            {footer.showContactInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Contact details to display in the footer</CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactInfoEditor
                    info={footer.contactInfo}
                    onChange={(contactInfo) => setFooter({ ...footer, contactInfo })}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
