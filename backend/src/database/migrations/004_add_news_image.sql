-- Migration: Add image storage support for news records
-- Date: 2026-04-10

ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS image_path character varying(500) null,
ADD COLUMN IF NOT EXISTS image_size bigint null,
ADD COLUMN IF NOT EXISTS image_uploaded_at timestamp with time zone null;

CREATE INDEX IF NOT EXISTS news_image_path_idx
ON public.news(image_path)
WHERE image_path IS NOT NULL;

COMMENT ON COLUMN public.news.image_path IS 'Local file path to news image, e.g., /uploads/news/news-id-123.jpg';
COMMENT ON COLUMN public.news.image_size IS 'Uploaded image size in bytes';
COMMENT ON COLUMN public.news.image_uploaded_at IS 'Timestamp when the image was uploaded';
