#!/usr/bin/env node

const { setupN8n } = require("../lib/n8n-setup");
const fs = require("fs-extra");
const path = require("path");

async function setup() {
  console.log("🚀 Setting up Eddie Website Transformation System...");

  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, "..", ".env");
    if (!(await fs.pathExists(envPath))) {
      console.log("⚠️  .env file not found. Creating from template...");
      const envExample = await fs.readFile(
        path.join(__dirname, "..", "env.example"),
        "utf8"
      );
      await fs.writeFile(envPath, envExample);
      console.log(
        "📄 Created .env file. Please edit it with your configuration."
      );
    }

    // Create necessary directories
    const directories = ["data", "logs", "workflows", "scripts"];
    for (const dir of directories) {
      await fs.ensureDir(path.join(__dirname, "..", dir));
      console.log(`📁 Created directory: ${dir}/`);
    }

    // Setup n8n workflows
    await setupN8n();

    console.log("\n✅ Setup completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Edit .env file with your GitHub token and configuration");
    console.log("2. Run: npm start");
    console.log("3. Access n8n at: http://localhost:5678");
    console.log("4. Import workflows from ./workflows/ directory");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

setup();
