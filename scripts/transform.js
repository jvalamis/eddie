#!/usr/bin/env node

const { transformWebsite } = require("../lib/website-transformer");
const { createRepository } = require("../lib/github-manager");
const { program } = require("yargs");
require("dotenv").config();

program
  .option("-u, --url <url>", "Website URL to transform")
  .option("-n, --name <name>", "Repository name")
  .option("-d, --description <description>", "Repository description")
  .parse();

async function transform() {
  const options = program.opts();

  if (!options.url) {
    console.error("❌ URL is required. Use --url <website-url>");
    process.exit(1);
  }

  try {
    console.log(`🚀 Transforming website: ${options.url}`);

    // Transform the website
    const transformedContent = await transformWebsite(options.url);

    // Generate repository name
    const repoName = options.name || generateRepoName(options.url);

    // Create repository
    const repo = await createRepository(repoName, {
      description: options.description || process.env.REPO_DESCRIPTION,
      content: transformedContent,
      url: options.url,
    });

    console.log(`✅ Repository created: ${repo.html_url}`);
    console.log(
      `🌐 GitHub Pages URL: https://${process.env.GITHUB_USERNAME}.github.io/${repoName}`
    );
  } catch (error) {
    console.error("❌ Transformation failed:", error.message);
    process.exit(1);
  }
}

function generateRepoName(url) {
  const domain = new URL(url).hostname.replace(/\./g, "-");
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = process.env.REPO_PREFIX || "transformed-site";
  return `${prefix}-${timestamp}-${domain}`;
}

transform();
