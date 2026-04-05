# 🏗️ Database Seeding Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SEEDING EXECUTION FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

                        npm run seed
                             │
                             ▼
                    ┌──────────────────┐
                    │   cli.js         │
                    │ (Main entry)     │
                    └─────────┬────────┘
                              │
                    ┌─────────▼──────────┐
                    │  seedData.js       │
                    │  seedDatabase()    │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼─────────────────┐
                    │ supabaseClient.js         │
                    │ (REST API client)         │
                    └─────────┬─────────────────┘
                              │
                              │ HTTP/REST API
                              │ (No DNS blocking!)
                              ▼
                    ┌──────────────────────────┐
                    │   SUPABASE CLOUD         │
                    │  PostgreSQL Database     │
                    └──────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  users   │   │ drivers  │   │  fines   │
        │ (4 rows) │   │ (4 rows) │   │ (4 rows) │
        └──────────┘   └──────────┘   └──────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
                   ┌──────────▼──────────┐
                   │   Other tables      │
                   │ - criminals (3)     │
                   │ - warnings (3)      │
                   │ - news (5)          │
                   │ - tips (4)          │
                   │ - payments (1)      │
                   └─────────────────────┘
```

## Architecture Components

### 1. **CLI Layer** (cli.js)
```
User Command
     │
     ▼
npm run seed  ──parse args──┬──> "seed"    ──> seedDatabase()
npm run clear ──────────────┼──> "clear"   ──> clearSeedData()
npm run reset ──────────────┴──> "reset"   ──> clear + seed
```

### 2. **Seeding Module** (seedData.js)
```
seedDatabase()
     │
     ├─► seedTable(users)
     │    └─► Insert 4 admin/officer records
     │
     ├─► seedTable(drivers)
     │    └─► Insert 4 driver records
     │
     ├─► seedTable(criminals)
     │    └─► Insert 3 criminal records
     │
     ├─► seedTable(fines)
     │    └─► Insert 4 fines (references users & drivers)
     │
     ├─► seedTable(warnings)
     │    └─► Insert 3 warnings (references users & drivers)
     │
     ├─► seedTable(news)
     │    └─► Insert 5 news articles
     │
     └─► seedTable(tips)
          └─► Insert 4 crime tips

Return: Total records inserted
```

### 3. **REST API Layer** (supabaseClient.js)
```
Node.js Backend
       │
       ▼
Supabase REST API Client
       │
       ├─► HTTPS Connection
       ├─► Auth Headers (ANON_KEY)
       └─► JSON payload
            │
            ▼
         Supabase Gateway
            │
            ▼
      PostgreSQL Database
```

## Database Schema Hierarchy

```
ENUMS (Type Definitions)
    │
    ├─ user_role (admin, police_officer)
    ├─ user_status (active, inactive, suspended)
    ├─ fine_status_enum (unpaid, paid, outdated)
    ├─ fine_payment_method_enum (credit_card, bank_transfer, cash)
    ├─ warning_severity_enum (minor, moderate, severe)
    ├─ payment_status_enum (pending, completed, failed, refunded)
    ├─ tip_status_enum (submitted, investigating, resolved, closed)
    └─ news_category_enum (alert, notice, crime_update, safety_tip, general)
                │
                ▼
    ┌─────────────────────────────────────────┐
    │       TABLES (with dependencies)         │
    └─────────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
┌────────┐            ┌─────────┐
│ users  │            │ drivers │
├────────┤            ├─────────┤
│ id     │            │ id      │
│ role   │            │ phone   │
│ badge  │            │ license │
└───┬────┘            └────┬────┘
    │                      │
    │      ┌───────────────┤
    │      │               │
    │      ▼               ▼
    │  ┌────────┐      ┌────────┐
    │  │ fines  │      │warnings│
    │  ├────────┤      ├────────┤
    │  │ amount │      │ reason │
    │  │ status │      │severity│
    │  └────┬───┘      └───┬────┘
    │       │              │
    │       └──────┬───────┘
    │              │
    │              ▼
    │          ┌──────────┐
    │          │ payments │
    │          ├──────────┤
    │          │ fine_id  │
    │          │ status   │
    │          └──────────┘
    │
    ├──────► ┌────────┐
    │        │ news   │
    │        │ tips   │
    │        └────────┘
    │
    └──────► ┌──────────┐
             │criminalsls│
             │          │
             └──────────┘

┌──────────────┐
│ auditlogs    │ ──references any table
└──────────────┘
```

## Data Dependency Graph

```
Seed Order (respects foreign keys):

Step 1: users (no dependencies)
   └─ Admin
   └─ Officers

