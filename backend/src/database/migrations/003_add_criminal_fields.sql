-- Migration: Add missing criminal record fields
-- Date: 2026-04-08
-- Description: Add date_of_birth, gender, physical_description, known_aliases, arrested_before, and updated_at columns to criminals table

-- Add missing columns
ALTER TABLE public.criminals
ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL,
ADD COLUMN IF NOT EXISTS gender VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS physical_description TEXT NULL,
ADD COLUMN IF NOT EXISTS known_aliases JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS arrested_before BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS criminals_date_of_birth_idx ON public.criminals(date_of_birth);
CREATE INDEX IF NOT EXISTS criminals_gender_idx ON public.criminals(gender);
CREATE INDEX IF NOT EXISTS criminals_status_idx ON public.criminals(status);

-- Add comments for documentation
COMMENT ON COLUMN public.criminals.date_of_birth IS 'Date of birth of criminal';
COMMENT ON COLUMN public.criminals.gender IS 'Gender of criminal';
COMMENT ON COLUMN public.criminals.physical_description IS 'Physical description of criminal';
COMMENT ON COLUMN public.criminals.known_aliases IS 'Array of known aliases/aliases';
COMMENT ON COLUMN public.criminals.arrested_before IS 'Whether criminal has been arrested before';
COMMENT ON COLUMN public.criminals.updated_at IS 'Timestamp of last update';
