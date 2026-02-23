-- Enable realtime for global_settings table so branding changes propagate immediately
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_settings;