#!/usr/bin/env node

// Template script for generating Flutter apps from websites
// Copy this file and rename it to your website name (e.g., mysite.js)
// Then run: npm run mysite

const { execSync } = require("child_process");

// CONFIGURATION - Edit these values
const WEBSITE_URL = "https://example.com"; // Change this to your website URL
const APP_NAME = "my-app"; // Change this to your desired app name
const DESCRIPTION = "My custom Flutter app"; // Change this to your description

console.log(`🚀 Generating Flutter app for: ${WEBSITE_URL}`);

try {
  // Run the generate script with the configured values
  execSync(
    `npm run generate -- --url "${WEBSITE_URL}" --name "${APP_NAME}" --description "${DESCRIPTION}"`,
    {
      stdio: "inherit",
      cwd: process.cwd(),
    }
  );
} catch (error) {
  console.error(`❌ Failed to generate app:`, error.message);
  process.exit(1);
}
