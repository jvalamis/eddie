const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

class N8nSetup {
  constructor() {
    this.n8nHost = process.env.N8N_HOST || "localhost";
    this.n8nPort = process.env.N8N_PORT || 5678;
    this.n8nUrl = `http://${this.n8nHost}:${this.n8nPort}`;
    this.workflowsDir = path.join(__dirname, "..", "workflows");
  }

  async setupN8n() {
    console.log("⚙️ Setting up n8n workflows...");

    try {
      // Ensure workflows directory exists
      await fs.ensureDir(this.workflowsDir);

      // Create workflow templates
      await this.createWorkflowTemplates();

      // Create n8n configuration
      await this.createN8nConfig();

      // Create startup script
      await this.createStartupScript();

      console.log("✅ n8n setup completed successfully");
      console.log(`🌐 n8n will be available at: ${this.n8nUrl}`);
      console.log("📁 Workflow templates created in: ./workflows/");
    } catch (error) {
      console.error("❌ n8n setup failed:", error.message);
      throw error;
    }
  }

  async createWorkflowTemplates() {
    const workflows = [
      {
        name: "website-ingestion.json",
        content: this.getWebsiteIngestionWorkflow(),
      },
      {
        name: "website-transformation.json",
        content: this.getWebsiteTransformationWorkflow(),
      },
      {
        name: "github-deployment.json",
        content: this.getGitHubDeploymentWorkflow(),
      },
      {
        name: "bulk-update.json",
        content: this.getBulkUpdateWorkflow(),
      },
    ];

    for (const workflow of workflows) {
      const filePath = path.join(this.workflowsDir, workflow.name);
      await fs.writeFile(filePath, JSON.stringify(workflow.content, null, 2));
      console.log(`📄 Created workflow: ${workflow.name}`);
    }
  }

