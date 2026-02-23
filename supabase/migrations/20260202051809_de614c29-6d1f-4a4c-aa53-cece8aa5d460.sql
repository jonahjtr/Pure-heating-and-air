-- Create global_settings table for site branding and configuration
CREATE TABLE public.global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all settings
CREATE POLICY "Admins can manage global settings" 
ON public.global_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- CMS users can view settings
CREATE POLICY "CMS users can view global settings" 
ON public.global_settings 
FOR SELECT 
USING (is_cms_user(auth.uid()));

-- Public can view settings (needed for rendering pages)
CREATE POLICY "Public can view global settings" 
ON public.global_settings 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_global_settings_updated_at
BEFORE UPDATE ON public.global_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default branding settings
INSERT INTO public.global_settings (key, value) VALUES 
('branding', '{
  "colors": {
    "primary": "12 90% 58%",
    "secondary": "260 60% 95%",
    "accent": "160 60% 92%",
    "background": "0 0% 99%",
    "foreground": "240 10% 10%",
    "muted": "40 30% 96%"
  },
  "typography": {
    "headingFont": "Space Grotesk",
    "bodyFont": "Inter",
    "baseSize": "16",
    "headingWeight": "600",
    "bodyWeight": "400"
  }
}'::jsonb);