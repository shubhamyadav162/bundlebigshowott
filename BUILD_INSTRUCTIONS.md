# Building the Big Show OTT App

## Prerequisites
1. Node.js (v18+)
2. Expo CLI: `npm install -g expo-cli`
3. EAS CLI: `npm install -g eas-cli`
4. Expo account (sign up at https://expo.dev)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Install Required Expo Modules
```bash
npm run prepare-eas-build
# Or directly:
node scripts/prepare-eas-build.js
```

### 3. Login to Expo
```bash
eas login
```

## Building for Android

### Development Build
Creates a development build with the Expo Dev Client enabled for testing:
```bash
npm run build:development
# Or directly:
eas build --profile development --platform android
```

### Preview Build
Creates an internal distribution build for testing before release:
```bash
npm run build:preview
# Or directly:
eas build --profile preview --platform android
```

### Production Build
Creates a production build for store submission:
```bash
npm run build:production
# Or directly:
eas build --profile production --platform android
```

## Troubleshooting

### If you encounter build errors related to Gradle:

1. Make sure you have the correct NDK version:
   - Check that `android/local.properties` has the correct NDK path
   - The prepare-eas-build.js script should handle this automatically

2. Gradle plugin issues:
   - If expo-module-gradle-plugin is not found, run:
   ```bash
   npx expo install expo-module-core
   npm install --save-dev @expo/config-plugins
   ```

3. Missing compileSdkVersion:
   - This should be handled by our configuration, but verify in:
     - android/build.gradle
     - android/gradle.properties
     - app.json (via expo-build-properties plugin)

## Advanced Configuration

If you need to customize the build further:

1. Edit `eas.json` to modify build profiles
2. Edit `android/build.gradle` for Android project configuration
3. Edit `app.json` to modify Expo configuration

## Monitoring Builds

Monitor your builds on the EAS dashboard:
```bash
eas build:list
```

Or view them on the web at https://expo.dev 