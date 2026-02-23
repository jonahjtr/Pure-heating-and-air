import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BrandingSettings, defaultBranding } from '@/types/branding';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export function useBranding() {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBranding = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('value')
        .eq('key', 'branding')
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        // Type assertion since we know the structure
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
  }, [fetchBranding]);

  const saveBranding = async (newBranding: BrandingSettings) => {
    setSaving(true);
    try {
      // First check if record exists
      const { data: existing } = await supabase
        .from('global_settings')
        .select('id')
        .eq('key', 'branding')
        .maybeSingle();

      // Convert to Json type
      const valueAsJson = JSON.parse(JSON.stringify(newBranding)) as Json;

      let error;
      if (existing) {
        // Update existing record
        const result = await supabase
          .from('global_settings')
          .update({
            value: valueAsJson,
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'branding');
        error = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from('global_settings')
          .insert([{
            key: 'branding',
            value: valueAsJson,
          }]);
        error = result.error;
      }

      if (error) throw error;

      setBranding(newBranding);
      toast.success('Branding settings saved');
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  const updateColors = (colors: Partial<BrandingSettings['colors']>) => {
    setBranding(prev => ({
      ...prev,
      colors: { ...prev.colors, ...colors },
    }));
  };

  const updateTypography = (typography: Partial<BrandingSettings['typography']>) => {
    setBranding(prev => ({
      ...prev,
      typography: { ...prev.typography, ...typography },
    }));
  };

  return {
    branding,
    loading,
    saving,
    saveBranding,
    updateColors,
    updateTypography,
    refetch: fetchBranding,
  };
}
