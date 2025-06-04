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