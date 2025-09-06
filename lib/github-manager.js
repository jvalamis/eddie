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
        auto_init: false, // Don't create initial commit
        gitignore_template: "Node",
        license_template: "mit",
      };

      const owner = this.org || this.username;

      let repo;
      if (this.org) {
        // Create repository in organization
        repo = await this.octokit.rest.repos.createInOrg({
          org: owner,
          ...repoData,
        });
      } else {
        // Create repository in personal account
        repo = await this.octokit.rest.repos.createForAuthenticatedUser({
          ...repoData,
        });
      }

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
    // Handle multi-page content
    if (content.pages) {
      await this.deployMultiPageContent(repoFullName, content, originalUrl);
    } else {
      // Handle single-page content (legacy)
      await this.deploySinglePageContent(repoFullName, content, originalUrl);
    }
  }

  async deploySinglePageContent(repoFullName, content, originalUrl) {
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

  async deployMultiPageContent(repoFullName, content, originalUrl) {
    console.log(
      `📁 Deploying multi-page content with ${
        Object.keys(content.pages).length
      } pages...`
    );

    try {
      const [owner, repo] = repoFullName.split("/");
      const branch = process.env.DEFAULT_BRANCH || "main";

      // Get the latest commit SHA
      const { data: refData } = await this.octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
      });
      const latestCommitSha = refData.object.sha;

      // Get the tree SHA of the latest commit
      const { data: commitData } = await this.octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: latestCommitSha,
      });
      const baseTreeSha = commitData.tree.sha;

      // Create tree items for all files
      const treeItems = [];

      // Add all pages
      for (const [path, pageData] of Object.entries(content.pages)) {
        treeItems.push({
          path: path,
          mode: "100644",
          type: "blob",
          content: pageData.html,
        });
      }

      // Add global assets
      if (content.globalCSS) {
        treeItems.push({
          path: "assets/global.css",
          mode: "100644",
          type: "blob",
          content: content.globalCSS,
        });
      }

      if (content.globalJS) {
        treeItems.push({
          path: "assets/global.js",
          mode: "100644",
          type: "blob",
          content: content.globalJS,
        });
      }

      // Add downloaded assets
      for (const [assetPath, assetData] of Object.entries(content.assets)) {
        treeItems.push({
          path: `assets/${assetPath}`,
          mode: "100644",
          type: "blob",
          content: assetData.content,
        });
      }

      // Add README
      treeItems.push({
        path: "README.md",
        mode: "100644",
        type: "blob",
        content: this.generateMultiPageReadme(
          originalUrl,
          repoFullName,
          content
        ),
      });

      // Create the tree
      const { data: treeData } = await this.octokit.rest.git.createTree({
        owner,
        repo,
        tree: treeItems,
        base_tree: baseTreeSha,
      });

      // Create the commit
      const { data: newCommitData } = await this.octokit.rest.git.createCommit({
        owner,
        repo,
        message: `Deploy multi-page website transformation\n\n- ${
          Object.keys(content.pages).length
        } pages\n- ${
          Object.keys(content.assets).length
        } assets\n- Enhanced with modern design and functionality`,
        tree: treeData.sha,
        parents: [latestCommitSha],
      });

      // Update the branch reference
      await this.octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommitData.sha,
      });

      console.log("✅ Multi-page content deployed in single commit");
    } catch (error) {
      console.error("❌ Failed to deploy multi-page content:", error.message);
      throw error;
    }
  }

  async createFile(repoFullName, filePath, content, message) {
    try {
      // Try to get existing file first to get SHA
      let sha = null;
      try {
        const { data: existingFile } = await this.octokit.rest.repos.getContent(
          {
            owner: repoFullName.split("/")[0],
            repo: repoFullName.split("/")[1],
            path: filePath,
            branch: process.env.DEFAULT_BRANCH || "main",
          }
        );
        sha = existingFile.sha;
      } catch (error) {
        // File doesn't exist, that's fine
      }

      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: repoFullName.split("/")[0],
        repo: repoFullName.split("/")[1],
        path: filePath,
        message: message,
        content: Buffer.from(content).toString("base64"),
        sha: sha, // Will be null for new files
        branch: process.env.DEFAULT_BRANCH || "main",
      });
    } catch (error) {
      console.error(`Failed to create file ${filePath}:`, error.message);
    }
  }

  async enableGitHubPages(repoFullName) {
    const [owner, repo] = repoFullName.split("/");

    try {
      // First, try to delete any existing Pages site to avoid conflicts
      try {
        await this.octokit.rest.repos.deletePagesSite({
          owner,
          repo,
        });
        console.log("🗑️  Deleted existing GitHub Pages site");
      } catch (deleteError) {
        // Ignore if no Pages site exists
      }

      // Now create a new Pages site with Actions source
      await this.octokit.rest.repos.createPagesSite({
        owner,
        repo,
        source: {
          type: "workflow", // Use GitHub Actions instead of branch
          branch: "main", // Required field even for workflow type
        },
      });
      console.log("✅ GitHub Pages enabled with Actions source only");
    } catch (error) {
      console.error("❌ Failed to enable GitHub Pages:", error.message);
      throw new Error(`GitHub Pages setup failed: ${error.message}`);
    }
  }

  async listRepositories() {
    try {
      if (this.org) {
        // List repositories from organization
        const { data: repos } = await this.octokit.rest.repos.listForOrg({
          org: this.org,
          type: "all",
          per_page: 100,
        });

        // Filter repositories that match our naming convention
        const prefix = process.env.REPO_PREFIX || "transformed-site";
        return repos.filter((repo) => repo.name.startsWith(prefix));
      } else {
        // List repositories from personal account
        const { data: repos } =
          await this.octokit.rest.repos.listForAuthenticatedUser({
            type: "all",
            per_page: 100,
          });

        // Filter repositories that match our naming convention
        const prefix = process.env.REPO_PREFIX || "transformed-site";
        return repos.filter((repo) => repo.name.startsWith(prefix));
      }
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

  generateMultiPageReadme(originalUrl, repoFullName, content) {
    const timestamp = new Date().toISOString();
    const pagesUrl = `https://${this.username}.github.io/${
      repoFullName.split("/")[1]
    }`;
    const pageCount = Object.keys(content.pages).length;
    const assetCount = Object.keys(content.assets).length;

    let pagesList = "";
    for (const [path, pageData] of Object.entries(content.pages)) {
      const pageUrl = `${pagesUrl}/${path}`;
      pagesList += `- [${pageData.metadata.title || path}](${pageUrl})\n`;
    }

    return `# Multi-Page Transformed Website

This repository contains a complete multi-page transformation of the original website.

## Original Website
- **URL**: ${originalUrl}
- **Transformed**: ${timestamp}
- **Pages Found**: ${pageCount}
- **Assets Downloaded**: ${assetCount}

## Live Demo
🌐 **GitHub Pages**: [${pagesUrl}](${pagesUrl})

## Available Pages
${pagesList}

## Transformation Details
- ✅ Complete website crawling and discovery
- ✅ Multi-page static site generation
- ✅ Asset downloading and organization
- ✅ Link rewriting for GitHub Pages compatibility
- ✅ Modern responsive design applied
- ✅ Performance optimizations
- ✅ SEO enhancements

## File Structure
\`\`\`
├── index.html              # Homepage
├── about.html              # About page
├── contact.html            # Contact page
├── assets/
│   ├── global.css          # Global styles
│   ├── global.js           # Global scripts
│   ├── images/             # Downloaded images
│   ├── css/                # Original CSS files
│   └── js/                 # Original JS files
└── README.md               # This file
\`\`\`

## Repository Info
- **Repository**: ${repoFullName}
- **Last Updated**: ${timestamp}
- **Generated by**: [Eddie Multi-Page Transformer](https://github.com/${this.username}/eddie)

---
*This repository was automatically generated and deployed by the Eddie multi-page website transformation system.*
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
