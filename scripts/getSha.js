const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

// Path to the default Android debug keystore
const keystorePath = path.join(os.homedir(), '.android', 'debug.keystore');

try {
  // Run keytool to list the certificate details
  const cmd = `keytool -list -v -keystore "${keystorePath}" -alias androiddebugkey -storepass android -keypass android`;
  const out = execSync(cmd, { stdio: 'pipe' }).toString();
  // Extract the SHA1 fingerprint
  const match = out.match(/SHA1:\s*([0-9A-F:]+)/);
  if (match) {
    console.log(match[1]);
  } else {
    console.error('SHA1 fingerprint not found.');
    process.exit(1);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
} 