#!/bin/sh
set -e

echo "⏳ Installing all dependencies (including devDependencies)..."
npm install

echo "⏳ Running prepare-eas-build.js..."
node scripts/prepare-eas-build.js

echo "✅ Prebuild script completed." 