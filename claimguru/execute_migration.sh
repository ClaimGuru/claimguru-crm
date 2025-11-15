#!/bin/bash

SUPABASE_URL="https://ttnjqxemkbugwsofacxs.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmpxeGVta2J1Z3dzb2ZhY3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA4NjU4OSwiZXhwIjoyMDY3NjYyNTg5fQ.86UQQpfZoHUkhyei7Qe6AaR6KgVv2lptGDBR3qfpZT8"
DB_PASSWORD="BestLyfe#0616"

echo "🚀 Attempting Direct Migration Execution"
echo ""
echo "Testing Supabase API endpoints..."
echo ""

# Try to check if there's a SQL execution endpoint
curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"sql":"SELECT 1"}' | head -20

