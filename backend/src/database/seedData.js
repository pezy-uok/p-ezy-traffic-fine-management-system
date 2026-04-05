import { getSupabaseClient } from '../config/supabaseClient.js';

/**
 * Database Seeding Script
 * Seeds mock data for development and testing
 * Compatible with Supabase REST API
 */

// ============================================================================
// SEED DATA DEFINITIONS
// ============================================================================

const seedUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@pezy.gov',
    name: 'System Administrator',
    phone: '+94711111111',
    role: 'admin',
    department: 'Command Center',
    status: 'active',
    is_verified: true,
    password: 'password123',
    pin_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6s58otWpQy0S2C',
    can_access_mobile_app: true,
    last_login: null,
    last_activity_at: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'officer.bandara@pezy.gov',
    name: 'Officer Shashmitha Bandara',
    phone: '+94772222222',
    role: 'police_officer',
    badge_number: 'PO-7721',
    department: 'Traffic',
    rank: 'Constable',
    status: 'active',
    is_verified: true,
    password: 'password123',
    pin_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6s58otWpQy0S2C',
    can_access_mobile_app: true,
    last_login: null,
    last_activity_at: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'officer.silva@pezy.gov',
    name: 'Officer Kasun Silva',
    phone: '+94773333333',
    role: 'police_officer',
    badge_number: 'PO-7722',
    department: 'Traffic',
    rank: 'Sergeant',
    status: 'active',
    is_verified: true,
    password: 'password123',
    pin_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6s58otWpQy0S2C',
    can_access_mobile_app: true,
    last_login: null,
    last_activity_at: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'officer.fernando@pezy.gov',
    name: 'Officer Dilshan Fernando',
    phone: '+94774444444',
    role: 'police_officer',
    badge_number: 'PO-7723',
    department: 'Criminal Investigation',
    rank: 'Inspector',
    status: 'active',
    is_verified: true,
    password: 'password123',
    pin_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6s58otWpQy0S2C',
    can_access_mobile_app: true,
    last_login: null,
    last_activity_at: null,
  },
];

const seedDrivers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    first_name: 'Kamal',
    last_name: 'Perera',
    license_number: 'B1234567',
    email: 'kamal.perera@example.com',
    phone: '+94775555555',
    date_of_birth: '1990-05-15',
    city: 'Colombo',
    country: 'Sri Lanka',
    vehicle_registration: 'CAB-1234',
    vehicle_type: 'Car',
    total_violations: 1,
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    first_name: 'Anura',
    last_name: 'Jayasundara',
    license_number: 'B1234568',
    email: 'anura.jay@example.com',
    phone: '+94776666666',
    date_of_birth: '1988-08-22',
    city: 'Kandy',
    country: 'Sri Lanka',
    vehicle_registration: 'CAB-1235',
    vehicle_type: 'Van',
    total_violations: 2,
  },
  {
    id: '11111111-1111-1111-1111-111111111113',
    first_name: 'Nishantha',
    last_name: 'Gunawardana',
    license_number: 'B1234569',
    email: 'nishantha@example.com',
    phone: '+94777777777',
    date_of_birth: '1995-12-10',
    city: 'Galle',
    country: 'Sri Lanka',
    vehicle_registration: 'CAB-1236',
    vehicle_type: 'Motorcycle',
    total_violations: 1,
  },
  {
    id: '11111111-1111-1111-1111-111111111114',
    first_name: 'Priya',
    last_name: 'Wijesinghe',
    license_number: 'B1234570',
    email: 'priya.wije@example.com',
    phone: '+94778888888',
    date_of_birth: '1992-03-18',
    city: 'Matara',
    country: 'Sri Lanka',
    vehicle_registration: 'CAB-1237',
    vehicle_type: 'Car',
    total_violations: 0,
  },
];

