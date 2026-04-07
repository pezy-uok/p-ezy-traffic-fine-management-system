-- Migration: Add photo_path column to criminals table
-- Date: 2026-04-07
-- Description: Add support for storing criminal photo file paths

-- Add photo_path column
ALTER TABLE public.criminals
ADD COLUMN photo_path character varying(500) null,
ADD COLUMN photo_uploaded_at timestamp with time zone null,
ADD COLUMN photo_size integer null;

-- Create index on photo_path for faster lookups
CREATE INDEX criminals_photo_path_idx ON public.criminals(photo_path) 
WHERE photo_path IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.criminals.photo_path IS 'Local file path to criminal photo, e.g., /uploads/criminals/uuid.jpg';
COMMENT ON COLUMN public.criminals.photo_uploaded_at IS 'Timestamp when photo was uploaded';
COMMENT ON COLUMN public.criminals.photo_size IS 'File size in bytes';
