#!/usr/bin/env node

const { execSync } = require("child_process");

console.log(`🚀 Generating Flutter app for: https://github.com`);

try {
  execSync(
    `npm run generate -- --url "https://github.com" --name "github-app" --description "GitHub Flutter app"`,
    {
      stdio: "inherit",
      cwd: process.cwd(),
    }
  );
} catch (error) {
  console.error(`❌ Failed to generate app:`, error.message);
  process.exit(1);
}
