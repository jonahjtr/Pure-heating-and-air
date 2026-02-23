import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BrandingSettings, defaultBranding } from '@/types/branding';
import { hexToHslVar, readableTextOn } from '@/lib/color';

interface BrandingContextType {
  branding: BrandingSettings;
  loading: boolean;
  refetch: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  loading: true,
  refetch: async () => {},
});

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [loading, setLoading] = useState(true);

  const fetchBranding = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('value')
        .eq('key', 'branding')
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        const value = data.value as unknown as BrandingSettings;
        setBranding({
          colors: { ...defaultBranding.colors, ...value.colors },
          typography: { ...defaultBranding.typography, ...value.typography },
        });
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();

    // Subscribe to realtime changes on global_settings
    const channel = supabase
      .channel('branding-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_settings',
          filter: 'key=eq.branding',
        },
        () => {
          // Refetch branding when it changes
          fetchBranding();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBranding]);

  // Apply CSS variables when branding changes
  useEffect(() => {
    if (!loading) {
      const root = document.documentElement;
      
      // Apply colors
      root.style.setProperty('--brand-primary', branding.colors.primary);
      root.style.setProperty('--brand-secondary', branding.colors.secondary);
      root.style.setProperty('--brand-accent', branding.colors.accent);
      root.style.setProperty('--brand-background', branding.colors.background);
      root.style.setProperty('--brand-foreground', branding.colors.foreground);
      root.style.setProperty('--brand-muted', branding.colors.muted);

      // Bridge HEX branding -> the HSL design tokens used across the app (Tailwind/shadcn)
      // These variables are defined as "H S% L%" (no `hsl()` wrapper) in src/index.css.
      const primaryHsl = hexToHslVar(branding.colors.primary);
      const secondaryHsl = hexToHslVar(branding.colors.secondary);
      const accentHsl = hexToHslVar(branding.colors.accent);
      const backgroundHsl = hexToHslVar(branding.colors.background);
      const foregroundHsl = hexToHslVar(branding.colors.foreground);
      const mutedHsl = hexToHslVar(branding.colors.muted);

      if (backgroundHsl) root.style.setProperty('--background', backgroundHsl);
      if (foregroundHsl) root.style.setProperty('--foreground', foregroundHsl);
      if (primaryHsl) root.style.setProperty('--primary', primaryHsl);
      if (secondaryHsl) root.style.setProperty('--secondary', secondaryHsl);
      if (accentHsl) root.style.setProperty('--accent', accentHsl);
      if (mutedHsl) root.style.setProperty('--muted', mutedHsl);

      // Derived “foreground” tokens so components remain readable.
      root.style.setProperty('--primary-foreground', hexToHslVar(readableTextOn(branding.colors.primary)) || '0 0% 100%');
      root.style.setProperty('--secondary-foreground', hexToHslVar(readableTextOn(branding.colors.secondary)) || '240 10% 10%');
      root.style.setProperty('--accent-foreground', hexToHslVar(readableTextOn(branding.colors.accent)) || '240 10% 10%');
      root.style.setProperty('--muted-foreground', foregroundHsl || '240 5% 45%');

      // Keep a few key system tokens in sync (safe defaults).
      // (We intentionally keep border/ring tied to the primary for a cohesive theme.)
      if (primaryHsl) root.style.setProperty('--ring', primaryHsl);

      // Sidebar tokens (used heavily in admin UI)
      if (backgroundHsl) root.style.setProperty('--sidebar-background', backgroundHsl);
      if (foregroundHsl) root.style.setProperty('--sidebar-foreground', foregroundHsl);
      if (primaryHsl) root.style.setProperty('--sidebar-primary', primaryHsl);
      root.style.setProperty(
        '--sidebar-primary-foreground',
        hexToHslVar(readableTextOn(branding.colors.primary)) || '0 0% 100%'
      );
      if (secondaryHsl) root.style.setProperty('--sidebar-accent', secondaryHsl);
      root.style.setProperty(
        '--sidebar-accent-foreground',
        hexToHslVar(readableTextOn(branding.colors.secondary)) || '240 10% 10%'
      );
      
      // Apply typography
      root.style.setProperty('--brand-heading-font', branding.typography.headingFont);
      root.style.setProperty('--brand-body-font', branding.typography.bodyFont);
      root.style.setProperty('--brand-base-size', `${branding.typography.baseSize}px`);
      root.style.setProperty('--brand-heading-weight', branding.typography.headingWeight);
      root.style.setProperty('--brand-body-weight', branding.typography.bodyWeight);

      // Apply base font size globally (so typography settings actually affect pages)
      const base = Number(branding.typography.baseSize);
      if (!Number.isNaN(base) && base >= 12 && base <= 24) {
        root.style.fontSize = `${base}px`;
      }
    }
  }, [branding, loading]);

  return (
    <BrandingContext.Provider value={{ branding, loading, refetch: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBrandingContext() {
  return useContext(BrandingContext);
}
