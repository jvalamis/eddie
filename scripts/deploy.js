#!/usr/bin/env node

const { GitHubManager } = require("../lib/github-manager");
const { program } = require("yargs");
require("dotenv").config();

program
  .option("-r, --repo <repo>", "Specific repository to deploy")
  .option("-a, --all", "Deploy all repositories")
  .parse();

async function deploy() {
  const options = program.opts();
  const githubManager = new GitHubManager();

  try {
    if (options.repo) {
      console.log(`🚀 Deploying repository: ${options.repo}`);
      await githubManager.enableGitHubPages(options.repo);
      console.log(`✅ Repository ${options.repo} deployed to GitHub Pages`);
    } else if (options.all) {
      console.log("🚀 Deploying all repositories...");
      const repos = await githubManager.listRepositories();

      for (const repo of repos) {
        try {
          await githubManager.enableGitHubPages(repo.full_name);
          console.log(`✅ Deployed: ${repo.name}`);
        } catch (error) {
          console.error(`❌ Failed to deploy ${repo.name}:`, error.message);
        }
      }

      console.log("✅ All repositories deployed");
    } else {
      console.error("❌ Please specify --repo <name> or --all");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

deploy();
