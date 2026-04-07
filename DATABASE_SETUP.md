# Database Setup Instructions

## Applying Database Migrations

The criminal record feature requires the following database migrations to be applied in Supabase.

### Step 1: Add Criminal Fields (003_add_criminal_fields.sql)
1. Open Supabase Console: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor tab
4. Click "New Query"
5. Copy the entire contents of `backend/src/database/migrations/003_add_criminal_fields.sql`
6. Run the migration

### Step 2: Add Photo Column (002_add_criminal_photo.sql)
1. Same as above, but use `backend/src/database/migrations/002_add_criminal_photo.sql`
2. This migration depends on the criminals table schema from Step 1

### Expected Schema After Migrations

The `criminals` table should have these columns:
```
- id (UUID, primary key)
- first_name (VARCHAR, required)
- last_name (VARCHAR, required)
- date_of_birth (DATE, optional)
- gender (VARCHAR, optional)
- physical_description (TEXT, optional)
- identification_number (VARCHAR, unique, optional)
- status (ENUM: active, inactive, deceased, deported)
- wanted (BOOLEAN)
- danger_level (VARCHAR)
- known_aliases (JSONB array)
- arrested_before (BOOLEAN)
- arrest_count (INT)
- photo_path (VARCHAR, optional)
- photo_uploaded_at (TIMESTAMP, optional)
- photo_size (INT, optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Testing the Setup

Once migrations are applied, you can test by:
1. Going to http://localhost:5173/
2. Log in as a police officer
3. Navigate to create criminal record dialog
4. Fill in the form and submit
5. Check Supabase directly to verify the record was created

## Troubleshooting

If records aren't being stored:
1. Check browser console (DevTools) for API errors
2. Check backend logs: `cat /tmp/backend.log | tail -50`
3. Verify Supabase connection: Check that SUPABASE_URL and SUPABASE_KEY are set in `.env`
4. Verify criminals table exists in Supabase: SQL Editor → `SELECT * FROM criminals LIMIT 1`

## Database Connection Details

The backend connects to Supabase using:
- **Service Role Key**: From environment variable `SUPABASE_KEY`
- **API URL**: From environment variable `SUPABASE_URL`
- **REST API**: Uses Supabase REST API client (not Sequelize)

Ensure these are properly set in `backend/.env`
