
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ Failed to ${description.toLowerCase()}`);
    process.exit(1);
  }
}

function main() {
  console.log('📱 Building Million Dollar eBooks for mobile platforms...\n');

  // Build the web app first
  runCommand('npm run build', 'Building web application');

  // Check if Capacitor is initialized
  if (!fs.existsSync('capacitor.config.ts')) {
    console.log('\n⚠️  Capacitor not initialized. Run "npx cap init" first.');
    process.exit(1);
  }

  // Sync with native platforms
  runCommand('npx cap sync', 'Syncing with native platforms');

  console.log('\n🎉 Mobile build completed successfully!');
  console.log('\nNext steps:');
  console.log('- Run "npx cap open ios" to open in Xcode (macOS only)');
  console.log('- Run "npx cap open android" to open in Android Studio');
  console.log('\n📋 Check mobile-deployment-next-steps.md for detailed instructions');
}

if (require.main === module) {
  main();
}
