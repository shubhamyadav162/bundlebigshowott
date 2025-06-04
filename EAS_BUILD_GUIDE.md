# EAS Build Guide for Big Show OTT

## Overview
This guide outlines the steps to successfully build the Big Show OTT application using EAS (Expo Application Services).

## Prerequisites
- Expo CLI installed: `npm install -g expo-cli`
- EAS CLI installed: `npm install -g eas-cli`
- Logged in to Expo account: `eas login`

## Build Types

### Development Build
```bash
eas build --profile development --platform android
```
This creates a development build with the Expo Dev Client enabled for testing.

### Preview Build
```bash
eas build --profile preview --platform android
```
This creates an internal distribution build for testing before release.

### Production Build
```bash
eas build --profile production --platform android
```
This creates a production build for store submission.

## Troubleshooting Common Issues

### Missing Dependencies
If you encounter missing module errors, run:
```bash
npx expo install expo-module-core
npm install --save-dev @expo/config-plugins
```

### Gradle Build Failures
If Gradle build fails:
1. Check that the Android SDK is properly configured
2. Ensure all dependencies are properly installed
3. Verify that the build environment has the correct NDK version

### Environment Setup
The build environment should have:
- JDK 11
- NDK version compatible with the project
- Proper environment variables set

## Project Structure Notes
- The Android build configuration is in `android/build.gradle` and `android/app/build.gradle`
- EAS build profiles are defined in `eas.json`
- Expo plugins and configuration are in `app.json`

## Important Files
- `android/build.gradle` - Main Android project configuration
- `android/app/build.gradle` - Application-specific build settings
- `android/settings.gradle` - Project structure and module imports
- `eas.json` - EAS build profiles and settings
- `app.json` - Expo configuration 