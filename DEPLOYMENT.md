# Eddie Deployment Guide

This guide will help you deploy and use the Eddie Website Transformation System.

## Prerequisites

- Node.js 16+ installed
- GitHub account with Personal Access Token
- Basic understanding of n8n workflows

## Quick Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd eddie
npm install
```

### 2. Configure Environment

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# GitHub Configuration
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_USERNAME=your_github_username
GITHUB_ORG=your_github_org_name  # Optional, leave empty for personal account

# Repository Configuration
REPO_PREFIX=transformed-site
REPO_DESCRIPTION=Transformed website deployed via Eddie
DEFAULT_BRANCH=main
```

### 3. Initialize System

```bash
npm run setup
```

### 4. Start n8n

```bash
npm start
```

Access n8n at: http://localhost:5678

## Usage Examples

### Transform a Single Website

```bash
# Basic transformation
node scripts/transform.js --url "https://example.com"

# With custom name and description
node scripts/transform.js --url "https://example.com" --name "my-awesome-site" --description "My transformed website"
```

### Bulk Operations

```bash
# Update all repositories
npm run update-repos

# Force update all repositories (ignores 24-hour cooldown)
npm run update-repos -- --force

# Deploy all repositories to GitHub Pages
npm run deploy -- --all
```

### List and Manage Repositories

```bash
# List all transformed repositories
node index.js list-repos

# Deploy specific repository
npm run deploy -- --repo "transformed-site-20241201-example-com"
```

## n8n Workflow Integration

### Import Workflows

1. Open n8n at http://localhost:5678
2. Go to Workflows → Import from File
3. Import each workflow from `./workflows/` directory:
   - `website-ingestion.json`
   - `website-transformation.json`
   - `github-deployment.json`
   - `bulk-update.json`

### Webhook Endpoints

After importing workflows, you'll have these webhook endpoints:

- `POST /webhook/ingest-website` - Ingest website content
- `POST /webhook/transform-website` - Transform website content
- `POST /webhook/deploy-to-github` - Deploy to GitHub
- Scheduled bulk updates (runs every 24 hours)

### Using Webhooks

```bash
# Ingest a website
curl -X POST http://localhost:5678/webhook/ingest-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Transform website content
curl -X POST http://localhost:5678/webhook/transform-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "html": "<html>...</html>", "metadata": {...}}'
```

## Repository Naming Convention

Repositories follow this pattern:

```
{REPO_PREFIX}-{YYYYMMDD}-{domain-with-dashes}
```

Examples:

- `transformed-site-20241201-example-com`
- `transformed-site-20241201-github-io`
- `transformed-site-20241201-mycompany-com`

## GitHub Pages URLs

Each transformed repository gets a GitHub Pages URL:

```
https://{GITHUB_USERNAME}.github.io/{REPO_NAME}
```

## Automation Examples

### Daily Updates

Set up a cron job to update all repositories daily:

```bash
# Add to crontab (crontab -e)
0 2 * * * cd /path/to/eddie && npm run update-repos
```

### CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
name: Update Transformed Sites
on:
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npm run update-repos
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Monitoring and Logs

### Update Logs

Check update status in `./logs/update-log.json`:

```json
{
  "transformed-site-20241201-example-com": {
    "lastUpdated": "2024-12-01T10:30:00.000Z",
    "originalUrl": "https://example.com",
    "status": "success"
  }
}
```

### Error Handling

- Failed transformations are logged with error details
- Retry mechanism for failed updates
- Rate limiting to avoid GitHub API limits

## Customization

### Custom CSS Templates

Edit `lib/website-transformer.js` to modify the generated CSS:

```javascript
generateModernCSS($, metadata) {
  // Your custom CSS here
  return `
    /* Custom styles */
    .my-custom-class { ... }
  `;
}
```

### Custom JavaScript

Modify the JavaScript generation in the same file:

```javascript
generateEnhancedJS($, metadata) {
  // Your custom JavaScript here
  return `
    // Custom functionality
    console.log('Custom script loaded');
  `;
}
```

### Repository Templates

Customize repository creation in `lib/github-manager.js`:

```javascript
generateReadme(originalUrl, repoFullName, isUpdate = false) {
  // Your custom README template
  return `# My Custom Template...`;
}
```

## Troubleshooting

### Common Issues

1. **GitHub API Rate Limits**

   - Solution: Add delays between requests
   - Check: `MAX_CONCURRENT_TRANSFORMATIONS` setting

2. **n8n Not Starting**

   - Check: Port 5678 is available
   - Solution: Change `N8N_PORT` in `.env`

3. **Repository Creation Fails**

   - Check: GitHub token has repo permissions
   - Check: Repository name doesn't already exist

4. **Website Scraping Fails**
   - Check: Website is accessible
   - Solution: Increase `TRANSFORMATION_TIMEOUT`

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm start
```

### Health Check

Test system health:

```bash
# Test GitHub connection
node -e "const {GitHubManager} = require('./lib/github-manager'); new GitHubManager().listRepositories().then(console.log)"

# Test website transformation
node scripts/transform.js --url "https://httpbin.org/html"
```

## Security Considerations

- Keep GitHub token secure
- Use environment variables for sensitive data
- Regularly rotate access tokens
- Monitor repository access logs
- Consider using GitHub Apps for better security

## Scaling

For high-volume usage:

1. **Database**: Switch from SQLite to PostgreSQL
2. **Queue**: Add Redis for job queuing
3. **Load Balancing**: Use multiple n8n instances
4. **Monitoring**: Add Prometheus/Grafana
5. **Caching**: Implement Redis caching for transformations

## Support

- Check logs in `./logs/` directory
- Review n8n workflow execution logs
- Monitor GitHub API usage
- Check repository creation permissions
