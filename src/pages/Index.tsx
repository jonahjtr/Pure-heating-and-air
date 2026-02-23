import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageRenderer } from "@/components/public/PageRenderer";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { useSiteLayout } from "@/contexts/SiteLayoutContext";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { ColdAirAnimationSection } from "@/components/sections/ColdAirAnimationSection";
import type { PageSection, SectionType } from "@/types/sections";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | null;
  content: unknown;
};

export default function Index() {
  const { header, footer, loading: layoutLoading } = useSiteLayout();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<PageRow | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      // Fetch homepage data (slug = 'home')
      const { data: pageData, error: pageError } = await supabase
        .from("pages")
        .select("id,title,slug,status,seo_title,seo_description,seo_image,content")
        .eq("slug", "home")
        .maybeSingle();

      if (cancelled) return;

      if (pageError) {
        console.error("Error loading homepage:", pageError);
        setLoading(false);
        return;
      }

      if (!pageData) {
        // No homepage exists yet
        setLoading(false);
        return;
      }

      setPage(pageData as PageRow);

      // Fetch sections for this page
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("page_sections")
        .select("*")
        .eq("page_id", pageData.id)
        .eq("is_visible", true)
        .order("order", { ascending: true });

      if (cancelled) return;

      if (sectionsError) {
        console.error("Error loading page sections:", sectionsError);
      } else {
        const typedSections = (sectionsData || []).map((s) => ({
          ...s,
          section_type: s.section_type as SectionType,
          content_json: s.content_json as Record<string, unknown>,
        })) as PageSection[];
        setSections(typedSections);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!page) return;
    document.title = page.seo_title || page.title || "Pure Heating & Air";
  }, [page]);

  if (loading || layoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If no homepage exists, show a basic message
  if (!page) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader config={header} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold">Welcome</h1>
            <p className="text-sm text-muted-foreground">
              No homepage has been created yet. Please add a page with slug "home" in the admin panel.
            </p>
          </div>
        </div>
        <SiteFooter config={footer} />
      </div>
    );
  }

  // Split sections: insert ColdAirAnimationSection after trust-badges (order 4)
  const trustBadgesIndex = sections.findIndex(s => s.section_type === 'trust-badges');
  const insertAfterIndex = trustBadgesIndex >= 0 ? trustBadgesIndex : sections.length - 1;
  const beforeSections = sections.slice(0, insertAfterIndex + 1);
  const afterSections = sections.slice(insertAfterIndex + 1);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader config={header} />
      <main className="flex-1">
        {beforeSections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
        <ColdAirAnimationSection />
        {afterSections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>
      <SiteFooter config={footer} />
    </div>
  );
}
