-- Create a table to store items for each content type
CREATE TABLE public.content_type_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type_id UUID NOT NULL REFERENCES public.content_types(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_type_id, slug)
);

-- Enable RLS
ALTER TABLE public.content_type_items ENABLE ROW LEVEL SECURITY;

-- CMS users can view all items
CREATE POLICY "CMS users can view all content type items"
ON public.content_type_items
FOR SELECT
USING (is_cms_user(auth.uid()));

-- CMS users can create items
CREATE POLICY "CMS users can create content type items"
ON public.content_type_items
FOR INSERT
WITH CHECK (is_cms_user(auth.uid()) AND author_id = auth.uid());

-- CMS users can update items
CREATE POLICY "CMS users can update content type items"
ON public.content_type_items
FOR UPDATE
USING (is_cms_user(auth.uid()))
WITH CHECK (is_cms_user(auth.uid()));

-- Admins can delete items
CREATE POLICY "Admins can delete content type items"
ON public.content_type_items
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Public can view published items
CREATE POLICY "Public can view published content type items"
ON public.content_type_items
FOR SELECT
USING (status = 'published');

-- Add trigger for updated_at
CREATE TRIGGER update_content_type_items_updated_at
BEFORE UPDATE ON public.content_type_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_content_type_items_content_type ON public.content_type_items(content_type_id);
CREATE INDEX idx_content_type_items_status ON public.content_type_items(status);
CREATE INDEX idx_content_type_items_slug ON public.content_type_items(slug);