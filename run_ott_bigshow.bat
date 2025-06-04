@echo off
echo Building Big Show OTT App

echo Installing dependencies...
call npm install --legacy-peer-deps

echo Preparing EAS build environment...
call node scripts/prepare-eas-build.js

echo Starting development build...
call npm run build:development

echo Done!
pause

rem Set Supabase credentials
set SUPABASE_URL=https://hjsdcsatfcysrwsryngu.supabase.co
set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3NDcxMDIwOTEsImV4cCI6MjA2MjY3ODA5MX0.X1m5n0q-bw4p7tetegdjq-uQoSVypPmrlko4_SZXjgw
set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEwMjA5MSwiZXhwIjoyMDYyNjc4MDkxfQ.BR-A3TEEErWOhUw8vHSy0jkToDsGGqNGCXiRwSpLrDk
set SUPABASE_DB_PASSWORD=Avanger@16143777
set SUPABASE_REGION=ap-south-1

rem Run Supabase MCP Server via Node CLI
npx @supabase/mcp-server-supabase@latest 