-- Create page_sections table for section-based content management
CREATE TABLE public.page_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    "order" INTEGER NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying by page_id and order
CREATE INDEX idx_page_sections_page_order ON public.page_sections(page_id, "order");

-- Enable Row Level Security
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- CMS users can view all sections
CREATE POLICY "CMS users can view all sections"
ON public.page_sections
FOR SELECT
USING (is_cms_user(auth.uid()));

-- CMS users can create sections
CREATE POLICY "CMS users can create sections"
ON public.page_sections
FOR INSERT
WITH CHECK (is_cms_user(auth.uid()));

-- CMS users can update sections
CREATE POLICY "CMS users can update sections"
ON public.page_sections
FOR UPDATE
USING (is_cms_user(auth.uid()))
WITH CHECK (is_cms_user(auth.uid()));

-- Only admins can delete sections
CREATE POLICY "Admins can delete sections"
ON public.page_sections
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Public can view visible sections on published pages
CREATE POLICY "Public can view visible sections on published pages"
ON public.page_sections
FOR SELECT
USING (
    is_visible = true 
    AND EXISTS (
        SELECT 1 FROM public.pages 
        WHERE pages.id = page_sections.page_id 
        AND pages.status = 'published'
    )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_page_sections_updated_at
BEFORE UPDATE ON public.page_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();