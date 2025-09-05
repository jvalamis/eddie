#!/usr/bin/env node

const { updateRepositories } = require("../lib/bulk-updater");
const { program } = require("yargs");
require("dotenv").config();

program.option("-f, --force", "Force update all repositories").parse();

async function updateRepos() {
  const options = program.opts();

  try {
    console.log("🔄 Starting bulk repository update...");
    await updateRepositories(options.force);
    console.log("✅ Bulk update completed successfully");
  } catch (error) {
    console.error("❌ Bulk update failed:", error.message);
    process.exit(1);
  }
}

updateRepos();