const seedCriminals = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    first_name: 'Rajith',
    last_name: 'Wickramasinghe',
    date_of_birth: '1985-06-12',
    gender: 'Male',
    identification_number: '851234567V',
    status: 'active',
    wanted: true,
    danger_level: 'high',
    arrest_count: 5,
  },
  {
    id: '22222222-2222-2222-2222-222222222223',
    first_name: 'Lakmal',
    last_name: 'Dissanayake',
    date_of_birth: '1990-11-28',
    gender: 'Male',
    identification_number: '901234568V',
    status: 'active',
    wanted: false,
    danger_level: 'medium',
    arrest_count: 2,
  },
  {
    id: '22222222-2222-2222-2222-222222222224',
    first_name: 'Samantha',
    last_name: 'De Silva',
    date_of_birth: '1988-02-14',
    gender: 'Female',
    identification_number: '881234569V',
    status: 'inactive',
    wanted: false,
    danger_level: 'low',
    arrest_count: 1,
  },
];

const seedFines = [
  {
    driver_id: '11111111-1111-1111-1111-111111111111',
    issued_by_officer_id: '00000000-0000-0000-0000-000000000002',
    amount: 2500.0,
    reason: 'Over-speeding: 85 km/h in 60 km/h zone',
    violation_code: 'V-001',
    location: 'Colombo 07, Galle Road',
    vehicle_registration: 'CAB-1234',
    issue_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'unpaid',
  },
  {
    driver_id: '11111111-1111-1111-1111-111111111112',
    issued_by_officer_id: '00000000-0000-0000-0000-000000000002',
    amount: 1500.0,
    reason: 'No seat belt',
    violation_code: 'V-002',
    location: 'Kandy Junction',
    vehicle_registration: 'CAB-1235',
    issue_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    due_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'unpaid',
  },
  {
    driver_id: '11111111-1111-1111-1111-111111111113',
    issued_by_officer_id: '00000000-0000-0000-0000-000000000003',
    amount: 3000.0,
    reason: 'Rash and negligent driving',
    violation_code: 'V-003',
    location: 'Galle Face, Colombo 03',
    vehicle_registration: 'CAB-1236',
    issue_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    due_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'outdated',
  },
  {
    driver_id: '11111111-1111-1111-1111-111111111114',
    issued_by_officer_id: '00000000-0000-0000-0000-000000000003',
    amount: 2000.0,
    reason: 'Traffic light violation',
    violation_code: 'V-004',
    location: 'Matara Town Center',
    vehicle_registration: 'CAB-1237',
    issue_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'paid',
    payment_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_method: 'bank_transfer',
  },
];

