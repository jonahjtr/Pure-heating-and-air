import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { BrandingSettings } from '@/types/branding';

export interface ThemePreset {
  id: string;
  name: string;
  colors: BrandingSettings['colors'];
  typography: BrandingSettings['typography'];
}

export const themePresets: ThemePreset[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#EA580C',
      secondary: '#EDE9FE',
      accent: '#D1FAE5',
      background: '#FCFCFC',
      foreground: '#1A1A1F',
      muted: '#F5F3EF',
    },
    typography: {
      headingFont: 'Space Grotesk',
      bodyFont: 'Inter',
      baseSize: '16',
      headingWeight: '600',
      bodyWeight: '400',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      primary: '#6366F1',
      secondary: '#312E81',
      accent: '#818CF8',
      background: '#0F0F23',
      foreground: '#E2E8F0',
      muted: '#1E1E3F',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseSize: '16',
      headingWeight: '700',
      bodyWeight: '400',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#059669',
      secondary: '#D1FAE5',
      accent: '#34D399',
      background: '#FAFDF7',
      foreground: '#1A2E1A',
      muted: '#ECFDF5',
    },
    typography: {
      headingFont: 'Merriweather',
      bodyFont: 'Source Sans Pro',
      baseSize: '16',
      headingWeight: '700',
      bodyWeight: '400',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#F97316',
      secondary: '#FEF3C7',
      accent: '#FB923C',
      background: '#FFFBF5',
      foreground: '#431407',
      muted: '#FFF7ED',
    },
    typography: {
      headingFont: 'Poppins',
      bodyFont: 'Inter',
      baseSize: '16',
      headingWeight: '600',
      bodyWeight: '400',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0EA5E9',
      secondary: '#E0F2FE',
      accent: '#38BDF8',
      background: '#F8FAFC',
      foreground: '#0C4A6E',
      muted: '#F0F9FF',
    },
    typography: {
      headingFont: 'Montserrat',
      bodyFont: 'Open Sans',
      baseSize: '16',
      headingWeight: '600',
      bodyWeight: '400',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EDE9FE',
      accent: '#A78BFA',
      background: '#FAFAFF',
      foreground: '#3B0764',
      muted: '#F5F3FF',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Lato',
      baseSize: '16',
      headingWeight: '600',
      bodyWeight: '400',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    colors: {
      primary: '#E11D48',
      secondary: '#FFE4E6',
      accent: '#FB7185',
      background: '#FFFBFB',
      foreground: '#4C0519',
      muted: '#FFF1F2',
    },
    typography: {
      headingFont: 'Poppins',
      bodyFont: 'Inter',
      baseSize: '16',
      headingWeight: '500',
      bodyWeight: '400',
    },
  },
  {
    id: 'slate',
    name: 'Slate',
    colors: {
      primary: '#475569',
      secondary: '#E2E8F0',
      accent: '#64748B',
      background: '#FFFFFF',
      foreground: '#0F172A',
      muted: '#F1F5F9',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseSize: '16',
      headingWeight: '600',
      bodyWeight: '400',
    },
  },
  {
    id: 'noir',
    name: 'Noir',
    colors: {
      primary: '#FFFFFF',
      secondary: '#27272A',
      accent: '#A1A1AA',
      background: '#09090B',
      foreground: '#FAFAFA',
      muted: '#18181B',
    },
    typography: {
      headingFont: 'Space Grotesk',
      bodyFont: 'Inter',
      baseSize: '16',
      headingWeight: '700',
      bodyWeight: '400',
    },
  },
];

interface ThemePresetsProps {
  currentColors: BrandingSettings['colors'];
  onSelectTheme: (theme: ThemePreset) => void;
}

export function ThemePresets({ currentColors, onSelectTheme }: ThemePresetsProps) {
  const isThemeActive = (preset: ThemePreset) => {
    return (
      preset.colors.primary === currentColors.primary &&
      preset.colors.secondary === currentColors.secondary &&
      preset.colors.background === currentColors.background &&
      preset.colors.foreground === currentColors.foreground
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Presets</CardTitle>
        <CardDescription>
          Choose a preset theme to quickly apply a cohesive color palette and typography.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {themePresets.map((preset) => {
            const isActive = isThemeActive(preset);
            return (
              <button
                key={preset.id}
                onClick={() => onSelectTheme(preset)}
                className={cn(
                  'group relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-primary/50',
                  isActive ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                {/* Color swatches preview */}
                <div className="relative w-full aspect-square rounded-md overflow-hidden shadow-sm">
                  {/* Background layer */}
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: preset.colors.background }}
                  />
                  {/* Primary accent strip */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1/3"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  {/* Secondary circle */}
                  <div
                    className="absolute top-2 left-2 w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.colors.secondary }}
                  />
                  {/* Accent circle */}
                  <div
                    className="absolute top-2 right-2 w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.colors.accent }}
                  />
                  {/* Text preview lines */}
                  <div className="absolute top-8 left-2 right-2 space-y-1">
                    <div
                      className="h-1.5 rounded"
                      style={{ backgroundColor: preset.colors.foreground, width: '60%' }}
                    />
                    <div
                      className="h-1 rounded"
                      style={{ backgroundColor: preset.colors.muted, width: '80%' }}
                    />
                  </div>
                </div>

                {/* Theme name */}
                <span className="text-xs font-medium text-foreground">{preset.name}</span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
