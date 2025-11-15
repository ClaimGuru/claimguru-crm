const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://ttnjqxemkbugwsofacxs.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmpxeGVta2J1Z3dzb2ZhY3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA4NjU4OSwiZXhwIjoyMDY3NjYyNTg5fQ.86UQQpfZoHUkhyei7Qe6AaR6KgVv2lptGDBR3qfpZT8';

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ttnjqxemkbugwsofacxs.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({status: res.statusCode, data});
        } else {
          reject({status: res.statusCode, data});
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({sql}));
    req.end();
  });
}

async function deployMigration() {
  console.log('🚀 Deploying comprehensive Security & Performance Advisor fixes...\n');

  try {
    // Read the migration file
    const migrationFile = 'supabase/migrations/1763132168_comprehensive_security_and_performance_fixes.sql';
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log(`📄 Migration file: ${migrationFile}`);
    console.log(`📊 Size: ${(sql.length / 1024).toFixed(1)} KB`);
    console.log(`📝 Lines: ${sql.split('\n').length}`);
    console.log('\n📋 Executing migration...\n');

    // Execute the migration
    const result = await executeSQL(sql);
    
    console.log('✅ Migration executed successfully!');
    console.log('\n📊 Result:');
    console.log(result.data);

  } catch (error) {
    console.error('❌ Migration failed:', error.data || error.message);
    process.exit(1);
  }
}

deployMigration();
