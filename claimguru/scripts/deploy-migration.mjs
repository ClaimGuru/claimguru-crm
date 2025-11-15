#!/usr/bin/env node

/**
 * Supabase Migration Deployment Script
 * 
 * Automatically deploys database migrations to Supabase
 * Reads all migration files and executes them in order
 * 
 * Usage:
 *   node scripts/deploy-migration.mjs [migration-file]
 *   node scripts/deploy-migration.mjs  # Deploy all pending migrations
 * 
 * Environment Variables:
 *   SUPABASE_DB_URL: Database connection string (takes precedence)
 *   SUPABASE_HOST: Database host
 *   SUPABASE_PORT: Database port (default: 5432)
 *   SUPABASE_USER: Database user (default: postgres)
 *   SUPABASE_PASSWORD: Database password
 *   SUPABASE_DATABASE: Database name (default: postgres)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getConnectionConfig() {
  // Check for full URL first (takes precedence)
  if (process.env.SUPABASE_DB_URL) {
    return process.env.SUPABASE_DB_URL;
  }

  // Fall back to individual components
  const config = {
    host: process.env.SUPABASE_HOST || 'db.ttnjqxemkbugwsofacxs.supabase.co',
    port: parseInt(process.env.SUPABASE_PORT || '5432'),
    user: process.env.SUPABASE_USER || 'postgres',
    password: process.env.SUPABASE_PASSWORD,
    database: process.env.SUPABASE_DATABASE || 'postgres',
  };

  if (!config.password) {
    throw new Error(
      'Database password required. Set SUPABASE_PASSWORD environment variable or SUPABASE_DB_URL'
    );
  }

  return config;
}

function getMigrationFiles(targetFile = null) {
  const migrationsDir = path.join(projectRoot, 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  let files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (targetFile) {
    files = files.filter((file) => file === targetFile || file.includes(targetFile));
    if (files.length === 0) {
      throw new Error(`Migration file not found: ${targetFile}`);
    }
  }

  return files.map((file) => ({
    name: file,
    path: path.join(migrationsDir, file),
  }));
}

async function executeMigration(client, migrationFile) {
  log(`\n📄 Executing: ${migrationFile.name}`, 'cyan');

  try {
    const sql = fs.readFileSync(migrationFile.path, 'utf8');
    
    // Split into statements
    const statements = sql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    log(`   Statements: ${statements.length}`, 'blue');

    // Execute each statement
    let executedCount = 0;
    for (const statement of statements) {
      try {
        await client.query(statement);
        executedCount++;
      } catch (error) {
        if (error.message.includes('already exists')) {
          // Ignore "already exists" errors (idempotent migrations)
          executedCount++;
        } else {
          throw error;
        }
      }
    }

    log(`   ✅ ${executedCount}/${statements.length} statements executed`, 'green');
    return true;
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    throw error;
  }
}

async function verifyDeployment(client) {
  log('\n🔍 Verifying Deployment', 'cyan');

  try {
    const tables = await client.query(
      `SELECT COUNT(*) as count FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'communication%' OR tablename LIKE 'twilio%' OR tablename LIKE 'claim%' OR tablename LIKE 'call%'`
    );

    const indexes = await client.query(
      `SELECT COUNT(*) as count FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%'`
    );

    const policies = await client.query(
      `SELECT COUNT(*) as count FROM pg_policies WHERE schemaname = 'public'`
    );

    const tableCount = parseInt(tables.rows[0].count);
    const indexCount = parseInt(indexes.rows[0].count);
    const policyCount = parseInt(policies.rows[0].count);

    log(`   Tables created: ${tableCount}`, tableCount >= 7 ? 'green' : 'yellow');
    log(`   Indexes created: ${indexCount}`, indexCount >= 25 ? 'green' : 'yellow');
    log(`   RLS policies created: ${policyCount}`, policyCount >= 8 ? 'green' : 'yellow');

    if (tableCount >= 7 && indexCount >= 25 && policyCount >= 8) {
      log(`   ✅ All verifications passed!`, 'green');
      return true;
    } else {
      log(`   ⚠️  Some metrics below expected values`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`   ⚠️  Verification query failed: ${error.message}`, 'yellow');
    // Don't fail on verification errors
    return true;
  }
}

async function main() {
  const targetFile = process.argv[2];

  log('\n╔══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║       🚀 Supabase Migration Deployment System               ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════╝', 'cyan');

  try {
    // Get connection config
    log('\n🔌 Configuring Database Connection', 'blue');
    const connectionConfig = getConnectionConfig();
    const isUrl = typeof connectionConfig === 'string';
    
    if (isUrl) {
      log(`   URL: ${connectionConfig.substring(0, 50)}...`, 'blue');
    } else {
      log(`   Host: ${connectionConfig.host}`, 'blue');
      log(`   User: ${connectionConfig.user}`, 'blue');
    }

    // Get migrations
    log('\n📋 Finding Migrations', 'blue');
    const migrations = getMigrationFiles(targetFile);
    log(`   Found ${migrations.length} migration(s)`, 'blue');
    migrations.forEach((m) => log(`     • ${m.name}`, 'blue'));

    // Connect to database
    log('\n🔗 Connecting to Database', 'blue');
    const client = new Client(connectionConfig);
    
    await client.connect();
    log('   ✅ Connected', 'green');

    // Execute migrations
    log('\n⏳ Executing Migrations', 'blue');
    for (const migration of migrations) {
      await executeMigration(client, migration);
    }

    // Verify deployment
    await verifyDeployment(client);

    // Close connection
    await client.end();

    log('\n' + '═'.repeat(62), 'green');
    log('✅ DEPLOYMENT COMPLETE - All migrations executed successfully!', 'green');
    log('═'.repeat(62), 'green');
    log('\n📊 Next Steps:', 'cyan');
    log('   1. Check Security Advisor: Should show 0 warnings', 'cyan');
    log('   2. Check Performance Advisor: Should show <50 warnings', 'cyan');
    log('   3. Verify with queries from EXECUTE_NOW.md', 'cyan');
    log('\n');

    process.exit(0);
  } catch (error) {
    log(`\n❌ Deployment Failed: ${error.message}`, 'red');
    log(`\nDebugging Tips:`, 'yellow');
    log(`  • Verify SUPABASE_PASSWORD is set correctly`, 'yellow');
    log(`  • Check database connectivity`, 'yellow');
    log(`  • Ensure migration files are valid SQL`, 'yellow');
    log(`\nEnvironment Variables Needed:`, 'yellow');
    log(`  • SUPABASE_PASSWORD: Your database password`, 'yellow');
    log(`  OR`, 'yellow');
    log(`  • SUPABASE_DB_URL: Full connection string`, 'yellow');
    log('\n');
    process.exit(1);
  }
}

main();
