-- ============================================================================
-- INSERT CRIMINAL RECORDS - Custom Data
-- Copy and paste this into Supabase SQL Editor to insert the records
-- ============================================================================

INSERT INTO public.criminals (
  first_name,
  last_name,
  date_of_birth,
  gender,
  physical_description,
  identification_number,
  status,
  wanted,
  danger_level,
  known_aliases,
  arrested_before,
  arrest_count,
  photo_path,
  photo_uploaded_at,
  photo_size,
  created_at,
  updated_at
) VALUES

-- Criminal 1: Leshan Sanjeewa
(
  'Leshan',
  'Sanjeewa',
  '1999-01-25'::date,
  'Male',
  'Tall build, brown hair, Works @NCINGA',
  'ID-001-J-DOE',
  'active',
  true,
  'critical',
  '["Mola", "Nakiya"]'::jsonb,
  true,
  12,
  '/uploads/criminals/leshan.jpg',
  NOW(),
  0,
  NOW(),
  NOW()
),

-- Criminal 2: Mahinda Rajapaksha
(
  'Mahinda',
  'Rajapaksha',
  '1945-11-18'::date,
  'Male',
  'Rajapaksa became the leader of the Sri Lanka Podujana Peramuna in 2019, a proxy of the former president that had split from the Sri Lanka Freedom Party.',
  'ID-002-M-GARCIA',
  'active',
  false,
  'high',
  '["Maina", "Appachchi"]'::jsonb,
  true,
  8,
  '/uploads/criminals/maina.jpg',
  NOW(),
  0,
  NOW(),
  NOW()
),

-- Criminal 3: Sajith Premadasa
(
  'Sajith',
  'Premadasa',
  '1978-11-08'::date,
  'Male',
  'He made a political, humorous comeback stating Ane Please jokes will not work, in response to comments from the government.',
  'ID-003-R-JOHNSON',
  'active',
  false,
  'low',
  '["Bob", "RJ"]'::jsonb,
  true,
  4,
  '/uploads/criminals/robert-johnson.jpg',
  NOW(),
  0,
  NOW(),
  NOW()
),

-- Criminal 4: Sarah Wilson
(
  'Sarah',
  'Wilson',
  '1988-01-30'::date,
  'Female',
  'Tall, blonde hair, blue eyes. Tattoo: rose on shoulder. Known to be armed',
  'ID-004-S-WILSON',
  'active',
  true,
  'critical',
  '["Sally", "S.W", "The Rose"]'::jsonb,
  true,
  18,
  '/uploads/criminals/sajith.jpg',
  NOW(),
  312000,
  NOW(),
  NOW()
);

-- ============================================================================
-- Verify inserted records
-- ============================================================================
SELECT 
  id,
  first_name,
  last_name,
  status,
  wanted,
  danger_level,
  photo_path,
  created_at
FROM public.criminals
WHERE first_name IN ('Leshan', 'Mahinda', 'Sajith', 'Sarah')
ORDER BY created_at DESC;
