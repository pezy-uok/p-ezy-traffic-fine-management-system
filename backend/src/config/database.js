import { Sequelize, DataTypes } from 'sequelize';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// Handle ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically load models using ES imports
const loadModelDynamic = async (modelFileName) => {
  try {
    const modelPath = new URL(`../models/${modelFileName}`, import.meta.url)
      .href;
    const modelModule = await import(modelPath);
    return modelModule.default;
  } catch (error) {
    console.error(`Failed to load model from ${modelFileName}:`, error.message);
    throw error;
  }
};

let sequelize = null;
let supabase = null;
const db = {};

// ========== SEQUELIZE INITIALIZATION ==========

/**
 * Initialize Sequelize ORM with PostgreSQL (Supabase or Local)
 * When using Supabase, REST API will be used instead of direct connection
 */
const initializeSequelize = async () => {
  try {
    if (sequelize) {
      return sequelize; // Already initialized
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const useSupabase = supabaseUrl ? true : false;

    // If using Supabase, skip direct database connection
    // Use REST API instead via supabaseClient.js
    if (useSupabase) {
      console.log(
        '📡 Supabase mode detected - using REST API for database operations'
      );
      console.log(
        '💡 Models loaded for reference, but database operations use REST API'
      );
      // Don't initialize Sequelize, use REST API instead
      sequelize = null;
    } else {
      // Local development mode - use Sequelize
      const dbName = process.env.DB_NAME || 'pezy_db';
      const dbUser = process.env.DB_USER || 'postgres';
      const dbPassword = process.env.DB_PASSWORD || 'postgres';
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = parseInt(process.env.DB_PORT) || 5432;

      console.log(
        `📡 Connecting to Local PostgreSQL: ${dbUser}@${dbHost}:${dbPort}/${dbName}`
      );

      const dialectOptions = {
        connectTimeout: 5000,
      };

      sequelize = new Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'postgres',
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        dialectOptions: dialectOptions,
      });

      // Test connection
      try {
        await sequelize.authenticate();
        console.log('✓ Sequelize connected to PostgreSQL successfully');
      } catch (authError) {
        console.warn(
          `⚠️  Could not authenticate to database: ${authError.message}`
        );
        console.warn('⚠️  Continuing without database connection...\n');
      }
    }

    // Load all models dynamically (for reference/documentation purposes)
    const modelFiles = [
      'User.js',
      'Criminal.js',
      'Driver.js',
      'Fine.js',
      'Warning.js',
      'Payment.js',
      'AuditLog.js',
      'News.js',
      'Tip.js',
    ];

    // Only load models if using local Sequelize
    if (sequelize) {
      for (const file of modelFiles) {
        try {
          const modelFactory = await loadModelDynamic(file);
          const modelName = file.replace('.js', '');
          const model = modelFactory(sequelize, DataTypes);
          db[modelName] = model;
          console.log(`✓ Loaded model: ${modelName}`);
        } catch (error) {
          console.error(`❌ Error loading model ${file}:`, error.message);
          throw error;
        }
      }

      db.sequelize = sequelize;
      db.Sequelize = Sequelize;

      // Set up associations
      Object.keys(db).forEach((modelName) => {
        if (modelName !== 'sequelize' && modelName !== 'Sequelize') {
          const model = db[modelName];
          if (model.associate) {
            model.associate(db);
            console.log(`✓ Associated model: ${modelName}`);
          }
        }
      });

      console.log('✓ All model associations established');
    }

    return sequelize;
  } catch (error) {
    console.error('❌ Failed to initialize Sequelize:', error.message);
    throw error;
  }
};

/**
 * Synchronize database schema
 * @param {Object} options - Sequelize sync options
 */
const syncDatabase = async (options = {}) => {
  try {
    // Skip sync for Supabase REST API mode
    if (!sequelize) {
      console.log(
        '🔄 Supabase REST API mode - database schema managed via web console'
      );
      return true;
    }

    const defaultOptions = {
      alter: true, // Modify tables if needed (safer than dropping)
      logging: false,
    };

    const syncOptions = { ...defaultOptions, ...options };

    console.log('🔄 Syncing database schema...');
    await sequelize.sync(syncOptions);
    console.log('✓ Database schema synchronized successfully');

    return true;
  } catch (error) {
    console.error('❌ Failed to sync database:', error.message);
    throw error;
  }
};