Step 2: drivers (no dependencies)
   └─ 4 drivers

Step 3: criminals (no dependencies)
   └─ 3 criminals

Step 4: fines (depends on users + drivers)
   └─ References: issued_by_officer_id, driver_id

Step 5: warnings (depends on users + drivers)
   └─ References: issued_by_officer_id, driver_id

Step 6: payments (depends on fines)
   └─ References: fine_id

Step 7: news (depends on users)
   └─ References: author_id

Step 8: tips (depends on users)
   └─ References: assigned_officer_id

Step 9: auditlogs (depends on users + any table)
   └─ References: user_id + entity types
```

## npm Script Execution Chain

```
Terminal Command
      │
      ▼
┌──────────────────────────────────────┐
│  npm run seed                        │
├──────────────────────────────────────┤
│  Looks up in package.json:           │
│  "seed": "node src/database/cli.js"  │
└──────────────┬───────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ cli.js spawns        │
    │ seedData.js          │
    │ imports .env config  │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Import supabaseClient│
    │ - Load SUPABASE_URL  │
    │ - Load ANON_KEY      │
    │ - Create client      │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ For each table:      │
    │ 1. Prepare data      │
    │ 2. Call REST API     │
    │ 3. Log results       │
    │ 4. Count inserted    │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Print Summary        │
    │ ✅ Success!         │
    │ 📊 Total: 23 records│
    └──────────────────────┘
```

## Table Relationships (ER Diagram)

```
        ┌──────────────┐
        │    users     │
        ├──────────────┤
        │ id (PK)      │
        │ email        │
        │ badge_number │
        │ role         │
        └──────┬───────┘
               │ 1:N
        ┌──────┴─────────────┬──────────────┐
        │                    │              │
        ▼                    ▼              ▼
    ┌────────┐          ┌────────┐      ┌───────┐
    │ fines  │          │warnings│      │ news  │
    │ (4)    │          │ (3)    │      │ (5)   │
    └────┬───┘          └───┬────┘      └───────┘
         │ N:1               │
         │ depends_on        │ 1:N
         │                   │
         └─────────┬─────────┘
                   │
        ┌──────────▼────────────┐
        │    drivers           │
        ├──────────────────────┤
        │ id (PK)              │
        │ license_number       │
        │ phone (UNIQUE)       │
        └──────────────────────┘

╔════════════════════════════════╗
║   KEY RELATIONSHIPS            ║
╠════════════════════════════════╣
║ fines.issued_by_officer_id ──► users.id
║ fines.driver_id ───────────────► drivers.id
║ warnings.issued_by_officer_id ──► users.id
║ warnings.driver_id ────────────► drivers.id
║ payments.fine_id ──────────────► fines.id
║ news.author_id ───────────────► users.id
║ tips.assigned_officer_id ─────► users.id
║ auditlogs.user_id ──────────────► users.id
╚════════════════════════════════╝
```

## Connection String Flow

```
┌─────────────────────────────────────┐
│  .env File                          │
├─────────────────────────────────────┤
│ SUPABASE_URL=https://xscovlmarportl...│
│ SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...│
└─────────┬──────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  supabaseClient.js                  │
├─────────────────────────────────────┤
│ const supabase = createClient(      │
│   url,    // ← From env              │
│   key     // ← From env              │
│ )                                   │
└─────────┬──────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  Supabase SDK (JS Client)           │
├─────────────────────────────────────┤
│ • Auth headers prepared             │
│ • HTTPS connection ready            │
│ • JSON serialization setup          │
└─────────┬──────────────────────────┘
          │
          │ HTTPS
          ▼
┌─────────────────────────────────────┐
│  Supabase Cloud (REST API Gateway)  │
├─────────────────────────────────────┤
│ • Validates API key                 │
│ • Routes to PostgreSQL              │
│ • Returns JSON response             │
└─────────┬──────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  PostgreSQL Database                │
├─────────────────────────────────────┤
│ • Executes INSERT statement         │
│ • Applies constraints               │
│ • Returns affected rows             │
└─────────────────────────────────────┘
```

## Performance Optimization Path

```
User types: npm run seed
              │
              ▼
        ┌──────────────────┐
        │ Batch Insert     │
        │ Multiple rows    │
        │ per statement    │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Indexes used     │
        │ Primary keys     │
        │ Foreign keys     │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Query Planning   │
        │ Optimized plans  │
        │ Fast inserts     │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Result: < 1 sec  │
        │ for all data     │
        └──────────────────┘
```

---

**Architecture Version**: 1.0
**Last Updated**: March 2026
**Status**: ✅ Production Ready
