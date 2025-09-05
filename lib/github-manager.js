const { Octokit } = require("@octokit/rest");
const fs = require("fs-extra");
const path = require("path");

class GitHubManager {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    this.username = process.env.GITHUB_USERNAME;
    this.org = process.env.GITHUB_ORG;
  }

  async createRepository(name, options = {}) {
    try {
      // Create repository
      const repoData = {
        name,
        description: options.description || process.env.REPO_DESCRIPTION,
        private: false,
        auto_init: true,
        gitignore_template: "Node",
        license_template: "mit",
      };

      const owner = this.org || this.username;
      const repo = await this.octokit.rest.repos.createInOrg({
        org: owner,
        ...repoData,
      });

      // Wait a moment for repo to be fully created
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create initial content
      if (options.content) {
        await this.deployContent(
          repo.data.full_name,
          options.content,
          options.url
        );
      }

      // Enable GitHub Pages
      await this.enableGitHubPages(repo.data.full_name);

      return repo.data;
    } catch (error) {
      if (error.status === 422 && error.message.includes("already exists")) {
        throw new Error(`Repository ${name} already exists`);
      }
      throw error;
    }
  }

  async deployContent(repoFullName, content, originalUrl) {
    const files = [
      {
        path: "index.html",
        content: content.html,
        message: "Initial transformed website deployment",
      },
      {
        path: "style.css",
        content: content.css,
        message: "Transformed website styles",
      },
      {
        path: "script.js",
        content: content.js,
        message: "Transformed website scripts",
      },
      {
        path: "README.md",
        content: this.generateReadme(originalUrl, repoFullName),
        message: "Add repository documentation",
      },
    ];

    for (const file of files) {
      await this.createFile(
        repoFullName,
        file.path,
        file.content,
        file.message
      );
    }
  }

  async createFile(repoFullName, filePath, content, message) {
    try {
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: repoFullName.split("/")[0],
        repo: repoFullName.split("/")[1],
        path: filePath,
        message: message,
        content: Buffer.from(content).toString("base64"),
        branch: process.env.DEFAULT_BRANCH || "main",
      });
    } catch (error) {
      console.error(`Failed to create file ${filePath}:`, error.message);
    }
  }

  async enableGitHubPages(repoFullName) {
    try {
      await this.octokit.rest.repos.update({
        owner: repoFullName.split("/")[0],
        repo: repoFullName.split("/")[1],
        pages: {
          source: {
            branch: process.env.PAGES_SOURCE_BRANCH || "main",
            path: process.env.PAGES_SOURCE_PATH || "/",
          },
        },
      });
    } catch (error) {
      console.error("Failed to enable GitHub Pages:", error.message);
    }
  }

  async listRepositories() {
    try {
      const owner = this.org || this.username;
      const { data: repos } = await this.octokit.rest.repos.listForOrg({
        org: owner,
        type: "all",
        per_page: 100,
      });

      // Filter repositories that match our naming convention
      const prefix = process.env.REPO_PREFIX || "transformed-site";
      return repos.filter((repo) => repo.name.startsWith(prefix));
    } catch (error) {
      console.error("Failed to list repositories:", error.message);
      return [];
    }
  }

  async updateRepository(repoFullName, content, originalUrl) {
    try {
      const files = [
        { path: "index.html", content: content.html },
        { path: "style.css", content: content.css },
        { path: "script.js", content: content.js },
      ];

      for (const file of files) {
        await this.updateFile(repoFullName, file.path, file.content);
      }

      // Update README with new timestamp
      const readme = this.generateReadme(originalUrl, repoFullName, true);
      await this.updateFile(repoFullName, "README.md", readme);
    } catch (error) {
      console.error(
        `Failed to update repository ${repoFullName}:`,
        error.message
      );
    }
  }

  async updateFile(repoFullName, filePath, content) {
    try {
      // Get current file to get SHA
      const { data: currentFile } = await this.octokit.rest.repos.getContent({
        owner: repoFullName.split("/")[0],
        repo: repoFullName.split("/")[1],
        path: filePath,
        branch: process.env.DEFAULT_BRANCH || "main",
      });

      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: repoFullName.split("/")[0],
        repo: repoFullName.split("/")[1],
        path: filePath,
        message: `Update ${filePath} - ${new Date().toISOString()}`,
        content: Buffer.from(content).toString("base64"),
        sha: currentFile.sha,
        branch: process.env.DEFAULT_BRANCH || "main",
      });
    } catch (error) {
      console.error(`Failed to update file ${filePath}:`, error.message);
    }
  }

  generateReadme(originalUrl, repoFullName, isUpdate = false) {
    const timestamp = new Date().toISOString();
    const pagesUrl = `https://${this.username}.github.io/${
      repoFullName.split("/")[1]
    }`;

    return `# Transformed Website

This repository contains a transformed version of the original website.

## Original Website
- **URL**: ${originalUrl}
- **Transformed**: ${timestamp}
- **Status**: ${isUpdate ? "Updated" : "Initial"}

## Live Demo
🌐 **GitHub Pages**: [${pagesUrl}](${pagesUrl})

## Transformation Details
- Enhanced with modern CSS and responsive design
- Optimized for performance and accessibility
- Deployed automatically via Eddie transformation system

## Repository Info
- **Repository**: ${repoFullName}
- **Last Updated**: ${timestamp}
- **Generated by**: [Eddie Website Transformer](https://github.com/${
      this.username
    }/eddie)

---
*This repository was automatically generated and deployed by the Eddie website transformation system.*
`;
  }
}

module.exports = {
  GitHubManager,
  createRepository: async (name, options) => {
    const manager = new GitHubManager();
    return await manager.createRepository(name, options);
  },
  listRepositories: async () => {
    const manager = new GitHubManager();
    return await manager.listRepositories();
  },
};
