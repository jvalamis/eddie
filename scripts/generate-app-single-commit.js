#!/usr/bin/env node

const { MultiPageTransformer } = require("../lib/multi-page-transformer");
const { GitHubManager } = require("../lib/github-manager");
const { CrawlCache } = require("../lib/crawl-cache");
const {
  normalizeToEddieSchema,
  validateEddieDoc,
} = require("../lib/normalizer");
const fs = require("fs-extra");
const path = require("path");
const yargs = require("yargs");
require("dotenv").config();

const argv = yargs
  .option("u", {
    alias: "url",
    describe: "Website URL to extract",
    type: "string",
    demandOption: false,
  })
  .option("n", {
    alias: "name",
    describe: "App name (optional)",
    type: "string",
  })
  .option("d", {
    alias: "description",
    describe: "App description (optional)",
    type: "string",
  })
  .option("depth", {
    describe: "Maximum crawl depth (default: 2)",
    type: "number",
    default: 2,
  })
  .option("max-pages", {
    describe: "Maximum pages to crawl (default: 20)",
    type: "number",
    default: 20,
  })
  .option("force-recrawl", {
    describe: "Force recrawl even if recent crawl exists",
    type: "boolean",
    default: false,
  })
  .option("cache-max-age", {
    describe: "Maximum age of cached crawl in hours (default: 24)",
    type: "number",
    default: 24,
  })
  .option("clear-cache", {
    describe: "Clear all crawl cache before running",
    type: "boolean",
    default: false,
  })
  .option("cache-stats", {
    describe: "Show cache statistics and exit",
    type: "boolean",
    default: false,
  })
  .help().argv;

