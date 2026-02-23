import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PageSection } from '@/types/sections';
import { useBrandingContext } from '@/contexts/BrandingContext';

interface StyleOverrides {
  useCustomStyles?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string;
  bodyWeight?: string;
}

interface StyleInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: PageSection | null;
  onUpdateStyleOverrides: (overrides: StyleOverrides) => void;
}

const fontOptions = [
  { label: 'System Default', value: 'system-ui' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Playfair Display', value: 'Playfair Display, serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: 'Open Sans, sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
];

const fontWeightOptions = [
  { label: 'Light', value: '300' },
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semi Bold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra Bold', value: '800' },
];

export function StyleInspectorSheet({
  open,
  onOpenChange,
  section,
  onUpdateStyleOverrides,
}: StyleInspectorSheetProps) {
  const { branding } = useBrandingContext();

  if (!section) return null;

  const content = section.content_json as Record<string, unknown>;
  const styleOverrides = (content.styleOverrides as StyleOverrides) || {};
  const useCustom = styleOverrides.useCustomStyles || false;

  const updateOverride = (key: keyof StyleOverrides, value: unknown) => {
    onUpdateStyleOverrides({
      ...styleOverrides,
      [key]: value,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Style Overrides</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Enable custom styles toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Use Custom Styles</Label>
              <p className="text-sm text-muted-foreground">
                Override global branding for this section
              </p>
            </div>
            <Switch
              checked={useCustom}
              onCheckedChange={(checked) => updateOverride('useCustomStyles', checked)}
            />
          </div>

          {useCustom && (
            <>
              {/* Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Colors</h4>

                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styleOverrides.primaryColor || branding.colors.primary}
                      onChange={(e) => updateOverride('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={styleOverrides.primaryColor || branding.colors.primary}
                      onChange={(e) => updateOverride('primaryColor', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styleOverrides.backgroundColor || branding.colors.background}
                      onChange={(e) => updateOverride('backgroundColor', e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={styleOverrides.backgroundColor || branding.colors.background}
                      onChange={(e) => updateOverride('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styleOverrides.textColor || branding.colors.foreground}
                      onChange={(e) => updateOverride('textColor', e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={styleOverrides.textColor || branding.colors.foreground}
                      onChange={(e) => updateOverride('textColor', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Typography</h4>

                <div className="space-y-2">
                  <Label>Heading Font</Label>
                  <Select
                    value={styleOverrides.headingFont || branding.typography.headingFont}
                    onValueChange={(value) => updateOverride('headingFont', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Heading Weight</Label>
                  <Select
                    value={styleOverrides.headingWeight || branding.typography.headingWeight}
                    onValueChange={(value) => updateOverride('headingWeight', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontWeightOptions.map((weight) => (
                        <SelectItem key={weight.value} value={weight.value}>
                          {weight.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Body Font</Label>
                  <Select
                    value={styleOverrides.bodyFont || branding.typography.bodyFont}
                    onValueChange={(value) => updateOverride('bodyFont', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {!useCustom && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Enable custom styles to override global branding settings for this section.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
