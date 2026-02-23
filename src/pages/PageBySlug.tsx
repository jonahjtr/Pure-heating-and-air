import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageRenderer } from "@/components/public/PageRenderer";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { useSiteLayout } from "@/contexts/SiteLayoutContext";
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

export default function PageBySlug() {
  const { slug } = useParams();
  const { header, footer, loading: layoutLoading } = useSiteLayout();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<PageRow | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [notFound, setNotFound] = useState(false);

  const safeSlug = useMemo(() => (slug ?? "").trim(), [slug]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!safeSlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);

      // Fetch page data
      const { data: pageData, error: pageError } = await supabase
        .from("pages")
        .select("id,title,slug,status,seo_title,seo_description,seo_image,content")
        .eq("slug", safeSlug)
        .maybeSingle();

      if (cancelled) return;

      if (pageError) {
        console.error("Error loading page by slug:", pageError);
        setNotFound(true);
        setPage(null);
        setLoading(false);
        return;
      }

      if (!pageData) {
        setNotFound(true);
        setPage(null);
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
        // Cast to our section type
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
  }, [safeSlug]);

  useEffect(() => {
    if (!page) return;
    document.title = page.seo_title || page.title;
  }, [page]);

  if (loading || layoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading page…</div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader config={header} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold">Page not found</h1>
            <p className="text-sm text-muted-foreground">/{safeSlug}</p>
          </div>
        </div>
        <SiteFooter config={footer} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader config={header} />
      <main className="flex-1">
        <PageRenderer
          title={page.title}
          seoDescription={page.seo_description}
          blocks={page.content}
          sections={sections}
        />
      </main>
      <SiteFooter config={footer} />
    </div>
  );
}