/**
 * Verify all tables exist
 */
const verifyTables = async () => {
  try {
    if (!sequelize) {
      console.log(
        '\n✓ Supabase REST API mode - tables managed via web console'
      );
      return true;
    }

    console.log('\n📋 Verifying database tables...');

    const tableNames = [
      'Users',
      'Criminals',
      'Drivers',
      'Fines',
      'Warnings',
      'Payments',
      'AuditLogs',
      'News',
      'Tips',
    ];

    const results = [];
    let allExist = true;

    for (const tableName of tableNames) {
      try {
        // Query information_schema to verify table exists
        const [tableExists] = await sequelize.query(`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables 
            WHERE table_name = '${tableName.toLowerCase()}'
          )
        `);

        if (tableExists[0].exists) {
          const [countResult] = await sequelize.query(
            `SELECT COUNT(*) as count FROM "${tableName}"`
          );
          const count = countResult[0].count;
          results.push({
            table: tableName,
            status: '✓ EXISTS',
            records: count,
          });
        } else {
          results.push({
            table: tableName,
            status: '❌ MISSING',
            records: 0,
          });
          allExist = false;
        }
      } catch (error) {
        results.push({
          table: tableName,
          status: '❌ ERROR',
          error: error.message,
        });
        allExist = false;
      }
    }

    // Display results
    console.log('\n📊 Table Verification Results:');
    console.log('═'.repeat(70));
    results.forEach((result) => {
      const statusStr = result.status.includes('EXISTS')
        ? `${result.status}   Records: ${result.records}`
        : result.status;
      console.log(`  ${result.table.padEnd(20)} | ${statusStr.padEnd(40)} |`);
    });
    console.log('═'.repeat(70));

    const summary = results.reduce(
      (acc, r) => {
        if (r.status.includes('EXISTS')) acc.exists++;
        else acc.missing++;
        return acc;
      },
      { exists: 0, missing: 0 }
    );

    console.log(
      `\n✅ Summary: ${summary.exists}/${tableNames.length} tables created\n`
    );

    return allExist;
  } catch (error) {
    console.error('❌ Error verifying tables:', error.message);
    throw error;
  }
};

/**
 * Get database statistics
 */
const getDatabaseStats = async () => {
  try {
    if (!sequelize) {
      throw new Error('Sequelize not initialized.');
    }

    const stats = {
      connected: true,
      host: sequelize.options.host,
      database: sequelize.options.database,
      dialect: sequelize.options.dialect,
      models: Object.keys(db).filter(
        (key) => key !== 'sequelize' && key !== 'Sequelize'
      ),
      tablesCount: Object.keys(db).filter(
        (key) => key !== 'sequelize' && key !== 'Sequelize'
      ).length,
      timestamp: new Date().toISOString(),
    };

    return stats;
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
};

// ========== SUPABASE INITIALIZATION ==========

let supabaseClient = null;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn(
        '⚠️  Missing SUPABASE_URL or SUPABASE_ANON_KEY - Supabase client disabled'
      );
      return null;
    }

    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });
  }
  return supabaseClient;
};

// ========== MAIN INITIALIZATION ==========

/**
 * Initialize entire database (Sequelize + optional Supabase)
 */
const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database...\n');

    // Initialize Sequelize
    await initializeSequelize();

    // Sync database schema (optional - skip if connection failed)
    try {
      await syncDatabase();
    } catch (syncError) {
      console.warn(`⚠️  Could not sync database: ${syncError.message}`);
    }

    // Verify tables (optional - skip if connection failed)
    try {
      await verifyTables();
    } catch (verifyError) {
      console.warn(`⚠️  Could not verify tables: ${verifyError.message}`);
    }

    // Initialize Supabase (optional)
    const supabaseClient = getSupabaseClient();
    if (supabaseClient) {
      console.log('\n✓ Supabase client initialized');
    }

    console.log('\n✅ Server initialized!\n');
    return db;
  } catch (error) {
    console.error('\n⚠️  Database initialization warning:', error.message);
    console.warn(
      '⚠️  Server starting in limited mode. Database features will be unavailable.\n'
    );
    return db; // Return db even if initialization failed
  }
};

export {
  db,
  sequelize,
  initializeDatabase,
  initializeSequelize,
  syncDatabase,
  verifyTables,
  getDatabaseStats,
  getSupabaseClient,
};
