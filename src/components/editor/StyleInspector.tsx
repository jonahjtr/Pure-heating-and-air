import { Palette, Type, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/admin/settings/ColorPicker';
import { useBrandingContext } from '@/contexts/BrandingContext';
import { fontOptions, fontWeightOptions } from '@/types/branding';
import type { StyleOverrides } from './types';

interface StyleInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overrides: StyleOverrides | undefined;
  onChange: (overrides: StyleOverrides) => void;
  blockType: string;
}

export function StyleInspector({ 
  open, 
  onOpenChange, 
  overrides, 
  onChange,
  blockType,
}: StyleInspectorProps) {
  const { branding } = useBrandingContext();
  
  const currentOverrides: StyleOverrides = overrides || {
    useCustomStyles: false,
    primaryColor: branding.colors.primary,
    secondaryColor: branding.colors.secondary,
    accentColor: branding.colors.accent,
    backgroundColor: branding.colors.background,
    textColor: branding.colors.foreground,
    headingFont: branding.typography.headingFont,
    bodyFont: branding.typography.bodyFont,
    headingWeight: branding.typography.headingWeight,
    bodyWeight: branding.typography.bodyWeight,
  };

  const handleToggleCustom = (enabled: boolean) => {
    onChange({
      ...currentOverrides,
      useCustomStyles: enabled,
    });
  };

  const handleColorChange = (key: keyof StyleOverrides, value: string) => {
    onChange({
      ...currentOverrides,
      [key]: value,
    });
  };

  const handleTypographyChange = (key: keyof StyleOverrides, value: string) => {
    onChange({
      ...currentOverrides,
      [key]: value,
    });
  };

  const handleResetToGlobal = () => {
    onChange({
      useCustomStyles: false,
      primaryColor: branding.colors.primary,
      secondaryColor: branding.colors.secondary,
      accentColor: branding.colors.accent,
      backgroundColor: branding.colors.background,
      textColor: branding.colors.foreground,
      headingFont: branding.typography.headingFont,
      bodyFont: branding.typography.bodyFont,
      headingWeight: branding.typography.headingWeight,
      bodyWeight: branding.typography.bodyWeight,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="capitalize">{blockType} Block Styles</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Toggle custom styles */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Use Custom Styles</Label>
              <p className="text-xs text-muted-foreground">
                Override global branding for this block
              </p>
            </div>
            <Switch
              checked={currentOverrides.useCustomStyles ?? false}
              onCheckedChange={handleToggleCustom}
            />
          </div>

          {currentOverrides.useCustomStyles && (
            <>
              <Tabs defaultValue="colors" className="space-y-4">
                <TabsList className="w-full">
                  <TabsTrigger value="colors" className="flex-1 gap-2">
                    <Palette className="w-4 h-4" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="flex-1 gap-2">
                    <Type className="w-4 h-4" />
                    Typography
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-4">
                  <ColorPicker
                    label="Primary Color"
                    value={currentOverrides.primaryColor || branding.colors.primary}
                    onChange={(v) => handleColorChange('primaryColor', v)}
                  />
                  <ColorPicker
                    label="Secondary Color"
                    value={currentOverrides.secondaryColor || branding.colors.secondary}
                    onChange={(v) => handleColorChange('secondaryColor', v)}
                  />
                  <ColorPicker
                    label="Accent Color"
                    value={currentOverrides.accentColor || branding.colors.accent}
                    onChange={(v) => handleColorChange('accentColor', v)}
                  />
                  <ColorPicker
                    label="Background"
                    value={currentOverrides.backgroundColor || branding.colors.background}
                    onChange={(v) => handleColorChange('backgroundColor', v)}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={currentOverrides.textColor || branding.colors.foreground}
                    onChange={(v) => handleColorChange('textColor', v)}
                  />
                </TabsContent>

                <TabsContent value="typography" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Heading Font</Label>
                    <Select
                      value={currentOverrides.headingFont || branding.typography.headingFont}
                      onValueChange={(v) => handleTypographyChange('headingFont', v)}
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
                      value={currentOverrides.headingWeight || branding.typography.headingWeight}
                      onValueChange={(v) => handleTypographyChange('headingWeight', v)}
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
                      value={currentOverrides.bodyFont || branding.typography.bodyFont}
                      onValueChange={(v) => handleTypographyChange('bodyFont', v)}
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
                      value={currentOverrides.bodyWeight || branding.typography.bodyWeight}
                      onValueChange={(v) => handleTypographyChange('bodyWeight', v)}
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
                </TabsContent>
              </Tabs>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleResetToGlobal}
              >
                <X className="w-4 h-4" />
                Reset to Global Styles
              </Button>
            </>
          )}

          {!currentOverrides.useCustomStyles && (
            <div className="p-4 rounded-lg border bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">
                This block is using global branding styles.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Enable custom styles above to override.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