  getWebsiteIngestionWorkflow() {
    return {
      name: "Website Ingestion",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "ingest-website",
            responseMode: "responseNode",
          },
          id: "webhook-trigger",
          name: "Webhook Trigger",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            url: "={{ $json.url }}",
            options: {
              timeout: 30000,
              followRedirect: true,
            },
          },
          id: "http-request",
          name: "HTTP Request",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4.1,
          position: [460, 300],
        },
        {
          parameters: {
            jsCode:
              "// Extract website metadata and content\nconst cheerio = require('cheerio');\nconst $ = cheerio.load($input.first().json.data);\n\nconst metadata = {\n  title: $('title').text(),\n  description: $('meta[name=\"description\"]').attr('content') || '',\n  keywords: $('meta[name=\"keywords\"]').attr('content') || '',\n  canonical: $('link[rel=\"canonical\"]').attr('href') || '',\n  ogTitle: $('meta[property=\"og:title\"]').attr('content') || '',\n  ogDescription: $('meta[property=\"og:description\"]').attr('content') || '',\n  ogImage: $('meta[property=\"og:image\"]').attr('content') || ''\n};\n\nreturn {\n  json: {\n    url: $input.first().json.url,\n    html: $input.first().json.data,\n    metadata: metadata,\n    timestamp: new Date().toISOString()\n  }\n};",
          },
          id: "extract-metadata",
          name: "Extract Metadata",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [680, 300],
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: "={{ $json }}",
          },
          id: "respond",
          name: "Respond to Webhook",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [900, 300],
        },
      ],
      connections: {
        "Webhook Trigger": {
          main: [
            [
              {
                node: "HTTP Request",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "HTTP Request": {
          main: [
            [
              {
                node: "Extract Metadata",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "Extract Metadata": {
          main: [
            [
              {
                node: "Respond to Webhook",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
      },
      active: false,
      settings: {},
      versionId: "1",
    };
  }

  getWebsiteTransformationWorkflow() {
    return {
      name: "Website Transformation",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "transform-website",
            responseMode: "responseNode",
          },
          id: "webhook-trigger",
          name: "Webhook Trigger",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            jsCode:
              '// Transform website content\nconst cheerio = require(\'cheerio\');\nconst $ = cheerio.load($input.first().json.html);\n\n// Remove unwanted elements\n$(\'script[src*="analytics"]\').remove();\n$(\'script[src*="tracking"]\').remove();\n$(\'script[src*="ads"]\').remove();\n$(\'iframe[src*="ads"]\').remove();\n$(\'.advertisement, .ads, .ad-banner\').remove();\n\n// Add modern meta tags\n$(\'head\').prepend(`\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n`);\n\n// Add modern CSS and JS links\n$(\'head\').append(`\n  <link rel="stylesheet" href="style.css">\n  <script src="script.js" defer></script>\n`);\n\n// Enhance main content structure\nif (!$(\'main\').length) {\n  $(\'body\').wrapInner(\'<main></main>\');\n}\n\n// Add modern navigation if none exists\nif (!$(\'nav\').length) {\n  $(\'main\').prepend(`\n    <nav class="modern-nav">\n      <div class="nav-container">\n        <a href="#" class="nav-brand">${$input.first().json.metadata.title || \'Transformed Site\'}</a>\n        <div class="nav-links">\n          <a href="#home">Home</a>\n          <a href="#about">About</a>\n          <a href="#contact">Contact</a>\n        </div>\n      </div>\n    </nav>\n  `);\n}\n\n// Add footer\nif (!$(\'footer\').length) {\n  $(\'main\').after(`\n    <footer class="modern-footer">\n      <div class="footer-container">\n        <p>&copy; ${new Date().getFullYear()} ${$input.first().json.metadata.title || \'Transformed Site\'}</p>\n        <p>Transformed from <a href="${$input.first().json.url}" target="_blank" rel="noopener">original site</a></p>\n      </div>\n    </footer>\n  `);\n}\n\nreturn {\n  json: {\n    url: $input.first().json.url,\n    html: $.html(),\n    metadata: $input.first().json.metadata,\n    timestamp: new Date().toISOString()\n  }\n};',
          },
          id: "transform-content",
          name: "Transform Content",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [460, 300],
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: "={{ $json }}",
          },
          id: "respond",
          name: "Respond to Webhook",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [680, 300],
        },
      ],
      connections: {
        "Webhook Trigger": {
          main: [
            [
              {
                node: "Transform Content",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "Transform Content": {
          main: [
            [
              {
                node: "Respond to Webhook",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
      },
      active: false,
      settings: {},
      versionId: "1",
    };
  }

  getGitHubDeploymentWorkflow() {
    return {
      name: "GitHub Deployment",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "deploy-to-github",
            responseMode: "responseNode",
          },
          id: "webhook-trigger",
          name: "Webhook Trigger",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            authentication: "genericCredentialType",
            genericAuthType: "httpHeaderAuth",
            url: "https://api.github.com/user/repos",
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: "Authorization",
                  value: "token {{ $credentials.githubToken }}",
                },
                {
                  name: "Accept",
                  value: "application/vnd.github.v3+json",
                },
              ],
            },
            sendBody: true,
            bodyParameters: {
              parameters: [
                {
                  name: "name",
                  value: "={{ $json.repoName }}",
                },
                {
                  name: "description",
                  value: "={{ $json.description }}",
                },
                {
                  name: "private",
                  value: false,
                },
                {
                  name: "auto_init",
                  value: true,
                },
              ],
            },
          },
          id: "create-repo",
          name: "Create Repository",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4.1,
          position: [460, 300],
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: "={{ $json }}",
          },
          id: "respond",
          name: "Respond to Webhook",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [680, 300],
        },
      ],
      connections: {
        "Webhook Trigger": {
          main: [
            [
              {
                node: "Create Repository",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "Create Repository": {
          main: [
            [
              {
                node: "Respond to Webhook",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
      },
      active: false,
      settings: {},
      versionId: "1",
    };
  }

  getBulkUpdateWorkflow() {
    return {
      name: "Bulk Update",
      nodes: [
        {
          parameters: {
            rule: {
              interval: [
                {
                  field: "hours",
                  hoursInterval: 24,
                },
              ],
            },
          },
          id: "schedule-trigger",
          name: "Schedule Trigger",
          type: "n8n-nodes-base.scheduleTrigger",
          typeVersion: 1.1,
          position: [240, 300],
        },
        {
          parameters: {
            authentication: "genericCredentialType",
            genericAuthType: "httpHeaderAuth",
            url: "https://api.github.com/user/repos",
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: "Authorization",
                  value: "token {{ $credentials.githubToken }}",
                },
                {
                  name: "Accept",
                  value: "application/vnd.github.v3+json",
                },
              ],
            },
          },
          id: "list-repos",
          name: "List Repositories",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4.1,
          position: [460, 300],
        },
        {
          parameters: {
            jsCode:
              "// Process repositories for bulk update\nconst repos = $input.first().json;\nconst prefix = process.env.REPO_PREFIX || 'transformed-site';\n\nconst transformedRepos = repos.filter(repo => \n  repo.name.startsWith(prefix)\n);\n\nreturn transformedRepos.map(repo => ({\n  json: {\n    name: repo.name,\n    full_name: repo.full_name,\n    html_url: repo.html_url,\n    description: repo.description\n  }\n}));",
          },
          id: "filter-repos",
          name: "Filter Repositories",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [680, 300],
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: "={{ $json }}",
          },
          id: "respond",
          name: "Respond to Webhook",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [900, 300],
        },
      ],
      connections: {
        "Schedule Trigger": {
          main: [
            [
              {
                node: "List Repositories",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "List Repositories": {
          main: [
            [
              {
                node: "Filter Repositories",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "Filter Repositories": {
          main: [
            [
              {
                node: "Respond to Webhook",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
      },
      active: false,
      settings: {},
      versionId: "1",
    };
  }

  async createN8nConfig() {
    const config = {
      database: {
        type: "sqlite",
        location: "./data/database.sqlite",
      },
      credentials: {
        overwrite: {
          data: {
            saveDataErrorExecution: "all",
            saveDataSuccessExecution: "all",
            saveManualExecutions: true,
            executionDataMaxAge: 336,
          },
        },
      },
      workflows: {
        defaultName: "My workflow",
      },
      nodes: {
        exclude: [],
        errorTriggerType: "n8n-nodes-base.errorTrigger",
      },
      endpoints: {
        rest: "rest",
        webhook: "webhook",
        webhookWaiting: "webhook-waiting",
        webhookTest: "webhook-test",
      },
      publicApi: {
        enabled: false,
      },
      personalization: {
        enabled: true,
      },
      security: {
        audit: {
          daysAbandonedWorkflow: 90,
        },
      },
    };

    const configPath = path.join(__dirname, "..", "n8n.config.json");
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log("📄 Created n8n configuration");
  }

  async createStartupScript() {
    const startupScript = `#!/bin/bash

# Eddie n8n Startup Script
echo "🚀 Starting Eddie Website Transformation System..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Create necessary directories
mkdir -p data
mkdir -p logs
mkdir -p workflows

# Start n8n
echo "🌐 Starting n8n..."
npx n8n start --tunnel

echo "✅ Eddie system is running!"
echo "📊 n8n UI: http://localhost:${this.n8nPort}"
echo "🔗 Webhook URL: ${this.n8nUrl}/webhook"
`;

    const scriptPath = path.join(__dirname, "..", "start.sh");
    await fs.writeFile(scriptPath, startupScript);
    await fs.chmod(scriptPath, "755");
    console.log("📄 Created startup script: start.sh");
  }
}

module.exports = {
  N8nSetup,
  setupN8n: async () => {
    const setup = new N8nSetup();
    return await setup.setupN8n();
  },
};
