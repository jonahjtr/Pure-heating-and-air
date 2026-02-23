-- Add page_id to content_types to track the auto-generated master page
ALTER TABLE public.content_types 
ADD COLUMN page_id uuid REFERENCES public.pages(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_content_types_page_id ON public.content_types(page_id);