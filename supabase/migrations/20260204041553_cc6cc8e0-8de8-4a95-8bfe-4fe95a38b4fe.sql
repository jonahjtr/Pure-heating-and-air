-- Fix RLS policies to be PERMISSIVE instead of RESTRICTIVE
-- Drop and recreate the public access policies for pages

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Public can view published pages" ON public.pages;

-- Create permissive policy for public viewing of published pages
CREATE POLICY "Public can view published pages" 
ON public.pages 
FOR SELECT 
TO public
USING (status = 'published'::text);

-- Fix page_sections policy as well
DROP POLICY IF EXISTS "Public can view visible sections on published pages" ON public.page_sections;

CREATE POLICY "Public can view visible sections on published pages" 
ON public.page_sections 
FOR SELECT 
TO public
USING (
  is_visible = true 
  AND EXISTS (
    SELECT 1 FROM pages 
    WHERE pages.id = page_sections.page_id 
    AND pages.status = 'published'::text
  )
);

-- Fix content_type_items policy
DROP POLICY IF EXISTS "Public can view published content type items" ON public.content_type_items;

CREATE POLICY "Public can view published content type items" 
ON public.content_type_items 
FOR SELECT 
TO public
USING (status = 'published'::text);

-- Fix global_settings public policy
DROP POLICY IF EXISTS "Public can view global settings" ON public.global_settings;

CREATE POLICY "Public can view global settings" 
ON public.global_settings 
FOR SELECT 
TO public
USING (true);