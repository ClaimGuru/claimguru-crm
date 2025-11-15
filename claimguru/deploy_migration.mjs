import https from 'https';
import fs from 'fs';

const SUPABASE_URL = 'https://ttnjqxemkbugwsofacxs.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmpxeGVta2J1Z3dzb2ZhY3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA4NjU4OSwiZXhwIjoyMDY3NjYyNTg5fQ.86UQQpfZoHUkhyei7Qe6AaR6KgVv2lptGDBR3qfpZT8';

function executeSQLDirect(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      query: sql
    });

    const options = {
      hostname: 'ttnjqxemkbugwsofacxs.supabase.co',
      port: 443,
      path: '/rest/v1/query',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
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
          reject({status: res.statusCode, data, headers: res.headers});
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function deployMigration() {
  console.log('🚀 Deploying comprehensive Security & Performance Advisor fixes...\n');

  try {
    const migrationFile = 'supabase/migrations/1763132168_comprehensive_security_and_performance_fixes.sql';
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log(`📄 Migration file: ${migrationFile}`);
    console.log(`📊 Size: ${(sql.length / 1024).toFixed(1)} KB`);
    console.log(`📝 Statements: ${sql.split(';').filter(s => s.trim()).length}`);
    
    console.log('\n⏳ This will execute 12 sections:');
    console.log('  1. Create missing communication tables');
    console.log('  2. Add update triggers');
    console.log('  3. Enable RLS');
    console.log('  4. Create RLS policies');
    console.log('  5. Analyze tables for statistics');
    console.log('  6. Add extended statistics');
    console.log('  7. Create optimization indexes');
    console.log('  8. Create materialized views');
    console.log('  9. Optimize existing tables');
    console.log('  10. Configure database grants');
    console.log('  11. Full VACUUM ANALYZE');
    console.log('  12. Final comments and documentation\n');

    console.log('📋 Executing migration...\n');

    const result = await executeSQLDirect(sql);
    
    console.log('✅ Migration executed successfully!');
    console.log('Response:', result.data.substring(0, 200));

  } catch (error) {
    console.error('❌ Migration failed:');
    console.error('Status:', error.status);
    console.error('Data:', error.data);
    console.error('Headers:', error.headers);
    process.exit(1);
  }
}

deployMigration();
