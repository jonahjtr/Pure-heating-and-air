-- Create table to store reusable component templates
CREATE TABLE public.reusable_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  block_type TEXT NOT NULL,
  content JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reusable_components ENABLE ROW LEVEL SECURITY;

-- CMS users can view all reusable components
CREATE POLICY "CMS users can view reusable components"
ON public.reusable_components
FOR SELECT
USING (is_cms_user(auth.uid()));

-- CMS users can create reusable components
CREATE POLICY "CMS users can create reusable components"
ON public.reusable_components
FOR INSERT
WITH CHECK (is_cms_user(auth.uid()) AND created_by = auth.uid());

-- CMS users can update reusable components
CREATE POLICY "CMS users can update reusable components"
ON public.reusable_components
FOR UPDATE
USING (is_cms_user(auth.uid()));

-- Admins can delete reusable components
CREATE POLICY "Admins can delete reusable components"
ON public.reusable_components
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_reusable_components_updated_at
BEFORE UPDATE ON public.reusable_components
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();