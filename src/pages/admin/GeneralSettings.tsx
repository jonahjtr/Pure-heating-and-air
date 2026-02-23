import { useState, useEffect } from 'react';
import { Save, Globe, BookOpen, Calendar, Loader2, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { MediaPickerModal } from '@/components/editor/MediaPickerModal';
import type { MediaItem } from '@/components/editor/types';
import {
  SiteSettings,
  defaultSiteSettings,
  timezoneOptions,
  dateFormatOptions,
  timeFormatOptions,
  languageOptions,
} from '@/types/siteSettings';

interface PageOption {
  id: string;
  title: string;
  slug: string;
}

export default function GeneralSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faviconPickerOpen, setFaviconPickerOpen] = useState(false);
  const [pages, setPages] = useState<PageOption[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchPages();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('value')
        .eq('key', 'site_settings')
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        const value = data.value as unknown as SiteSettings;
        setSettings({
          identity: { ...defaultSiteSettings.identity, ...value.identity },
          reading: { ...defaultSiteSettings.reading, ...value.reading },
          dateLanguage: { ...defaultSiteSettings.dateLanguage, ...value.dateLanguage },
        });
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, title, slug')
        .eq('status', 'published')
        .order('title');

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('global_settings')
        .select('id')
        .eq('key', 'site_settings')
        .maybeSingle();

      const settingsJson = JSON.parse(JSON.stringify(settings));

      let error;
      if (existing) {
        const result = await supabase
          .from('global_settings')
          .update({
            value: settingsJson,
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'site_settings');
        error = result.error;
      } else {
        const result = await supabase
          .from('global_settings')
          .insert([{
            key: 'site_settings',
            value: settingsJson,
          }]);
        error = result.error;
      }

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateIdentity = (field: keyof SiteSettings['identity'], value: string) => {
    setSettings(prev => ({
      ...prev,
      identity: { ...prev.identity, [field]: value },
    }));
  };

  const updateReading = <K extends keyof SiteSettings['reading']>(
    field: K,
    value: SiteSettings['reading'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      reading: { ...prev.reading, [field]: value },
    }));
  };

  const updateDateLanguage = <K extends keyof SiteSettings['dateLanguage']>(
    field: K,
    value: SiteSettings['dateLanguage'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      dateLanguage: { ...prev.dateLanguage, [field]: value },
    }));
  };

  const handleFaviconSelect = (media: MediaItem) => {
    const url = supabase.storage.from('media').getPublicUrl(media.file_path).data.publicUrl;
    updateIdentity('favicon', url);
  };

  if (loading) {
    return (
      <AdminLayout title="General Settings" breadcrumbs={[{ label: 'General Settings' }]}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="General Settings" breadcrumbs={[{ label: 'General Settings' }]}>
      <div className="max-w-3xl animate-fade-in">
        <Tabs defaultValue="identity" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="identity" className="gap-2">
                <Globe className="w-4 h-4" />
                Site Identity
              </TabsTrigger>
              <TabsTrigger value="reading" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Reading
              </TabsTrigger>
              <TabsTrigger value="date-language" className="gap-2">
                <Calendar className="w-4 h-4" />
                Date & Language
              </TabsTrigger>
            </TabsList>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Site Identity */}
          <TabsContent value="identity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Identity</CardTitle>
                <CardDescription>
                  Basic information about your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.identity.siteName}
                    onChange={(e) => updateIdentity('siteName', e.target.value)}
                    placeholder="My Website"
                  />
                  <p className="text-xs text-muted-foreground">
                    The name of your website, displayed in the browser title and header
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Textarea
                    id="tagline"
                    value={settings.identity.tagline}
                    onChange={(e) => updateIdentity('tagline', e.target.value)}
                    placeholder="A brief description of your site"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    In a few words, explain what your site is about
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    value={settings.identity.siteUrl}
                    onChange={(e) => updateIdentity('siteUrl', e.target.value)}
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    The full URL of your website (used for canonical links and social sharing)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.identity.adminEmail}
                    onChange={(e) => updateIdentity('adminEmail', e.target.value)}
                    placeholder="admin@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    This address is used for site administration purposes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-4">
                    {settings.identity.favicon ? (
                      <div className="relative w-16 h-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                        <img
                          src={settings.identity.favicon}
                          alt="Favicon"
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFaviconPickerOpen(true)}
                      >
                        {settings.identity.favicon ? 'Change' : 'Select'} Favicon
                      </Button>
                      {settings.identity.favicon && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-muted-foreground"
                          onClick={() => updateIdentity('favicon', '')}
                        >
                          Remove
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Square image recommended (32x32 or 64x64 pixels)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading Settings */}
          <TabsContent value="reading" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reading Settings</CardTitle>
                <CardDescription>
                  Configure how content is displayed on your site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Your homepage displays</Label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="showOnFront"
                        checked={settings.reading.showOnFront === 'latest_posts'}
                        onChange={() => updateReading('showOnFront', 'latest_posts')}
                        className="w-4 h-4 text-primary"
                      />
                      <span>Your latest posts</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="showOnFront"
                        checked={settings.reading.showOnFront === 'static_page'}
                        onChange={() => updateReading('showOnFront', 'static_page')}
                        className="w-4 h-4 text-primary"
                      />
                      <span>A static page</span>
                    </label>
                  </div>
                </div>

                {settings.reading.showOnFront === 'static_page' && (
                  <div className="space-y-2 pl-7">
                    <Label htmlFor="frontPage">Homepage</Label>
                    <Select
                      value={settings.reading.frontPageId || ''}
                      onValueChange={(value) => updateReading('frontPageId', value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent>
                        {pages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="postsPerPage">Posts per page</Label>
                  <Input
                    id="postsPerPage"
                    type="number"
                    min={1}
                    max={100}
                    value={settings.reading.postsPerPage}
                    onChange={(e) =>
                      updateReading('postsPerPage', parseInt(e.target.value) || 10)
                    }
                    className="w-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of items to display on archive and feed pages
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="searchVisibility">Search Engine Visibility</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow search engines to index your site
                      </p>
                    </div>
                    <Switch
                      id="searchVisibility"
                      checked={settings.reading.searchEngineVisibility}
                      onCheckedChange={(checked) =>
                        updateReading('searchEngineVisibility', checked)
                      }
                    />
                  </div>
                  {!settings.reading.searchEngineVisibility && (
                    <p className="text-xs text-warning flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Your site is currently hidden from search engines
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Date & Language Settings */}
          <TabsContent value="date-language" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Date & Language</CardTitle>
                <CardDescription>
                  Configure timezone, date formats, and language preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.dateLanguage.timezone}
                    onValueChange={(value) => updateDateLanguage('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezoneOptions.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose a city in the same timezone as you
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.dateLanguage.dateFormat}
                    onValueChange={(value) => updateDateLanguage('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFormatOptions.map((df) => (
                        <SelectItem key={df.value} value={df.value}>
                          {df.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select
                    value={settings.dateLanguage.timeFormat}
                    onValueChange={(value) => updateDateLanguage('timeFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeFormatOptions.map((tf) => (
                        <SelectItem key={tf.value} value={tf.value}>
                          {tf.label} ({tf.example})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekStartsOn">Week Starts On</Label>
                  <Select
                    value={settings.dateLanguage.weekStartsOn}
                    onValueChange={(value) =>
                      updateDateLanguage('weekStartsOn', value as 'sunday' | 'monday')
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Site Language</Label>
                  <Select
                    value={settings.dateLanguage.language}
                    onValueChange={(value) => updateDateLanguage('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Default language for the site interface
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <MediaPickerModal
        open={faviconPickerOpen}
        onOpenChange={setFaviconPickerOpen}
        onSelect={handleFaviconSelect}
        fileType="image"
      />
    </AdminLayout>
  );
}
