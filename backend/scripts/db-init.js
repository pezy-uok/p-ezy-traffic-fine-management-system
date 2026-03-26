#!/usr/bin/env node

/**
 * Database Initialization & Verification Script
 * 
 * Usage:
 *   npm run db:setup      -- Install dependencies and configure
 *   npm run db:sync       -- Sync database schema
 *   npm run db:verify     -- Verify all tables exist
 *   npm run db:stats      -- Show database statistics
 */

import { initializeDatabase, syncDatabase, verifyTables, getDatabaseStats } from './src/config/database.js';

const command = process.argv[2] || 'setup';

const run = async () => {
  try {
    switch (command) {
      case 'setup':
      case 'init':
        console.log('🚀 Running full database initialization...\n');
        await initializeDatabase();
        break;

      case 'sync':
        console.log('🔄 Syncing database schema...\n');
        await initializeDatabase();
        break;

      case 'verify':
        console.log('📋 Verifying database tables...\n');
        await initializeDatabase();
        break;

      case 'stats':
        console.log('📊 Database Statistics...\n');
        const stats = await getDatabaseStats();
        console.log(JSON.stringify(stats, null, 2));
        break;

      default:
        console.log(`Unknown command: ${command}`);
        console.log('Available commands: setup, sync, verify, stats');
        process.exit(1);
    }

    console.log('✅ Command completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

run();
