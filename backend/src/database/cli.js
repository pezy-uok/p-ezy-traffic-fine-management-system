#!/usr/bin/env node

/**
 * Database Seeding CLI
 * Run with: node src/database/cli.js [command]
 * Commands:
 *   seed    - Seed database with mock data
 *   clear   - Clear all seed data
 *   reset   - Clear and re-seed
 */

import dotenv from 'dotenv';
import { seedDatabase, clearSeedData } from './seedData.js';

dotenv.config();

const command = process.argv[2] || 'seed';

const run = async () => {
  try {
    switch (command.toLowerCase()) {
      case 'seed':
        await seedDatabase();
        process.exit(0);
        break;

      case 'clear':
        await clearSeedData();
        process.exit(0);
        break;

      case 'reset':
        console.log('🔄 Resetting database...\n');
        await clearSeedData();
        await seedDatabase();
        process.exit(0);
        break;

      default:
        console.log(`
📚 Database Seeding CLI

Usage:
  node src/database/cli.js [command]

Commands:
  seed      Seed database with mock data (default)
  clear     Clear all seed data
  reset     Clear and re-seed

Examples:
  npm run seed          # Seed database
  npm run seed:clear    # Clear seed data
  npm run seed:reset    # Reset database

Environment:
  SUPABASE_URL          ${process.env.SUPABASE_URL ? '✓ Set' : '✗ Not set'}
  SUPABASE_ANON_KEY     ${process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'}
        `);
        process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

run();
