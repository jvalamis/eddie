#!/usr/bin/env node

const { program } = require("yargs");
const { setupN8n } = require("./lib/n8n-setup");
const { transformWebsite } = require("./lib/website-transformer");
const { createRepository } = require("./lib/github-manager");
const { updateRepositories } = require("./lib/bulk-updater");
require("dotenv").config();

program
  .command("transform <url>")
  .description("Transform a website and create a new repository")
  .option("-n, --name <name>", "Custom repository name")
  .option("-d, --description <description>", "Repository description")
  .action(async (url, options) => {
    try {
      console.log(`🚀 Starting transformation of ${url}`);

      // Transform the website
      const transformedContent = await transformWebsite(url);

      // Generate repository name
      const repoName = options.name || generateRepoName(url);

      // Create repository
      const repo = await createRepository(repoName, {
        description: options.description || process.env.REPO_DESCRIPTION,
        content: transformedContent,
        url: url,
      });

      console.log(`✅ Repository created: ${repo.html_url}`);
      console.log(
        `🌐 GitHub Pages URL: https://${process.env.GITHUB_USERNAME}.github.io/${repoName}`
      );
    } catch (error) {
      console.error("❌ Transformation failed:", error.message);
      process.exit(1);
    }
  });

program
  .command("update-repos")
  .description("Update all repositories with latest transformations")
  .option("-f, --force", "Force update even if no changes detected")
  .action(async (options) => {
    try {
      console.log("🔄 Starting bulk repository update...");
      await updateRepositories(options.force);
      console.log("✅ All repositories updated successfully");
    } catch (error) {
      console.error("❌ Bulk update failed:", error.message);
      process.exit(1);
    }
  });

program
  .command("setup")
  .description("Initialize n8n workflows and system configuration")
  .action(async () => {
    try {
      console.log("⚙️ Setting up n8n workflows...");
      await setupN8n();
      console.log("✅ Setup completed successfully");
    } catch (error) {
      console.error("❌ Setup failed:", error.message);
      process.exit(1);
    }
  });

program
  .command("list-repos")
  .description("List all transformed repositories")
  .action(async () => {
    try {
      const { listRepositories } = require("./lib/github-manager");
      const repos = await listRepositories();

      console.log("\n📦 Transformed Repositories:");
      repos.forEach((repo) => {
        console.log(`  • ${repo.name} - ${repo.html_url}`);
        console.log(
          `    Pages: https://${process.env.GITHUB_USERNAME}.github.io/${repo.name}`
        );
      });
    } catch (error) {
      console.error("❌ Failed to list repositories:", error.message);
      process.exit(1);
    }
  });

function generateRepoName(url) {
  const domain = new URL(url).hostname.replace(/\./g, "-");
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = process.env.REPO_PREFIX || "transformed-site";
  return `${prefix}-${timestamp}-${domain}`;
}

program.parse();
