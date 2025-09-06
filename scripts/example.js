#!/usr/bin/env node

const { execSync } = require("child_process");

console.log(`🚀 Generating Flutter app for: https://example.com`);

try {
  execSync(
    `npm run generate -- --url "https://example.com" --name "example-app" --description "Example.com Flutter app"`,
    {
      stdio: "inherit",
      cwd: process.cwd(),
    }
  );
} catch (error) {
  console.error(`❌ Failed to generate app:`, error.message);
  process.exit(1);
}
