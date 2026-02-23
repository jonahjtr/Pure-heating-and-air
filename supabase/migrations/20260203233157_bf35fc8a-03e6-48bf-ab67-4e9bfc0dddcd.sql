-- Add columns to page_sections for reusable components and style overrides
ALTER TABLE public.page_sections 
ADD COLUMN IF NOT EXISTS style_overrides JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS reusable_id UUID REFERENCES public.reusable_components(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_linked BOOLEAN DEFAULT false;

-- Create index for faster reusable lookups
CREATE INDEX IF NOT EXISTS idx_page_sections_reusable_id ON public.page_sections(reusable_id) WHERE reusable_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.page_sections.style_overrides IS 'Custom style overrides for this section (colors, typography, spacing)';
COMMENT ON COLUMN public.page_sections.reusable_id IS 'Reference to reusable_components if this section is linked to a template';
COMMENT ON COLUMN public.page_sections.is_linked IS 'Whether changes to this section should sync with the reusable template';