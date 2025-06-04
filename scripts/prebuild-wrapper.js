#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 EAS Prebuild Wrapper Starting');

// 1. Strip out "--platform" and its value from process.argv.
//    This prevents Node.js (when executed via `expo node`) from complaining about these flags.
const rawArgs = process.argv.slice(2); // e.g., ["--platform", "android"] or other args passed by EAS
let targetPlatform = null;
// const filteredArgs = []; // Not strictly needed as this script doesn't pass filtered args to its children

let i = 0;
while (i < rawArgs.length) {
  if (rawArgs[i] === "--platform") {
    if (i + 1 < rawArgs.length) {
      targetPlatform = rawArgs[i + 1];
      console.log(`ℹ️ Detected platform: ${targetPlatform} (passed to prebuild-wrapper.js by EAS Build)`);
      i++; // Increment to skip the platform value (e.g., "android")
    } else {
      // This case should ideally not happen with EAS Build's standard invocation.
      console.warn(`⚠️ Argument --platform found without a subsequent value.`);
    }
  } else {
    // Log any other arguments this script might receive.
    // For current logic, other arguments are not expected or used.
    // filteredArgs.push(rawArgs[i]); 
    console.log(`ℹ️ prebuild-wrapper.js received unexpected argument: ${rawArgs[i]}`);
  }
  i++;
}

if (targetPlatform) {
  console.log(`⚙️ prebuild-wrapper.js is now aware of platform: ${targetPlatform}. This information is logged but not used further in this script's direct logic.`);
} else {
  console.log(`⚙️ prebuild-wrapper.js did not receive a --platform argument, or it was malformed.`);
}

// The old console.log('⚠️ Ignoring any additional arguments passed by EAS'); is now replaced by the actual parsing logic above.

try {
  // Install dependencies (including dev dependencies)
  console.log('📦 Installing dependencies (npm install)...');
  execSync('npm install', { stdio: 'inherit' });

  // Run the prepare-eas-build.js script
  // This script is invoked with plain 'node' and handles its own arguments if necessary.
  // It does not inherit --platform from this wrapper's process.argv because execSync spawns a new process.
  console.log('🛠️ Running prepare-eas-build.js script...');
  execSync('node scripts/prepare-eas-build.js', { stdio: 'inherit' });

  console.log('✅ prebuild-wrapper.js completed successfully');
  process.exit(0); // Explicitly exit with success code
} catch (error) {
  console.error('❌ Prebuild failed within prebuild-wrapper.js execution:');
  console.error('Error Message:', error.message);
  if (error.stdout) {
    console.error("Stdout from failed command:\n", error.stdout.toString());
  }
  if (error.stderr) {
    console.error("Stderr from failed command:\n", error.stderr.toString());
  }
  if (error.stack) {
    console.error("Stack trace:\n", error.stack);
  }
  process.exit(1); // Explicitly exit with failure code
} 