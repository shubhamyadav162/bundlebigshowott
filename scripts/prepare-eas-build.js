#!/usr/bin/env node

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Filter out and ignore platform arguments which are passed by EAS
// This ensures they don't interfere with the script's functionality
if (process.argv.length > 2) {
  const filteredArgs = process.argv.slice(2).filter(arg => {
    return !arg.startsWith('--platform') && arg !== 'android' && arg !== 'ios';
  });
  
  if (filteredArgs.length > 0) {
    console.log(`${colors.yellow}Note: Using arguments: ${filteredArgs.join(' ')}${colors.reset}`);
  } else {
    console.log(`${colors.green}No additional arguments to process${colors.reset}`);
  }
  
  // Log any platform-related arguments that we're ignoring
  const platformArgs = process.argv.slice(2).filter(arg => {
    return arg.startsWith('--platform') || arg === 'android' || arg === 'ios';
  });
  
  if (platformArgs.length > 0) {
    console.log(`${colors.yellow}Ignoring platform arguments: ${platformArgs.join(' ')}${colors.reset}`);
  }
}

/**
 * prepare-eas-build.js
 * 
 * This script ensures all required dependencies are installed before an EAS build
 * It runs as part of the prebuildCommand in eas.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`${colors.cyan}Preparing EAS build environment...${colors.reset}`);

// Ensure TypeScript is properly installed
// console.log(`${colors.yellow}Ensuring TypeScript is properly installed...${colors.reset}`);
// try {
//   execSync('npm install typescript@5.8.3 --no-save', { stdio: 'inherit' });
//   console.log(`${colors.green}✓ TypeScript installed successfully${colors.reset}`);
// } catch (error) {
//   console.error(`${colors.red}Failed to install TypeScript: ${error.message}${colors.reset}`);
// }

// Ensure the scripts directory exists
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Check for required asset files
const requiredAssets = [
  { path: 'assets/logo_main.png', dest: 'assets/icon.png' },
  { path: 'assets/splash1.png', dest: 'assets/splash.png' },
  { path: 'assets/favicon.png', dest: 'assets/favicon.png' }
];

console.log(`${colors.yellow}Checking required asset files...${colors.reset}`);
requiredAssets.forEach(asset => {
  const srcPath = path.join(process.cwd(), asset.path);
  const destPath = path.join(process.cwd(), asset.dest);

  console.log(`Checking for ${asset.path}...`);

  if (fs.existsSync(srcPath)) {
    console.log(`${colors.green}✓ ${asset.path} exists${colors.reset}`);
    // Copy the file to the destination if they\'re different
    if (asset.path !== asset.dest) {
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`${colors.green}✓ Copied ${asset.path} to ${asset.dest}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}Failed to copy ${asset.path} to ${asset.dest}: ${error.message}${colors.reset}`);
        // Indicate a critical failure if a required copy fails
        process.exit(1);
      }
    }
  } else {
    console.error(`${colors.red}✗ ${asset.path} is missing!${colors.reset}`);
    // Try to find an alternative image
    const assetsDir = path.join(process.cwd(), 'assets');
    let fallbackUsed = false;
    try {
      const images = fs.readdirSync(assetsDir).filter(file =>
        file.endsWith('.png') || file.endsWith('.jpg')
      );

      if (images.length > 0) {
        const altImage = path.join(assetsDir, images[0]);
        fs.copyFileSync(altImage, destPath);
        console.log(`${colors.yellow}Used ${images[0]} as fallback for ${asset.dest}${colors.reset}`);
        fallbackUsed = true;
      }
    } catch (error) {
       console.error(`${colors.red}Error searching for or copying fallback asset: ${error.message}${colors.reset}`);
    }

    // If the destination file still doesn't exist after attempting source and fallback, exit
    if (!fs.existsSync(destPath)) {
      console.error(`${colors.red}Fatal: Could not find or create required asset ${asset.dest}${colors.reset}`);
      process.exit(1);
    }
  }
});

// Create or update the android/local.properties file if needed
const androidDir = path.join(process.cwd(), 'android');
if (fs.existsSync(androidDir)) {
  const localPropertiesPath = path.join(androidDir, 'local.properties');
  console.log(`${colors.yellow}Creating/updating android/local.properties file...${colors.reset}`);
  const ndkPath = process.env.ANDROID_NDK_HOME || '/home/expo/ndk/25.1.8937393';
  const content = `ndk.dir=${ndkPath.replace(/\\/g, '\\\\')}\n`;

  try {
    fs.writeFileSync(localPropertiesPath, content);
    console.log(`${colors.green}Successfully created local.properties file${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to create local.properties file: ${error.message}${colors.reset}`);
    // This might not be a fatal error depending on the build context, but worth logging
  }

  // Ensure gradle wrapper exists
  const gradleWrapperDir = path.join(androidDir, 'gradle', 'wrapper');
  if (!fs.existsSync(gradleWrapperDir)) {
    fs.mkdirSync(gradleWrapperDir, { recursive: true });

    // Create gradle-wrapper.properties
    const gradleWrapperPath = path.join(gradleWrapperDir, 'gradle-wrapper.properties');
    const wrapperContent = `distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.3-all.zip\nnetworkTimeout=10000\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists`;

    try {
      fs.writeFileSync(gradleWrapperPath, wrapperContent);
      console.log(`${colors.green}Created gradle wrapper properties file${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Failed to create gradle wrapper properties file: ${error.message}${colors.reset}`);
      // Also might not be fatal, but good to know
    }
  }
}

// // Optimize image assets
// console.log(colors.yellow + 'Optimizing image assets...' + colors.reset);
// try {
//   execSync('npx expo optimize', { stdio: 'inherit' });
//   console.log(colors.green + 'Image assets optimized successfully' + colors.reset);
// } catch (error) {
//   console.error(colors.red + 'Failed to optimize assets: ' + error.message + colors.reset);
//   // Optimization failure should not be fatal to the build
// }

console.log(colors.green + 'EAS build environment prepared successfully!' + colors.reset);