const seedWarnings = [
  {
    driver_id: '11111111-1111-1111-1111-111111111111',
    issued_by_officer_id: '00000000-0000-0000-0000-000000000002',
    reason: 'Minor speeding: 65 km/h in 60 km/h zone',
    severity: 'minor',
    violation_code: 'W-001',
    location: 'Colombo 06',
    vehicle_registration: 'CAB-1234',
    issue_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    driver_id: '11111111-1111-1111-1111-111111111112',
    issued_by_officer_id: '00000000-0000-0000-0000-000000000003',
    reason: 'Improper lane changing',
    severity: 'moderate',
    violation_code: 'W-002',
    location: 'Kandy Road',
    vehicle_registration: 'CAB-1235',
    issue_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    driver_id: '11111111-1111-1111-1111-111111111113',
    issued_by_officer_id: '00000000-0000-0000-0000-000000000003',
    reason: 'Unsafe tailgating',
    severity: 'moderate',
    violation_code: 'W-003',
    location: 'Southern Expressway',
    vehicle_registration: 'CAB-1236',
    issue_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

const seedNews = [
  {
    title: 'New Traffic Safety Campaign Launched',
    content:
      'The Traffic Police Division has launched a comprehensive road safety campaign focusing on helmet usage and speed limits. Citizens are urged to comply with all traffic regulations.',
    category: 'safety_tip',
    author_id: '00000000-0000-0000-0000-000000000001',
    featured: true,
    pinned: true,
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Weekend Checkpoints to Enhance Road Safety',
    content:
      'Special checkpoints will be set up across major cities during weekends. Drivers should ensure their vehicles are in good condition and all documentation is complete.',
    category: 'notice',
    author_id: '00000000-0000-0000-0000-000000000001',
    featured: false,
    pinned: false,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Crime Alert: Wanted Criminal Apprehended',
    content:
      'A wanted criminal, identified as Rajith Wickramasinghe, was successfully apprehended in Colombo on Friday. He was wanted for multiple vehicle thefts and robberies.',
    category: 'crime_update',
    author_id: '00000000-0000-0000-0000-000000000004',
    featured: true,
    pinned: false,
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const seedTips = [
  {
    title: 'Suspicious Activity at Port',
    description:
      'Report of suspicious cargo loading activity at Colombo Port on Friday night. Multiple unmarked vehicles observed between 11 PM - 2 AM.',
    status: 'submitted',
    category: 'suspicious activity',
    assigned_officer_id: '00000000-0000-0000-0000-000000000004',
  },
  {
    title: 'Missing Vehicle Report',
    description:
      'Blue Toyota Corolla (License: CAB-1238) reported missing from Nugegoda area. Last seen at shopping mall on Saturday afternoon.',
    status: 'investigating',
    category: 'missing vehicle',
    assigned_officer_id: '00000000-0000-0000-0000-000000000002',
  },
  {
    title: 'Counterfeit Currency Circulation',
    description:
      'Reports of counterfeit currency being circulated in Pettah area. Merchants advised to verify currency before accepting payments.',
    status: 'resolved',
    category: 'counterfeit',
    assigned_officer_id: '00000000-0000-0000-0000-000000000001',
  },
];

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

/**
 * Seed a table with data
 */
const seedTable = async (supabase, tableName, data) => {
  try {
    console.log(`\n📥 Seeding ${tableName}...`);

    // Insert data
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();

    if (error) {
      console.warn(`⚠️  Some records may already exist in ${tableName}: ${error.message}`);
      return 0;
    }

    console.log(`✓ Seeded ${tableName}: ${result.length} records inserted`);
    return result.length;
  } catch (error) {
    console.error(`❌ Error seeding ${tableName}:`, error.message);
    return 0;
  }
};

/**
 * Main seeding function
 */
export const seedDatabase = async () => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.error('❌ Supabase client not available');
      return false;
    }

    console.log('\n' + '='.repeat(70));
    console.log('🌱 Starting Database Seeding...');
    console.log('='.repeat(70));

    let totalRecords = 0;

    // Seed tables in dependency order
    totalRecords += await seedTable(supabase, 'users', seedUsers);
    totalRecords += await seedTable(supabase, 'drivers', seedDrivers);
    totalRecords += await seedTable(supabase, 'criminals', seedCriminals);
    totalRecords += await seedTable(supabase, 'fines', seedFines);
    totalRecords += await seedTable(supabase, 'warnings', seedWarnings);
    totalRecords += await seedTable(supabase, 'news', seedNews);
    totalRecords += await seedTable(supabase, 'tips', seedTips);

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Database seeding completed successfully!`);
    console.log(`📊 Total records inserted: ${totalRecords}`);
    console.log('='.repeat(70) + '\n');

    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    return false;
  }
};

/**
 * Clear all seed data (for testing/reset)
 */
export const clearSeedData = async () => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.error('❌ Supabase client not available');
      return false;
    }

    console.log('\n' + '='.repeat(70));
    console.log('🗑️  Clearing Seed Data...');
    console.log('='.repeat(70));

    // Delete in reverse dependency order
    const tables = [
      'auditlogs',
      'payments',
      'tips',
      'news',
      'warnings',
      'fines',
      'criminals',
      'drivers',
      'users',
    ];

    for (const table of tables) {
      try {
        const { data: records } = await supabase.from(table).select('id');
        if (records && records.length > 0) {
          const { error } = await supabase.from(table).delete().neq('id', '');
          if (error) {
            console.warn(`⚠️  Could not clear ${table}: ${error.message}`);
          } else {
            console.log(`✓ Cleared ${table}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Error clearing ${table}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Seed data cleared successfully!');
    console.log('='.repeat(70) + '\n');

    return true;
  } catch (error) {
    console.error('❌ Failed to clear seed data:', error.message);
    return false;
  }
};

export default seedDatabase;
