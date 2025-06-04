/**
 * Smoke Test for OneBigShowOTT Subscription System in Production
 * 
 * This script performs essential smoke tests against the production environment:
 * 1. Verifies all Edge Functions return 200 status
 * 2. Checks subscription table RLS policies are working
 * 3. Validates webhook endpoints are accessible
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load production environment
if (fs.existsSync(path.resolve(process.cwd(), '.env.production'))) {
  dotenv.config({ path: '.env.production' });
  console.log('Loaded environment from .env.production');
} else {
  console.error('ERROR: .env.production file not found');
  process.exit(1);
}

// Configure Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error('ERROR: Required environment variables missing');
  console.error('Make sure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ANON_KEY are set in .env.production');
  process.exit(1);
}

// Initialize Supabase clients
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
const supabaseAnon = createClient(supabaseUrl, anonKey);

// Console colors
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m"
};

// Log helper function
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  let color;
  
  switch(type) {
    case 'success': color = colors.green; break;
    case 'error': color = colors.red; break;
    case 'warning': color = colors.yellow; break;
    case 'important': color = colors.magenta; break;
    default: color = colors.blue;
  }
  
  console.log(`${colors.gray}${timestamp}${colors.reset} ${color}${message}${colors.reset}`);
}

// Main test function
async function runSmokeTests() {
  log('🔴 PRODUCTION SMOKE TEST STARTING', 'important');
  log('--------------------------------------', 'important');
  
  const results = {
    functionEndpoints: true,
    rlsPolicies: true,
    webhookEndpoints: true
  };
  
  // Test 1: Check all function endpoints
  log('\n1. Testing Edge Function Endpoints', 'important');
  const functionEndpoints = [
    'initialize-payment',
    'confirm-subscription',
    'get-user-subscription',
    'cancel-subscription',
    'list-all-subscriptions'
  ];
  
  for (const endpoint of functionEndpoints) {
    try {
      const { data, error } = await supabaseAdmin.functions.invoke(endpoint, {
        body: { check: true }
      });
      
      if (error) {
        log(`❌ Function ${endpoint}: ${error.message}`, 'error');
        results.functionEndpoints = false;
      } else {
        log(`✅ Function ${endpoint} available`, 'success');
      }
    } catch (err) {
      log(`❌ Function ${endpoint} error: ${err.message}`, 'error');
      results.functionEndpoints = false;
    }
  }
  
  // Test 2: Check RLS policies with anonymous client
  log('\n2. Testing RLS Policies', 'important');
  try {
    // Try to read all subscriptions as anonymous - should be blocked by RLS
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('subscriptions')
      .select('*');
    
    if (anonError && anonError.code === 'PGRST301') {
      log('✅ RLS preventing anonymous access to all subscriptions', 'success');
    } else if (!anonError && anonData && anonData.length === 0) {
      log('✅ RLS correctly returning empty array for anonymous user', 'success');
    } else {
      log('❌ RLS may not be properly configured - anonymous access not blocked', 'error');
      results.rlsPolicies = false;
    }
    
    // Check admin access to all subscriptions
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('subscriptions')
      .select('*');
    
    if (!adminError) {
      log('✅ Admin access to subscriptions working', 'success');
    } else {
      log(`❌ Admin access error: ${adminError.message}`, 'error');
      results.rlsPolicies = false;
    }
  } catch (err) {
    log(`❌ RLS test error: ${err.message}`, 'error');
    results.rlsPolicies = false;
  }
  
  // Test 3: Check webhook endpoints are externally accessible
  log('\n3. Testing Webhook Endpoints', 'important');
  const webhookEndpoints = [
    'confirm-subscription'
  ];
  
  for (const endpoint of webhookEndpoints) {
    try {
      const url = `${supabaseUrl}/functions/v1/${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });
      
      // We expect 4xx responses since we don't have a valid signature
      // But this confirms the endpoint is accessible
      if (response.status !== 404) {
        log(`✅ Webhook ${endpoint} accessible (Status: ${response.status})`, 'success');
      } else {
        log(`❌ Webhook ${endpoint} not found (Status: ${response.status})`, 'error');
        results.webhookEndpoints = false;
      }
    } catch (err) {
      log(`❌ Webhook ${endpoint} error: ${err.message}`, 'error');
      results.webhookEndpoints = false;
    }
  }
  
  // Final Summary
  log('\n--------------------------------------', 'important');
  log('🔍 SMOKE TEST RESULTS:', 'important');
  log(`Function Endpoints: ${results.functionEndpoints ? '✅ PASS' : '❌ FAIL'}`, results.functionEndpoints ? 'success' : 'error');
  log(`RLS Policies: ${results.rlsPolicies ? '✅ PASS' : '❌ FAIL'}`, results.rlsPolicies ? 'success' : 'error');
  log(`Webhook Endpoints: ${results.webhookEndpoints ? '✅ PASS' : '❌ FAIL'}`, results.webhookEndpoints ? 'success' : 'error');
  
  const allPassed = Object.values(results).every(r => r === true);
  log(`\nOverall Result: ${allPassed ? '✅ PASS' : '❌ FAIL'}`, allPassed ? 'success' : 'error');
  
  if (!allPassed) {
    process.exit(1);
  }
}

// Run the tests
runSmokeTests()
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  }); 