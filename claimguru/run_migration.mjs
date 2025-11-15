import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

console.log('✓ Supabase URL:', supabaseUrl);
console.log('✓ Connecting...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
const { data: testData, error: testError } = await supabase.from('claims').select('count').limit(1);
if (testError) {
  console.error('Connection test failed:', testError.message);
  process.exit(1);
}
console.log('✓ Connection successful\n');

// Read migration file
const migration = readFileSync('./supabase/migrations/1763132166_create_communication_system.sql', 'utf8');
console.log('✓ Migration file loaded:', migration.length, 'bytes\n');

// Split migration into individual statements (simple split by semicolon)
const statements = migration
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log('✓ Found', statements.length, 'SQL statements\n');
console.log('Executing migration...\n');

let successCount = 0;
let failureCount = 0;

for (let i = 0; i < Math.min(5, statements.length); i++) {
  const stmt = statements[i] + ';';
  console.log(`[${i+1}/${statements.length}]`, stmt.substring(0, 80) + '...');
  
  const { error } = await supabase.rpc('exec_sql', { sql: stmt });
  
  if (error) {
    console.error('  ✗ Failed:', error.message);
    failureCount++;
  } else {
    console.log('  ✓ Success');
    successCount++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('Migration Summary:');
console.log('  Success:', successCount);
console.log('  Failures:', failureCount);
console.log('='.repeat(60));

if (failureCount > 0) {
  console.log('\n⚠️  Note: Some statements may require direct database access via Supabase Dashboard');
  console.log('   → Go to: https://supabase.com/dashboard/project/ttnjqxemkbugwsofacxs/sql');
  console.log('   → Copy the migration file and execute there');
}
