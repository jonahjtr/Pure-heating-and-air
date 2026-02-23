import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  HeaderConfig, 
  FooterConfig, 
  defaultHeaderConfig, 
  defaultFooterConfig 
} from '@/types/siteLayout';

interface SiteLayoutContextType {
  header: HeaderConfig;
  footer: FooterConfig;
  loading: boolean;
  refetch: () => Promise<void>;
}

const SiteLayoutContext = createContext<SiteLayoutContextType>({
  header: defaultHeaderConfig,
  footer: defaultFooterConfig,
  loading: true,
  refetch: async () => {},
});

export function SiteLayoutProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeader] = useState<HeaderConfig>(defaultHeaderConfig);
  const [footer, setFooter] = useState<FooterConfig>(defaultFooterConfig);
  const [loading, setLoading] = useState(true);

  const fetchLayout = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('key, value')
        .in('key', ['header_config', 'footer_config']);

      if (error) throw error;

      if (data) {
        for (const row of data) {
          if (row.key === 'header_config' && row.value) {
            const value = row.value as unknown as HeaderConfig;
            setHeader({ ...defaultHeaderConfig, ...value });
          }
          if (row.key === 'footer_config' && row.value) {
            const value = row.value as unknown as FooterConfig;
            setFooter({ ...defaultFooterConfig, ...value });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching site layout:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLayout();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('site-layout-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_settings',
        },
        (payload) => {
          const key = (payload.new as any)?.key;
          if (key === 'header_config' || key === 'footer_config') {
            fetchLayout();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLayout]);

  return (
    <SiteLayoutContext.Provider value={{ header, footer, loading, refetch: fetchLayout }}>
      {children}
    </SiteLayoutContext.Provider>
  );
}

export function useSiteLayout() {
  return useContext(SiteLayoutContext);
}
