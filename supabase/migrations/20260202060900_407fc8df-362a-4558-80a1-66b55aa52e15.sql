-- Add tags column to media table
ALTER TABLE public.media
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for tag search
CREATE INDEX idx_media_tags ON public.media USING GIN(tags);