async function waitForDeployment(repoName) {
  const maxWaitTime = 10 * 60 * 1000; // 10 minutes
  const checkInterval = 30 * 1000; // 30 seconds
  const startTime = Date.now();

  console.log(`⏳ Monitoring GitHub Actions for repository: ${repoName}`);

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const { exec } = require("child_process");
      const { promisify } = require("util");
      const execAsync = promisify(exec);

      // Check the status of the most recent workflow
      const { stdout } = await execAsync(
        `gh run list --repo ${process.env.GITHUB_USERNAME}/${repoName} --limit 1 --json status,conclusion,createdAt`
      );

      const runs = JSON.parse(stdout);
      if (runs.length === 0) {
        throw new Error("No workflows found");
      }

      const latestRun = runs[0];

      if (latestRun.status === "in_progress" || latestRun.status === "queued") {
        console.log(
          `⏳ Latest workflow still running (${latestRun.status})...`
        );
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
        continue;
      }

      // Workflow completed, check conclusion
      if (latestRun.conclusion === "failure") {
        // Get the failed workflow logs
        console.log(`❌ Latest GitHub Actions workflow failed`);
        try {
          const { stdout: logs } = await execAsync(
            `gh run view ${latestRun.id} --repo ${process.env.GITHUB_USERNAME}/${repoName} --log`
          );
          console.log(`📋 Workflow failure details:`);
          console.log(logs.substring(0, 1000));
        } catch (logError) {
          console.log(`⚠️ Could not fetch workflow logs: ${logError.message}`);
          console.log(
            `💡 Check manually: https://github.com/${process.env.GITHUB_USERNAME}/${repoName}/actions`
          );
        }
        throw new Error(
          `Latest GitHub Actions workflow failed (${latestRun.conclusion})`
        );
      } else if (latestRun.conclusion === "success") {
        console.log(`✅ Latest GitHub Actions workflow completed successfully`);
        return;
      } else {
        throw new Error(
          `Latest GitHub Actions workflow had unexpected conclusion: ${latestRun.conclusion}`
        );
      }
    } catch (error) {
      console.log(`⚠️ Error checking workflows: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }
  }

  throw new Error("Timeout waiting for GitHub Actions to complete");
}

async function generateApp() {
  try {
    // Initialize crawl cache
    const crawlCache = new CrawlCache();

    // Handle cache management commands
    if (argv.cacheStats) {
      const stats = await crawlCache.getCacheStats();
      console.log("📊 Crawl Cache Statistics:");
      console.log(`   Total entries: ${stats.totalEntries}`);
      console.log(`   Total pages crawled: ${stats.totalPages}`);
      console.log(`   Total assets downloaded: ${stats.totalAssets}`);
      if (stats.oldestEntry) {
        console.log(
          `   Oldest entry: ${new Date(stats.oldestEntry).toLocaleString()}`
        );
      }
      if (stats.newestEntry) {
        console.log(
          `   Newest entry: ${new Date(stats.newestEntry).toLocaleString()}`
        );
      }
      return;
    }

    if (argv.clearCache) {
      await crawlCache.clearCache();
    }

    // Validate URL is provided when not using cache management commands
    if (!argv.url && !argv.cacheStats) {
      console.error(
        "❌ Error: URL is required when not using cache management commands"
      );
      console.error("💡 Use --help to see available options");
      process.exit(1);
    }

    console.log(`🚀 Generating Flutter app from: ${argv.url}`);
    console.log(`📊 Max depth: ${argv.depth}, Max pages: ${argv.maxPages}`);

    // Check if we need to crawl
    const crawlOptions = {
      depth: argv.depth,
      maxPages: argv.maxPages,
    };

    const shouldCrawl = await crawlCache.shouldCrawl(
      argv.url,
      crawlOptions,
      argv.forceRecrawl
    );

    if (!shouldCrawl) {
      console.log("⏭️ Skipping crawl - using cached data");
      console.log("💡 Use --force-recrawl to recrawl anyway");
    }

    // Step 1: Extract website data to JSON
    console.log("\n📋 Step 1: Extracting website content...");
    const transformer = new MultiPageTransformer();

    // Set environment variables for the transformer
    process.env.MAX_CRAWL_DEPTH = argv.depth.toString();
    process.env.MAX_PAGES = argv.maxPages.toString();

    // Set the domain and base URL
    transformer.baseUrl = new URL(argv.url);
    transformer.domain = transformer.baseUrl.hostname;

    let siteData;

    if (shouldCrawl) {
      // Crawl and extract data
      await transformer.crawlWebsite(argv.url);
      await transformer.transformAllPages();
      await transformer.downloadAssets();

      // Convert to structured JSON
      siteData = transformer.convertToJSON();

      // Record the crawl in cache
      await crawlCache.recordCrawl(argv.url, crawlOptions, {
        pagesCount: siteData.pages.length,
        assetsCount: siteData.assets.length,
        crawlDepth: argv.depth,
        maxPages: argv.maxPages,
      });

      console.log(
        `✅ Extracted data from ${siteData.pages.length} pages and ${siteData.assets.length} assets`
      );
    } else {
      // Use cached data - load from existing repository
      console.log("📂 Loading data from existing repository...");

      try {
        // Generate the repository name first
        const repoName = argv.name || generateRepoName(argv.url);

        // Try to load site-data.json from the existing repository
        const siteDataUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/${repoName}/main/assets/site-data.json`;

        const axios = require("axios");
        const response = await axios.get(siteDataUrl);
        siteData = response.data;

        console.log(
          `✅ Loaded cached data: ${siteData.pages.length} pages, ${siteData.assets.length} assets`
        );
      } catch (error) {
        console.log("⚠️ Could not load cached data, falling back to crawl...");
        console.log(`   Error: ${error.message}`);

        // Fallback to crawling
        await transformer.crawlWebsite(argv.url);
        await transformer.transformAllPages();
        await transformer.downloadAssets();
        siteData = transformer.convertToJSON();

        console.log(
          `✅ Extracted data from ${siteData.pages.length} pages and ${siteData.assets.length} assets`
        );
      }
    }

    // Step 2: Generate repository name
    const repoName = argv.name || generateRepoName(argv.url);
    const repoFullName = `${process.env.GITHUB_USERNAME}/${repoName}`;

    // Step 3: Create GitHub repository
    console.log("\n🆕 Step 2: Creating GitHub repository...");
    const githubManager = new GitHubManager();

    // Check if repository already exists
    let repo;
    try {
      await githubManager.octokit.rest.repos.get({
        owner: process.env.GITHUB_USERNAME,
        repo: repoName,
      });
      console.log(`⚠️  Repository ${repoName} already exists, updating...`);
      repo = { html_url: `https://github.com/${repoFullName}` };
    } catch (error) {
      if (error.status === 404) {
        // Repository doesn't exist, create it
        console.log(`🆕 Creating new repository: ${repoName}`);
        repo = await githubManager.createRepository(repoName, {
          description:
            argv.description || `Flutter app generated from ${argv.url}`,
          content: null,
          url: argv.url,
        });
      } else {
        throw error;
      }
    }

    // Step 4: Prepare complete Flutter app
    console.log("\n🎨 Step 3: Preparing complete Flutter app...");

    // Create the JSON file content
    const jsonContent = JSON.stringify(siteData, null, 2);

    // Normalize to Eddie schema
    console.log("🔄 Normalizing content to Eddie schema...");
    const eddieDoc = await normalizeToEddieSchema(siteData);
    validateEddieDoc(eddieDoc);
    const eddieContent = JSON.stringify(eddieDoc, null, 2);
    console.log("✅ Content normalized successfully");

    // Generate Flutter app from template
    const tempDir = path.join(__dirname, "../temp_flutter_build");
    const templateDir = path.join(__dirname, "../flutter_template");

    // Clean and create temp directory
    await fs.remove(tempDir);
    await fs.copy(templateDir, tempDir);

    // Copy eddie_renderer package into the Flutter app
    const eddieRendererSource = path.join(
      __dirname,
      "../packages/eddie_renderer"
    );
    const eddieRendererDest = path.join(tempDir, "packages/eddie_renderer");
    await fs.ensureDir(path.dirname(eddieRendererDest));
    await fs.copy(eddieRendererSource, eddieRendererDest);

    // Update pubspec.yaml with correct app name
    const pubspecPath = path.join(tempDir, "pubspec.yaml");
    let pubspecContent = await fs.readFile(pubspecPath, "utf8");
    pubspecContent = pubspecContent.replace(
      /name: website_app/g,
      `name: ${repoName.replace(/-/g, "_")}`
    );
    await fs.writeFile(pubspecPath, pubspecContent);

    // Copy content.json to assets (Eddie format)
    const assetsDir = path.join(tempDir, "assets");
    await fs.ensureDir(assetsDir);
    await fs.writeFile(path.join(assetsDir, "content.json"), eddieContent);

    // Also copy the old format for backward compatibility
    await fs.writeFile(path.join(assetsDir, "site-data.json"), jsonContent);

    // Also copy to web directory for direct access in deployed app
    const webDir = path.join(tempDir, "web");
    await fs.ensureDir(webDir);
    await fs.writeFile(path.join(webDir, "content.json"), eddieContent);
    await fs.writeFile(path.join(webDir, "site-data.json"), jsonContent);

    // Update main.dart with correct app title
    const mainDartPath = path.join(tempDir, "lib/main.dart");
    let mainContent = await fs.readFile(mainDartPath, "utf8");
    const appTitle = siteData.metadata?.domain || repoName;
    mainContent = mainContent.replace(
      /title: 'Website App'/g,
      `title: '${appTitle}'`
    );
    await fs.writeFile(mainDartPath, mainContent);

    // Copy GitHub Actions workflow
    const workflowDir = path.join(tempDir, ".github/workflows");
    await fs.ensureDir(workflowDir);
    await fs.copy(
      path.join(__dirname, "../.github/workflows/deploy-flutter.yml"),
      path.join(workflowDir, "deploy-flutter.yml")
    );

    // Create README in temp directory
    const readmeContent = `# ${siteData.metadata.domain} - Flutter App

This repository contains a modern Flutter app generated from: **${argv.url}**

## 📊 Extraction Summary
- **Domain**: ${siteData.metadata.domain}
- **Pages Found**: ${siteData.pages.length}
- **Assets Found**: ${siteData.assets.length}
- **Extracted**: ${new Date(siteData.metadata.crawledAt).toLocaleString()}

## 🎨 Flutter App Features
- **Modern Material Design 3** UI
- **Responsive design** for all devices
- **Cross-platform** - Web, iOS, Android
- **Live GitHub Pages** deployment

## 🔗 Links
- **Live App**: https://${process.env.GITHUB_USERNAME}.github.io/${repoName}
- **Original Website**: [${argv.url}](${argv.url})
- **Repository**: https://github.com/${repoFullName}

## 📱 Usage
The Flutter app automatically reads the \`site-data.json\` file and creates a beautiful, modern interface for all the extracted website content.

---
*Generated by Eddie - Website to Flutter App Generator*
`;
    await fs.writeFile(path.join(tempDir, "README.md"), readmeContent);

    console.log("✅ Complete Flutter app prepared");

    // Step 5: Deploy everything in single commit
    console.log("\n🚀 Step 4: Deploying complete Flutter app...");

    const [owner, repoNameOnly] = repoFullName.split("/");
    const branch = process.env.DEFAULT_BRANCH || "main";

    // Get the latest commit SHA
    const { data: refData } = await githubManager.octokit.rest.git.getRef({
      owner,
      repo: repoNameOnly,
      ref: `heads/${branch}`,
    });
    const latestCommitSha = refData.object.sha;

    // Get the tree SHA of the latest commit
    const { data: commitData } = await githubManager.octokit.rest.git.getCommit(
      {
        owner,
        repo: repoNameOnly,
        commit_sha: latestCommitSha,
      }
    );
    const baseTreeSha = commitData.tree.sha;

    // Create tree items for ALL files (JSON + Flutter template)
    const treeItems = [];
    console.log("📁 Building file tree...");
    await addDirectoryToTree(tempDir, "", treeItems, owner, repoNameOnly);
    console.log(`📁 Built tree with ${treeItems.length} files`);

    // Create the tree
    console.log("🌳 Creating GitHub tree...");
    const { data: treeData } = await githubManager.octokit.rest.git.createTree({
      owner,
      repo: repoNameOnly,
      tree: treeItems,
      base_tree: baseTreeSha,
    });
    console.log("✅ Tree created successfully");

    // Create the commit
    const { data: newCommitData } =
      await githubManager.octokit.rest.git.createCommit({
        owner,
        repo: repoNameOnly,
        message: `Complete Flutter app with website data\n\n- Extracted ${siteData.pages.length} pages from ${argv.url}\n- Flutter app with modern Material Design 3 UI\n- GitHub Actions workflow for automatic deployment\n- Ready for cross-platform deployment`,
        tree: treeData.sha,
        parents: [latestCommitSha],
      });

    // Update the branch reference
    await githubManager.octokit.rest.git.updateRef({
      owner,
      repo: repoNameOnly,
      ref: `heads/${branch}`,
      sha: newCommitData.sha,
    });

    // Step 6: GitHub Pages will be handled by our workflow
    console.log(
      "\n🌐 Step 5: GitHub Pages will be deployed via our workflow..."
    );

    // Step 7: Clean up
    await fs.remove(tempDir);

    // Success!
    console.log("\n🎉 Flutter app setup completed successfully!");
    console.log(`🔗 Repository: ${repo.html_url}`);
    console.log(
      `🌐 Live App: https://${process.env.GITHUB_USERNAME}.github.io/${repoName}`
    );
    console.log(`📱 Cross-platform: Web, iOS, Android ready`);
    console.log(`📊 Pages extracted: ${siteData.pages.length}`);
    console.log(`📦 Assets found: ${siteData.assets.length}`);
    console.log(
      `\n⏳ GitHub Actions will build and deploy the Flutter app automatically...`
    );
    console.log(
      `🔍 Check the Actions tab in your repository to monitor progress.`
    );

    // Flutter debugging is now handled automatically by GitHub Actions
    const deployedUrl = `https://${process.env.GITHUB_USERNAME}.github.io/${repoName}`;
    console.log(
      `\n🔍 Flutter debugging will run automatically in GitHub Actions...`
    );
    console.log(
      `⏳ Check the Actions tab in your repository to monitor Flutter debugging progress.`
    );

    // Open browser after deployment
    if (process.env.OPEN_BROWSER !== "false") {
      console.log(`\n🌐 Opening deployed app in browser...`);
      const { exec } = require("child_process");
      exec(`open "${deployedUrl}"`, (error) => {
        if (error) {
          console.log(`⚠️ Could not open browser: ${error.message}`);
          console.log(`🔗 Please open manually: ${deployedUrl}`);
        }
      });
    }
  } catch (error) {
    console.error("❌ App generation failed:", error.message);
    process.exit(1);
  }
}

