# Eddie - Website Transformation & Deployment System

A powerful n8n-based system that ingests websites, transforms them into better versions, and automatically deploys them to GitHub Pages for free hosting and demos.

## Features

- 🚀 **Website Ingestion**: Automatically scrape and analyze websites
- ✨ **AI-Powered Transformation**: Enhance websites with modern design and functionality
- 📦 **Automated Repository Creation**: Creates GitHub repos with consistent naming
- 🌐 **GitHub Pages Deployment**: Automatic deployment to free hosting
- 🔄 **Bulk Updates**: Update multiple repositories simultaneously
- ⚙️ **Configurable**: Easy customization for different use cases

## Quick Start

1. **Setup Environment**

   ```bash
   cp env.example .env
   # Edit .env with your GitHub token and configuration
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Initialize n8n Workflows**

   ```bash
   npm run setup
   ```

4. **Start the System**
   ```bash
   npm start
   ```

## Usage

### Transform a Single Website

```bash
node scripts/transform.js --url "https://example.com" --name "my-transformed-site"
```

### Bulk Repository Updates

```bash
npm run update-repos
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Configuration

Edit `.env` file to configure:

- GitHub credentials and organization
- n8n webhook URLs
- Repository naming conventions
- Transformation settings

## Architecture

- **n8n Workflows**: Handle website ingestion and transformation
- **GitHub API**: Repository creation and management
- **Puppeteer**: Website scraping and analysis
- **Cheerio**: HTML parsing and manipulation
- **GitHub Pages**: Free hosting for transformed sites

## Repository Naming Convention

Repositories follow the pattern: `{REPO_PREFIX}-{timestamp}-{domain}`

Example: `transformed-site-20241201-example-com`
