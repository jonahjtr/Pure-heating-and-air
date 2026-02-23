import { useState } from 'react';
import { Save, Palette, Type, RotateCcw, Send, Sparkles } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBranding } from '@/hooks/useBranding';
import { ColorPicker } from '@/components/admin/settings/ColorPicker';
import { ThemePresets, type ThemePreset } from '@/components/admin/settings/ThemePresets';
import { fontOptions, fontWeightOptions, defaultBranding } from '@/types/branding';
import { toast } from 'sonner';

export default function Branding() {
  const { branding, loading, saving, saveBranding, updateColors, updateTypography } = useBranding();

  const [redesignRequest, setRedesignRequest] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSave = () => {
    saveBranding(branding);
  };

  const handleReset = () => {
    saveBranding(defaultBranding);
  };

  const handleSelectTheme = (theme: ThemePreset) => {
    updateColors(theme.colors);
    updateTypography(theme.typography);
    toast.success(`Applied "${theme.name}" theme`);
  };

  const handleRedesignSubmit = () => {
    setShowConfirmDialog(false);
    toast.success('Website redesign request submitted successfully');
    setRedesignRequest('');
  };

  if (loading) {
    return (
      <AdminLayout
        title="Branding"
        breadcrumbs={[
          { label: 'Settings', href: '/admin/settings' },
          { label: 'Branding' },
        ]}
      >
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Branding"
      breadcrumbs={[
        { label: 'Settings', href: '/admin/settings' },
        { label: 'Branding' },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div className="max-w-3xl animate-fade-in">
        <Tabs defaultValue="presets" className="space-y-6">
          <TabsList>
            <TabsTrigger value="presets" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="colors" className="gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-2">
              <Type className="w-4 h-4" />
              Typography
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <ThemePresets
              currentColors={branding.colors}
              onSelectTheme={handleSelectTheme}
            />
            <p className="text-sm text-muted-foreground">
              Select a preset above, or customize individual colors and typography in the other tabs.
            </p>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
                <CardDescription>
                  Define your brand colors. These will be used across all pages and components.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ColorPicker
                    label="Primary Color"
                    value={branding.colors.primary}
                    onChange={(value) => updateColors({ primary: value })}
                  />
                  <ColorPicker
                    label="Secondary Color"
                    value={branding.colors.secondary}
                    onChange={(value) => updateColors({ secondary: value })}
                  />
                  <ColorPicker
                    label="Accent Color"
                    value={branding.colors.accent}
                    onChange={(value) => updateColors({ accent: value })}
                  />
                  <ColorPicker
                    label="Background"
                    value={branding.colors.background}
                    onChange={(value) => updateColors({ background: value })}
                  />
                  <ColorPicker
                    label="Foreground (Text)"
                    value={branding.colors.foreground}
                    onChange={(value) => updateColors({ foreground: value })}
                  />
                  <ColorPicker
                    label="Muted"
                    value={branding.colors.muted}
                    onChange={(value) => updateColors({ muted: value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Color Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    {Object.entries(branding.colors).map(([name, value]) => (
                      <div key={name} className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-12 h-12 rounded-lg border shadow-sm"
                          style={{ backgroundColor: value }}
                        />
                        <span className="text-xs text-muted-foreground capitalize">
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div 
                    className="p-6 rounded-lg border"
                    style={{ 
                      backgroundColor: branding.colors.background,
                      color: branding.colors.foreground,
                    }}
                  >
                    <h3 
                      className="text-lg font-semibold mb-2"
                      style={{ fontFamily: branding.typography.headingFont }}
                    >
                      Sample Heading
                    </h3>
                    <p 
                      className="text-sm mb-4"
                      style={{ fontFamily: branding.typography.bodyFont }}
                    >
                      This is how your text will appear with the selected colors and typography.
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 rounded-md text-sm font-medium"
                        style={{ 
                          backgroundColor: branding.colors.primary,
                          color: 'white',
                        }}
                      >
                        Primary Button
                      </button>
                      <button
                        className="px-4 py-2 rounded-md text-sm font-medium"
                        style={{ 
                          backgroundColor: branding.colors.secondary,
                          color: branding.colors.foreground,
                        }}
                      >
                        Secondary Button
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Typography Settings</CardTitle>
                <CardDescription>
                  Configure fonts and text styles for your site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Heading Font</Label>
                    <Select
                      value={branding.typography.headingFont}
                      onValueChange={(value) => updateTypography({ headingFont: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Heading Weight</Label>
                    <Select
                      value={branding.typography.headingWeight}
                      onValueChange={(value) => updateTypography({ headingWeight: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontWeightOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Body Font</Label>
                    <Select
                      value={branding.typography.bodyFont}
                      onValueChange={(value) => updateTypography({ bodyFont: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Body Weight</Label>
                    <Select
                      value={branding.typography.bodyWeight}
                      onValueChange={(value) => updateTypography({ bodyWeight: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontWeightOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Base Font Size (px)</Label>
                    <Select
                      value={branding.typography.baseSize}
                      onValueChange={(value) => updateTypography({ baseSize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['14', '15', '16', '17', '18'].map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}px
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="space-y-4 p-6 rounded-lg border bg-background"
                  style={{ fontSize: `${branding.typography.baseSize}px` }}
                >
                  <h1 
                    className="text-3xl"
                    style={{ 
                      fontFamily: branding.typography.headingFont,
                      fontWeight: branding.typography.headingWeight,
                    }}
                  >
                    Heading 1
                  </h1>
                  <h2 
                    className="text-2xl"
                    style={{ 
                      fontFamily: branding.typography.headingFont,
                      fontWeight: branding.typography.headingWeight,
                    }}
                  >
                    Heading 2
                  </h2>
                  <h3 
                    className="text-xl"
                    style={{ 
                      fontFamily: branding.typography.headingFont,
                      fontWeight: branding.typography.headingWeight,
                    }}
                  >
                    Heading 3
                  </h3>
                  <p
                    style={{ 
                      fontFamily: branding.typography.bodyFont,
                      fontWeight: branding.typography.bodyWeight,
                    }}
                  >
                    This is a paragraph of body text. It demonstrates how your content will look
                    with the selected font family, weight, and size settings. Good typography
                    improves readability and creates a professional appearance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Website Redesign Request */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Website Redesign Request</CardTitle>
            <CardDescription>
              Submit a request for a complete website redesign. Please describe your vision and requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="redesign-request">Your Request</Label>
              <Textarea
                id="redesign-request"
                placeholder="Describe the changes you'd like to see in your website redesign..."
                value={redesignRequest}
                onChange={(e) => setRedesignRequest(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <Button 
              onClick={() => setShowConfirmDialog(true)}
              disabled={!redesignRequest.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Request
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to submit this request?</AlertDialogTitle>
            <AlertDialogDescription>
              You can only submit a website redesign request once per year. Make sure your request includes all the details you need.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRedesignSubmit}>
              Submit Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