function generateRepoName(url) {
  const domain = new URL(url).hostname.replace(/\./g, "-");
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = process.env.REPO_PREFIX || "flutter-app";
  return `${prefix}-${timestamp}-${domain}`;
}

async function addDirectoryToTree(
  dirPath,
  relativePath,
  treeItems,
  owner,
  repo
) {
  const items = await fs.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(dirPath, item.name);
    const treePath = relativePath ? `${relativePath}/${item.name}` : item.name;

    // Skip build directories and generated files
    if (
      item.name === "build" ||
      item.name === ".dart_tool" ||
      item.name === "node_modules" ||
      item.name === "pubspec.lock"
    ) {
      continue;
    }

    if (item.isDirectory()) {
      await addDirectoryToTree(itemPath, treePath, treeItems, owner, repo);
    } else {
      const content = await fs.readFile(itemPath);

      // For text files, use plain text content instead of base64
      if (
        treePath.endsWith(".yml") ||
        treePath.endsWith(".yaml") ||
        treePath.endsWith(".md") ||
        treePath.endsWith(".txt") ||
        treePath.endsWith(".json") ||
        treePath.endsWith(".html") ||
        treePath.endsWith(".dart")
      ) {
        treeItems.push({
          path: treePath,
          mode: "100644",
          type: "blob",
          content: content.toString("utf8"),
        });
      } else {
        treeItems.push({
          path: treePath,
          mode: "100644",
          type: "blob",
          content: content.toString("base64"),
        });
      }
    }
  }
}

generateApp();
