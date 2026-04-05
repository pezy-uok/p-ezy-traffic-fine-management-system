-- ============================================================================
-- PEZY SYSTEM - FULL DATABASE INITIALIZATION & SEED SCRIPT
-- ============================================================================

-- 1. CLEANUP & TYPE INITIALIZATION
DO $$ 
BEGIN
    -- Auth & Status Types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'police_officer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'criminal_status') THEN
        CREATE TYPE criminal_status AS ENUM ('active', 'inactive', 'deceased', 'deported');
    END IF;
    
    -- Fine Management Types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fine_status_enum') THEN
        CREATE TYPE fine_status_enum AS ENUM ('unpaid', 'paid', 'outdated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fine_payment_method_enum') THEN
        CREATE TYPE fine_payment_method_enum AS ENUM ('credit_card', 'bank_transfer', 'cash');
    END IF;
    
    -- Severity & Reporting Types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'warning_severity_enum') THEN
        CREATE TYPE warning_severity_enum AS ENUM ('minor', 'moderate', 'severe');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tip_status_enum') THEN
        CREATE TYPE tip_status_enum AS ENUM ('submitted', 'investigating', 'resolved', 'closed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'news_category_enum') THEN
        CREATE TYPE news_category_enum AS ENUM ('alert', 'notice', 'crime_update', 'safety_tip', 'general');
    END IF;
END $$;

-- 2. TABLES (In Dependency Order)

-- A. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'police_officer',
    badge_number VARCHAR(50) UNIQUE,
    department VARCHAR(255),
    rank VARCHAR(100),
    phone_verified BOOLEAN DEFAULT false,
    pin_hash VARCHAR(255),
    status user_status NOT NULL DEFAULT 'active',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    permissions JSONB DEFAULT '[]'::jsonb,
    can_access_mobile_app BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT pin_required_when_verified CHECK ((is_verified = false) OR (pin_hash IS NOT NULL))
);

-- B. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    city VARCHAR(100),
    vehicle_registration VARCHAR(50),
    vehicle_type VARCHAR(100),
    blacklisted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C. Criminals Table
CREATE TABLE IF NOT EXISTS criminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    identification_number VARCHAR(100) UNIQUE,
    status criminal_status NOT NULL DEFAULT 'active',
    wanted BOOLEAN DEFAULT false,
    danger_level VARCHAR(50),
    arrest_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- D. Fines Table
CREATE TABLE IF NOT EXISTS fines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    issued_by_officer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    violation_code VARCHAR(50),
    location VARCHAR(255),
    status fine_status_enum NOT NULL DEFAULT 'unpaid',
    payment_date DATE,
    payment_method fine_payment_method_enum,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_payment_date CHECK (
        (status = 'paid' AND payment_date IS NOT NULL AND payment_method IS NOT NULL) OR 
        (status != 'paid' AND payment_date IS NULL)
    )
);

-- E. Warnings Table
CREATE TABLE IF NOT EXISTS warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    issued_by_officer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    severity warning_severity_enum NOT NULL DEFAULT 'minor',
    violation_code VARCHAR(50),
    location VARCHAR(255),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- F. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fine_id UUID REFERENCES fines(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_method fine_payment_method_enum NOT NULL,
    status payment_status_enum NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(100),
    reference_number VARCHAR(100),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- G. News Table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category news_category_enum NOT NULL DEFAULT 'general',
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    featured BOOLEAN DEFAULT false,
    pinned BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- H. Tips Table
CREATE TABLE IF NOT EXISTS tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status tip_status_enum NOT NULL DEFAULT 'submitted',
    category VARCHAR(100),
    assigned_officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FUNCTIONS & SECURITY
CREATE OR REPLACE FUNCTION get_my_role() RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM users WHERE id = (SELECT auth.uid())::uuid;
$$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS management_access ON fines;
CREATE POLICY management_access ON fines FOR ALL TO authenticated 
USING (get_my_role() IN ('police_officer', 'admin'))
WITH CHECK (get_my_role() IN ('police_officer', 'admin'));

-- 3. ADD MISSING COLUMNS TO USERS TABLE (Activity Tracking)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE;

-- 4. FULL MOCK DATA (With Constraints Satisfied)

-- Users
INSERT INTO users (id, email, name, phone, role, badge_number, status, is_verified, pin_hash, last_login, last_activity_at)
VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@pezy.gov', 'System Admin', '+94111111111', 'admin', 'ADM-001', 'active', true, '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6s58otWpQy0S2C', NULL, NULL),
('00000000-0000-0000-0000-000000000002', 'officer.bandara@pezy.gov', 'Shashmitha Bandara', '+94772222222', 'police_officer', 'PO-7721', 'active', true, '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6s58otWpQy0S2C', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Drivers
INSERT INTO drivers (id, first_name, last_name, license_number, phone, city)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Kamal', 'Gunaratne', 'B7283912', '+94775555555', 'Colombo'),
('11111111-1111-1111-1111-111111111112', 'Sunil', 'Fernando', 'B1122334', '+94776666666', 'Kandy')
ON CONFLICT (id) DO NOTHING;

-- Fines (Constraint: Status 'paid' requires date/method)
INSERT INTO fines (id, driver_id, issued_by_officer_id, amount, reason, status, payment_date, payment_method, issue_date)
VALUES 
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 2500.00, 'Speeding', 'unpaid', NULL, NULL, CURRENT_DATE - INTERVAL '5 days'),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000002', 1500.00, 'Illegal Parking', 'paid', CURRENT_DATE - INTERVAL '1 day', 'cash', CURRENT_DATE - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Payments
INSERT INTO payments (id, fine_id, amount, payment_method, status, transaction_id, payment_date)
VALUES ('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333332', 1500.00, 'cash', 'completed', 'TXN-001', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Warnings
INSERT INTO warnings (id, driver_id, issued_by_officer_id, reason, severity)
VALUES ('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'Tail light out', 'minor')
ON CONFLICT (id) DO NOTHING;

-- News
INSERT INTO news (id, title, content, category, author_id, featured, pinned, published_at)
VALUES ('77777777-7777-7777-7777-777777777771', 'Road Safety Week', 'New checkpoints active.', 'alert', '00000000-0000-0000-0000-000000000001', true, true, NOW())
ON CONFLICT (id) DO NOTHING;