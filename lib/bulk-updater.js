const { GitHubManager } = require("./github-manager");
const { transformWebsite } = require("./website-transformer");
const fs = require("fs-extra");
const path = require("path");

class BulkUpdater {
  constructor() {
    this.githubManager = new GitHubManager();
    this.updateLogPath = path.join(__dirname, "..", "logs", "update-log.json");
  }

  async updateRepositories(force = false) {
    try {
      console.log("🔄 Starting bulk repository update...");

      // Ensure logs directory exists
      await fs.ensureDir(path.dirname(this.updateLogPath));

      // Load existing update log
      const updateLog = await this.loadUpdateLog();

      // Get all transformed repositories
      const repositories = await this.githubManager.listRepositories();
      console.log(`📦 Found ${repositories.length} repositories to check`);

      const results = {
        updated: [],
        skipped: [],
        errors: [],
      };

      for (const repo of repositories) {
        try {
          console.log(`\n🔍 Checking repository: ${repo.name}`);

          // Extract original URL from repository description or README
          const originalUrl = await this.extractOriginalUrl(repo);

          if (!originalUrl) {
            console.log(`⚠️  No original URL found for ${repo.name}, skipping`);
            results.skipped.push({
              repo: repo.name,
              reason: "No original URL found",
            });
            continue;
          }

          // Check if update is needed
          const lastUpdate = updateLog[repo.name];
          const needsUpdate =
            force || this.shouldUpdate(lastUpdate, originalUrl);

          if (!needsUpdate) {
            console.log(`✅ ${repo.name} is up to date, skipping`);
            results.skipped.push({
              repo: repo.name,
              reason: "Already up to date",
            });
            continue;
          }

          console.log(`🔄 Updating ${repo.name} from ${originalUrl}`);

          // Transform the website
          const transformedContent = await transformWebsite(originalUrl);

          // Update the repository
          await this.githubManager.updateRepository(
            repo.full_name,
            transformedContent,
            originalUrl
          );

          // Update the log
          updateLog[repo.name] = {
            lastUpdated: new Date().toISOString(),
            originalUrl: originalUrl,
            status: "success",
          };

          results.updated.push({
            repo: repo.name,
            url: repo.html_url,
            pagesUrl: `https://${process.env.GITHUB_USERNAME}.github.io/${repo.name}`,
            originalUrl: originalUrl,
          });

          console.log(`✅ Successfully updated ${repo.name}`);

          // Add delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Failed to update ${repo.name}:`, error.message);
          results.errors.push({
            repo: repo.name,
            error: error.message,
          });

          // Update log with error
          updateLog[repo.name] = {
            lastUpdated: new Date().toISOString(),
            status: "error",
            error: error.message,
          };
        }
      }

      // Save updated log
      await this.saveUpdateLog(updateLog);

      // Print summary
      this.printSummary(results);

      return results;
    } catch (error) {
      console.error("❌ Bulk update failed:", error.message);
      throw error;
    }
  }

  async extractOriginalUrl(repo) {
    try {
      // Try to get the README content
      const { data: readmeData } =
        await this.githubManager.octokit.rest.repos.getContent({
          owner: repo.owner.login,
          repo: repo.name,
          path: "README.md",
        });

      const readmeContent = Buffer.from(
        readmeData.content,
        "base64"
      ).toString();

      // Extract URL from README
      const urlMatch = readmeContent.match(
        /Original Website[\s\S]*?URL.*?:\s*(https?:\/\/[^\s]+)/i
      );
      if (urlMatch) {
        return urlMatch[1];
      }

      // Try to extract from description
      if (repo.description && repo.description.includes("http")) {
        const descUrlMatch = repo.description.match(/(https?:\/\/[^\s]+)/);
        if (descUrlMatch) {
          return descUrlMatch[1];
        }
      }

      return null;
    } catch (error) {
      console.warn(`Could not extract URL from ${repo.name}:`, error.message);
      return null;
    }
  }

  shouldUpdate(lastUpdate, originalUrl) {
    if (!lastUpdate) {
      return true; // Never updated before
    }

    // Check if it's been more than 24 hours since last update
    const lastUpdateTime = new Date(lastUpdate.lastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now - lastUpdateTime) / (1000 * 60 * 60);

    if (hoursSinceUpdate < 24) {
      return false; // Updated recently
    }

    // Check if URL has changed
    if (lastUpdate.originalUrl !== originalUrl) {
      return true; // URL changed
    }

    // Check if last update failed
    if (lastUpdate.status === "error") {
      return true; // Retry failed update
    }

    return false;
  }

  async loadUpdateLog() {
    try {
      if (await fs.pathExists(this.updateLogPath)) {
        const logContent = await fs.readFile(this.updateLogPath, "utf8");
        return JSON.parse(logContent);
      }
    } catch (error) {
      console.warn("Could not load update log:", error.message);
    }
    return {};
  }

  async saveUpdateLog(updateLog) {
    try {
      await fs.writeFile(
        this.updateLogPath,
        JSON.stringify(updateLog, null, 2)
      );
    } catch (error) {
      console.error("Could not save update log:", error.message);
    }
  }

  printSummary(results) {
    console.log("\n📊 Update Summary:");
    console.log("==================");

    if (results.updated.length > 0) {
      console.log(`\n✅ Updated (${results.updated.length}):`);
      results.updated.forEach((item) => {
        console.log(`  • ${item.repo}`);
        console.log(`    Original: ${item.originalUrl}`);
        console.log(`    Pages: ${item.pagesUrl}`);
      });
    }

    if (results.skipped.length > 0) {
      console.log(`\n⏭️  Skipped (${results.skipped.length}):`);
      results.skipped.forEach((item) => {
        console.log(`  • ${item.repo} - ${item.reason}`);
      });
    }

    if (results.errors.length > 0) {
      console.log(`\n❌ Errors (${results.errors.length}):`);
      results.errors.forEach((item) => {
        console.log(`  • ${item.repo}: ${item.error}`);
      });
    }

    console.log(
      `\n📈 Total: ${results.updated.length} updated, ${results.skipped.length} skipped, ${results.errors.length} errors`
    );
  }

  async getUpdateStatus() {
    const updateLog = await this.loadUpdateLog();
    const repositories = await this.githubManager.listRepositories();

    const status = {
      total: repositories.length,
      lastUpdated: [],
      needsUpdate: [],
      errors: [],
    };

    for (const repo of repositories) {
      const logEntry = updateLog[repo.name];

      if (!logEntry) {
        status.needsUpdate.push(repo.name);
      } else if (logEntry.status === "error") {
        status.errors.push({
          repo: repo.name,
          error: logEntry.error,
        });
      } else {
        status.lastUpdated.push({
          repo: repo.name,
          lastUpdated: logEntry.lastUpdated,
          originalUrl: logEntry.originalUrl,
        });
      }
    }

    return status;
  }
}

module.exports = {
  BulkUpdater,
  updateRepositories: async (force = false) => {
    const updater = new BulkUpdater();
    return await updater.updateRepositories(force);
  },
};
