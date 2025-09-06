# Eddie - Website to Flutter App Generator

A powerful tool that extracts website content and rebuilds it as a modern Flutter app deployed to GitHub Pages.

## Features

- 📋 **Website Extraction**: Crawl and extract all content from websites
- 📄 **JSON Output**: Convert website content to structured JSON format
- 🎨 **Flutter Rebuild**: Generate modern Flutter app from extracted data
- 🌐 **GitHub Pages**: Deploy Flutter web app to free hosting
- 📱 **Cross-Platform**: Works on Web, iOS, and Android

## Quick Start

1. **Setup Environment**

   ```bash
   cp env.example .env
   # Edit .env with your GitHub token and username
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

## Quick Start

### One Command to Rule Them All

```bash
# Generate from any website (uses GitHub Actions)
npm run generate -- --url "https://example.com"

# Or use predefined websites
npm run example
npm run github
```

### How It Works

1. **Extracts** website content to JSON
2. **Creates** GitHub repository with Flutter template
3. **Deploys** via GitHub Actions (automatic Flutter build)
4. **Result**: Live Flutter app on GitHub Pages

### Advanced Options

```bash
# Custom app name
npm run generate -- --url "https://example.com" --name "my-awesome-app"

# Custom description
npm run generate -- --url "https://example.com" --description "My custom Flutter app"

# Limit crawling (faster)
npm run generate -- --url "https://example.com" --depth 1 --max-pages 10
```

### Create Custom Website Scripts

```bash
# Copy the template
cp scripts/template.js scripts/mysite.js

# Edit the script with your website details
# Then run:
npm run mysite
```

### Manual Steps (if needed)

```bash
# Step 1: Extract website to JSON
npm run extract -- --url "https://example.com"

# Step 2: Build Flutter app
npm run build-flutter -- --repo "my-website-data"
```

## Options

```bash
# Custom repository name
npm run extract -- --url "https://example.com" --name "my-flutter-app"

# Custom description
npm run extract -- --url "https://example.com" --description "My Flutter app"

# Limit crawling (faster)
npm run extract -- --url "https://example.com" --depth 1 --max-pages 10
```

## Output

- ✅ **GitHub Repository** with extracted data
- ✅ **JSON file** (`site-data.json`) with all website content
- ✅ **Flutter App** with modern Material Design 3 UI
- ✅ **GitHub Pages** live Flutter web app
- ✅ **Cross-Platform** - works on Web, iOS, Android

## Architecture

- **Node.js**: Website extraction and GitHub API integration
- **Flutter**: Modern cross-platform app generation
- **GitHub Pages**: Free hosting for Flutter web apps
- **Material Design 3**: Modern, responsive UI components

## Configuration

Edit `.env` file to configure:

- `GITHUB_TOKEN`: Your GitHub personal access token
- `GITHUB_USERNAME`: Your GitHub username
- `REPO_PREFIX`: Prefix for repository names (default: "flutter-app")
- `MAX_CRAWL_DEPTH`: Maximum crawl depth (default: 2)
- `MAX_PAGES`: Maximum pages to crawl (default: 20)

## Repository Naming Convention

Repositories follow the pattern: `{REPO_PREFIX}-{timestamp}-{domain}`

Example: `flutter-app-20241201-example-com`
