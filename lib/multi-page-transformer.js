const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { URL } = require("url");

class MultiPageTransformer {
  constructor() {
    this.timeout = parseInt(process.env.TRANSFORMATION_TIMEOUT) || 30000;
    this.maxDepth = parseInt(process.env.MAX_CRAWL_DEPTH) || 3;
    this.maxPages = parseInt(process.env.MAX_PAGES) || 50;
    this.visitedUrls = new Set();
    this.pages = new Map();
    this.assets = new Map();
    this.baseUrl = null;
    this.domain = null;
  }

  async transformWebsite(url) {
    console.log(`🔍 Starting multi-page transformation of: ${url}`);

    try {
      this.baseUrl = new URL(url);
      this.domain = this.baseUrl.hostname;

      // Step 1: Crawl and discover all pages
      console.log("📄 Discovering pages...");
      await this.crawlWebsite(url);

      // Step 2: Download and transform each page
      console.log("🔄 Transforming pages...");
      await this.transformAllPages();

      // Step 3: Download and organize assets
      console.log("📦 Organizing assets...");
      await this.downloadAssets();

      // Step 4: Convert to structured JSON
      console.log("📋 Converting to structured JSON...");
      const siteData = this.convertToJSON();

      // Step 5: Save JSON data to repository
      console.log("💾 Saving structured data...");
      this.saveJSONData(siteData);

      // Step 6: Rebuild with modern styling
      console.log("🎨 Rebuilding with modern styling...");
      const modernPages = this.rebuildWithModernStyling(siteData);

      // Step 7: Rewrite links for GitHub Pages compatibility
      console.log("🔗 Rewriting links...");
      await this.rewriteLinks();

      // Step 8: Generate final structure
      console.log("🏗️ Generating final structure...");
      const finalStructure = this.generateFinalStructure(modernPages);

      console.log(
        `✅ Multi-page transformation completed! Found ${this.pages.size} pages`
      );
      return finalStructure;
    } catch (error) {
      console.error(`❌ Multi-page transformation failed:`, error.message);
      throw error;
    }
  }

  async crawlWebsite(startUrl, depth = 0) {
    if (depth > this.maxDepth || this.visitedUrls.size >= this.maxPages) {
      return;
    }

    if (this.visitedUrls.has(startUrl)) {
      return;
    }

    this.visitedUrls.add(startUrl);
    console.log(`  📄 Crawling: ${startUrl} (depth: ${depth})`);

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(startUrl, {
        waitUntil: "networkidle2",
        timeout: this.timeout,
      });

      // Extract page content and metadata
      const pageData = await page.evaluate(() => {
        return {
          title: document.title,
          description:
            document.querySelector('meta[name="description"]')?.content || "",
          keywords:
            document.querySelector('meta[name="keywords"]')?.content || "",
          canonical:
            document.querySelector('link[rel="canonical"]')?.href || "",
          ogTitle:
            document.querySelector('meta[property="og:title"]')?.content || "",
          ogDescription:
            document.querySelector('meta[property="og:description"]')
              ?.content || "",
          ogImage:
            document.querySelector('meta[property="og:image"]')?.content || "",
          html: document.documentElement.outerHTML,
        };
      });

      // Store page data
      this.pages.set(startUrl, {
        url: startUrl,
        html: pageData.html,
        metadata: {
          title: pageData.title,
          description: pageData.description,
          keywords: pageData.keywords,
          canonical: pageData.canonical,
          ogTitle: pageData.ogTitle,
          ogDescription: pageData.ogDescription,
          ogImage: pageData.ogImage,
        },
        depth: depth,
        path: this.urlToPath(startUrl),
      });

      // Find internal links to crawl
      const internalLinks = await page.evaluate((baseDomain) => {
        const links = Array.from(document.querySelectorAll("a[href]"));
        return links
          .map((link) => {
            try {
              const href = link.getAttribute("href");
              if (!href) return null;

              const url = new URL(href, window.location.href);
              return url.href;
            } catch (e) {
              return null;
            }
          })
          .filter((url) => url && url.includes(baseDomain))
          .filter(
            (url) =>
              !url.includes("#") &&
              !url.includes("mailto:") &&
              !url.includes("tel:")
          )
          .slice(0, 20); // Limit links per page
      }, this.domain);

      await browser.close();

      // Recursively crawl internal links
      for (const link of internalLinks) {
        if (!this.visitedUrls.has(link)) {
          await this.crawlWebsite(link, depth + 1);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to crawl ${startUrl}:`, error.message);
    }
  }

  async transformAllPages() {
    for (const [url, pageData] of this.pages) {
      try {
        console.log(`  🔄 Transforming: ${pageData.path}`);

        const $ = cheerio.load(pageData.html);

        // Clean up the HTML
        this.cleanupHTML($);

        // Enhance the HTML structure
        this.enhanceHTML($, pageData.metadata, url);

        // Store the transformed HTML
        pageData.transformedHTML = $.html();
      } catch (error) {
        console.warn(`⚠️ Failed to transform ${url}:`, error.message);
      }
    }
  }

  async downloadAssets() {
    const assetUrls = new Set();

    // Collect only IMAGE URLs from all pages (content only, no CSS/JS)
    for (const [url, pageData] of this.pages) {
      const $ = cheerio.load(pageData.transformedHTML);

      // Find images only (content, not styling)
      $("img[src]").each((i, el) => {
        const src = $(el).attr("src");
        if (src) {
          try {
            const assetUrl = new URL(src, url).href;
            if (assetUrl.includes(this.domain)) {
              assetUrls.add(assetUrl);
            }
          } catch (e) {}
        }
      });
    }

    // Download assets
    for (const assetUrl of assetUrls) {
      try {
        console.log(`  📦 Downloading asset: ${assetUrl}`);
        const response = await axios.get(assetUrl, { timeout: 10000 });
        const assetPath = this.urlToAssetPath(assetUrl);
        this.assets.set(assetUrl, {
          content: response.data,
          path: assetPath,
          type: this.getAssetType(assetUrl),
        });
      } catch (error) {
        console.warn(`⚠️ Failed to download asset ${assetUrl}:`, error.message);
      }
    }
  }

  async rewriteLinks() {
    for (const [url, pageData] of this.pages) {
      const $ = cheerio.load(pageData.transformedHTML);

      // Rewrite internal links
      $("a[href]").each((i, el) => {
        const href = $(el).attr("href");
        if (href) {
          try {
            const linkUrl = new URL(href, url);
            if (linkUrl.hostname === this.domain) {
              const newPath = this.urlToPath(linkUrl.href);
              $(el).attr("href", newPath);
            }
          } catch (e) {}
        }
      });

      // Rewrite asset links
      $("link[href], script[src], img[src]").each((i, el) => {
        const attr = $(el).attr("href") || $(el).attr("src");
        if (attr) {
          try {
            const assetUrl = new URL(attr, url);
            if (assetUrl.hostname === this.domain) {
              const assetPath = this.urlToAssetPath(assetUrl.href);
              if ($(el).attr("href")) {
                $(el).attr("href", `assets/${assetPath}`);
              } else {
                $(el).attr("src", `assets/${assetPath}`);
              }
            }
          } catch (e) {}
        }
      });

      pageData.finalHTML = $.html();
    }
  }

  saveJSONData(siteData) {
    // Store the JSON data for later use in generateFinalStructure
    this.siteData = siteData;
    console.log("  💾 Structured data prepared for deployment");
  }

  generateFinalStructure(modernPages = null) {
    const structure = {
      pages: {},
      assets: {},
      globalCSS: this.generateModernCSS(),
      globalJS: this.generateModernJS(),
      navigation: this.generateNavigation(),
    };

    // Use modern pages if provided, otherwise use original pages
    const pagesToUse = modernPages || this.pages;

    // Add all pages
    for (const [url, pageData] of pagesToUse) {
      structure.pages[pageData.path] = {
        html: pageData.html,
        metadata: pageData.metadata,
        originalUrl: url,
      };
    }

    // Add all assets
    for (const [url, assetData] of this.assets) {
      structure.assets[assetData.path] = {
        content: assetData.content,
        type: assetData.type,
        originalUrl: url,
      };
    }

    // Add the structured JSON data as a file
    if (this.siteData) {
      structure.assets["site-data.json"] = {
        content: JSON.stringify(this.siteData, null, 2),
        type: "json",
        originalUrl: "generated",
      };
      console.log("  📄 Added site-data.json to repository");
    }

    return structure;
  }

  urlToPath(url) {
    try {
      const urlObj = new URL(url);
      let path = urlObj.pathname;

      // Remove leading slash
      if (path.startsWith("/")) {
        path = path.slice(1);
      }

      // Remove trailing slash and add .html if needed
      if (path === "/" || path === "") {
        return "index.html";
      }

      if (path.endsWith("/")) {
        path = path.slice(0, -1);
      }

      if (!path.includes(".")) {
        path += ".html";
      }

      // Clean up the path
      path = path.replace(/[^a-zA-Z0-9._/-]/g, "-");

      return path;
    } catch (e) {
      return "index.html";
    }
  }

  urlToAssetPath(url) {
    try {
      const urlObj = new URL(url);
      let path = urlObj.pathname;

      // Remove leading slash
      if (path.startsWith("/")) {
        path = path.slice(1);
      }

      // Clean up the path
      path = path.replace(/[^a-zA-Z0-9._/-]/g, "-");

      return path;
    } catch (e) {
      return "asset";
    }
  }

  getAssetType(url) {
    const ext = path.extname(url).toLowerCase();
    if ([".css"].includes(ext)) return "css";
    if ([".js"].includes(ext)) return "js";
    if ([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"].includes(ext))
      return "image";
    if ([".woff", ".woff2", ".ttf", ".eot"].includes(ext)) return "font";
    return "other";
  }

  cleanupHTML($) {
    // Remove unwanted elements
    $('script[src*="analytics"]').remove();
    $('script[src*="tracking"]').remove();
    $('script[src*="ads"]').remove();
    $('iframe[src*="ads"]').remove();
    $(".advertisement, .ads, .ad-banner").remove();
    $("noscript").remove();

    // Remove inline styles that might conflict
    $("*").removeAttr("style");

    // Clean up classes
    $("*").each(function () {
      const classes = $(this).attr("class");
      if (classes) {
        const cleanClasses = classes
          .split(" ")
          .filter((cls) => !cls.includes("ad-") && !cls.includes("tracking"))
          .join(" ");
        $(this).attr("class", cleanClasses || null);
      }
    });
  }

  enhanceHTML($, metadata, originalUrl) {
    // Add modern HTML5 structure
    if (!$("html").attr("lang")) {
      $("html").attr("lang", "en");
    }

    // Enhance head section
    $("head").prepend(`
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
    `);

    // Add modern meta tags
    $("head").append(`
      <meta name="theme-color" content="#2563eb">
      <meta name="robots" content="index, follow">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    `);

    // Add CSS and JS links
    $("head").append(`
      <link rel="stylesheet" href="assets/global.css">
      <script src="assets/global.js" defer></script>
    `);

    // Enhance main content structure
    if (!$("main").length) {
      $("body").wrapInner("<main></main>");
    }

    // Add modern navigation if none exists
    if (!$("nav").length) {
      $("main").prepend(`
        <nav class="modern-nav">
          <div class="nav-container">
            <a href="index.html" class="nav-brand">${
              metadata.title || "Transformed Site"
            }</a>
            <div class="nav-links">
              <a href="index.html">Home</a>
              <a href="about.html">About</a>
              <a href="contact.html">Contact</a>
            </div>
          </div>
        </nav>
      `);
    }

    // Add footer
    if (!$("footer").length) {
      $("main").after(`
        <footer class="modern-footer">
          <div class="footer-container">
            <p>&copy; ${new Date().getFullYear()} ${
        metadata.title || "Transformed Site"
      }</p>
            <p>Transformed from <a href="${originalUrl}" target="_blank" rel="noopener">original site</a></p>
          </div>
        </footer>
      `);
    }
  }

  generateGlobalCSS() {
    return `
/* Modern CSS Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background-color: #ffffff;
  overflow-x: hidden;
}

/* Modern Navigation */
.modern-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.nav-brand:hover {
  opacity: 0.8;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-links a:hover {
  opacity: 0.8;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: white;
  transition: width 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
}

/* Main Content */
main {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 1rem;
  color: #1f2937;
}

h1 {
  font-size: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 2rem;
}

h2 {
  font-size: 2.25rem;
  color: #374151;
}

h3 {
  font-size: 1.875rem;
  color: #4b5563;
}

p {
  margin-bottom: 1.5rem;
  color: #6b7280;
  font-size: 1.1rem;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

/* Cards */
.card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Grid System */
.grid {
  display: grid;
  gap: 2rem;
}

.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* Modern Footer */
.modern-footer {
  background: #1f2937;
  color: white;
  padding: 2rem 0;
  margin-top: 4rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.footer-container p {
  margin-bottom: 0.5rem;
  color: #d1d5db;
}

.footer-container a {
  color: #60a5fa;
  text-decoration: none;
}

.footer-container a:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.75rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .card {
    padding: 1.5rem;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Enhanced existing elements */
img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: #764ba2;
}

/* Form elements */
input, textarea, select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 2rem 0;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

/* Lists */
ul, ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

li {
  margin-bottom: 0.5rem;
  color: #6b7280;
}

/* Code blocks */
code {
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}

pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

pre code {
  background: none;
  padding: 0;
  color: inherit;
}
`;
  }

  generateGlobalJS() {
    return `
// Enhanced JavaScript for transformed website
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Transformed multi-page website loaded successfully');
  
  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Add fade-in animation to elements
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
      }
    });
  }, observerOptions);
  
  // Observe all sections and cards
  document.querySelectorAll('section, .card, h1, h2, h3').forEach(el => {
    observer.observe(el);
  });
  
  // Add loading states to buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.type === 'submit' || this.href === '#') {
        this.style.opacity = '0.7';
        this.style.pointerEvents = 'none';
        
        setTimeout(() => {
          this.style.opacity = '1';
          this.style.pointerEvents = 'auto';
        }, 1000);
      }
    });
  });
  
  // Add mobile menu toggle if needed
  const navLinks = document.querySelector('.nav-links');
  if (navLinks && window.innerWidth <= 768) {
    const menuToggle = document.createElement('button');
    menuToggle.innerHTML = '☰';
    menuToggle.className = 'menu-toggle';
    menuToggle.style.cssText = \`
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      display: block;
    \`;
    
    const navContainer = document.querySelector('.nav-container');
    navContainer.appendChild(menuToggle);
    
    menuToggle.addEventListener('click', () => {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
    
    navLinks.style.display = 'none';
    navLinks.style.flexDirection = 'column';
    navLinks.style.gap = '1rem';
    navLinks.style.marginTop = '1rem';
  }
  
  // Add form enhancements
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Add loading state
      const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.value || submitBtn.textContent;
        submitBtn.value = 'Sending...';
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
          alert('Thank you for your message! (This is a demo)');
          submitBtn.value = originalText;
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          form.reset();
        }, 2000);
      }
    });
  });
  
  // Add image lazy loading
  document.querySelectorAll('img').forEach(img => {
    if (!img.loading) {
      img.loading = 'lazy';
    }
  });
  
  // Add performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log(\`Page loaded in \${loadTime}ms\`);
    });
  }
  
  // Add error handling for external resources
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      this.style.display = 'none';
      console.warn('Failed to load image:', this.src);
    });
  });
  
  // Add keyboard navigation improvements
  document.addEventListener('keydown', function(e) {
    // ESC key to close any open modals or menus
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal, .dropdown').forEach(el => {
        el.style.display = 'none';
      });
    }
  });
  
  // Add accessibility improvements
  document.querySelectorAll('a, button').forEach(element => {
    if (!element.getAttribute('aria-label') && !element.textContent.trim()) {
      element.setAttribute('aria-label', 'Interactive element');
    }
  });
  
  // Add focus management
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });
  
  document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
  });
  
  console.log('✨ Enhanced JavaScript features loaded');
});

// Add CSS for keyboard navigation
const style = document.createElement('style');
style.textContent = \`
  .keyboard-navigation *:focus {
    outline: 2px solid #667eea !important;
    outline-offset: 2px !important;
  }
  
  .menu-toggle {
    display: none;
  }
  
  @media (max-width: 768px) {
    .menu-toggle {
      display: block !important;
    }
  }
\`;
document.head.appendChild(style);
`;
  }

  generateNavigation() {
    const navItems = [];
    for (const [url, pageData] of this.pages) {
      navItems.push({
        title: pageData.metadata.title || "Page",
        path: pageData.path,
        originalUrl: url,
      });
    }
    return navItems;
  }

  convertToJSON() {
    console.log("  📋 Extracting structured data from pages...");

    try {
      // Get the main page (first page) for site-wide metadata
      const mainPageUrl = Array.from(this.pages.keys())[0];
      const mainPageData = this.pages.get(mainPageUrl);
      const $main = mainPageData ? cheerio.load(mainPageData.html) : null;

      const siteData = {
        metadata: {
          domain: this.domain,
          baseUrl: this.baseUrl?.href || "",
          totalPages: this.pages.size,
          totalAssets: this.assets.size,
          crawledAt: new Date().toISOString(),
          // Add site-wide metadata from the main page
          title:
            mainPageData?.metadata?.title ||
            ($main ? $main("title").text() : "") ||
            this.domain,
          description:
            mainPageData?.metadata?.description ||
            ($main ? $main('meta[name="description"]').attr("content") : "") ||
            "",
          keywords:
            mainPageData?.metadata?.keywords ||
            ($main ? $main('meta[name="keywords"]').attr("content") : "") ||
            "",
        },
        pages: [],
        assets: [],
        navigation: this.generateNavigation(),
      };

      // Convert pages to structured data
      for (const [url, originalPageData] of this.pages) {
        const $ = cheerio.load(originalPageData.html);

        const structuredPageData = {
          url: url,
          path: originalPageData.path,
          title:
            originalPageData.metadata.title || $("title").text() || "Untitled",
          description:
            originalPageData.metadata.description ||
            $('meta[name="description"]').attr("content") ||
            "",
          keywords:
            originalPageData.metadata.keywords ||
            $('meta[name="keywords"]').attr("content") ||
            "",

          // Extract ONLY content - no styling, no layout
          content: {
            headings: this.extractHeadings($),
            paragraphs: this.extractParagraphs($),
            images: this.extractImages($),
            links: this.extractLinks($),
            lists: this.extractLists($),
            tables: this.extractTables($),
            forms: this.extractForms($),
            // Add content blocks for better structure
            contentBlocks: this.extractContentBlocks($),
          },

          // Remove layout structure - we don't care about the original layout
          // Remove originalHtml - we don't need the old styling
        };

        siteData.pages.push(structuredPageData);
      }

      // Convert assets to structured data
      for (const [url, assetData] of this.assets) {
        siteData.assets.push({
          url: url,
          path: assetData.path,
          type: assetData.type,
          size: assetData.content ? Buffer.byteLength(assetData.content) : 0,
          contentType: this.getContentType(assetData.path),
        });
      }

      console.log(
        `  ✅ Extracted data from ${siteData.pages.length} pages and ${siteData.assets.length} assets`
      );
      return siteData;
    } catch (error) {
      console.error("  ❌ Error in convertToJSON:", error.message);
      console.error("  Stack trace:", error.stack);
      throw error;
    }
  }

  rebuildWithModernStyling(siteData) {
    console.log("  🎨 Applying modern design patterns...");

    const modernPages = new Map();

    for (const structuredPageData of siteData.pages) {
      const modernHtml = this.generateModernHTML(structuredPageData, siteData);
      modernPages.set(structuredPageData.url, {
        path: structuredPageData.path,
        html: modernHtml,
        metadata: {
          title: structuredPageData.title,
          description: structuredPageData.description,
          keywords: structuredPageData.keywords,
        },
      });
    }

    console.log(`  ✅ Rebuilt ${modernPages.size} pages with modern styling`);
    return modernPages;
  }

  // Helper methods for content extraction
  extractHeadings($) {
    const headings = [];
    $("h1, h2, h3, h4, h5, h6").each((i, el) => {
      headings.push({
        level: parseInt(el.tagName.substring(1)),
        text: $(el).text().trim(),
        id: $(el).attr("id") || "",
      });
    });
    return headings;
  }

  extractParagraphs($) {
    const paragraphs = [];
    $("p").each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 0) {
        paragraphs.push(text);
      }
    });
    return paragraphs;
  }

  extractContentBlocks($) {
    const contentBlocks = [];

    // Remove navigation, header, footer, sidebar elements
    $(
      "nav, header, footer, .nav, .navigation, .header, .footer, .sidebar, .menu"
    ).remove();

    // Extract main content areas
    $("main, .main, .content, .container, article, section").each((i, el) => {
      const $block = $(el);
      const text = $block.text().trim();

      if (text.length > 50) {
        // Only meaningful content blocks
        contentBlocks.push({
          type: el.tagName.toLowerCase(),
          className: $block.attr("class") || "",
          text: text,
          // Extract any headings within this block
          headings: $block
            .find("h1, h2, h3, h4, h5, h6")
            .map((i, h) => ({
              level: parseInt(h.tagName.substring(1)),
              text: $(h).text().trim(),
            }))
            .get(),
          // Extract any paragraphs within this block
          paragraphs: $block
            .find("p")
            .map((i, p) => $(p).text().trim())
            .get()
            .filter((p) => p.length > 0),
        });
      }
    });

    return contentBlocks;
  }

  extractImages($) {
    const images = [];
    $("img").each((i, el) => {
      const src = $(el).attr("src");
      if (src) {
        // Skip decorative images (icons, logos, etc.)
        const alt = $(el).attr("alt") || "";
        const className = $(el).attr("class") || "";

        // Only include content images, not decorative ones
        if (
          !className.includes("icon") &&
          !className.includes("logo") &&
          !className.includes("decoration") &&
          !alt.toLowerCase().includes("icon") &&
          !alt.toLowerCase().includes("logo")
        ) {
          images.push({
            src: src,
            alt: alt,
            title: $(el).attr("title") || "",
            // Remove width/height - we'll style these ourselves
          });
        }
      }
    });
    return images;
  }

  extractLinks($) {
    const links = [];
    $("a[href]").each((i, el) => {
      const href = $(el).attr("href");
      if (href) {
        const text = $(el).text().trim();
        const className = $(el).attr("class") || "";

        // Skip navigation links, focus on content links
        if (
          !className.includes("nav") &&
          !className.includes("menu") &&
          !className.includes("header") &&
          !className.includes("footer") &&
          text.length > 0
        ) {
          links.push({
            href: href,
            text: text,
            title: $(el).attr("title") || "",
            isExternal: href.startsWith("http") && !href.includes(this.domain),
          });
        }
      }
    });
    return links;
  }

  extractLists($) {
    const lists = [];
    $("ul, ol").each((i, el) => {
      const items = [];
      $(el)
        .find("li")
        .each((j, li) => {
          items.push($(li).text().trim());
        });
      lists.push({
        type: el.tagName.toLowerCase(),
        items: items,
      });
    });
    return lists;
  }

  extractTables($) {
    const tables = [];
    $("table").each((i, el) => {
      const rows = [];
      $(el)
        .find("tr")
        .each((j, tr) => {
          const cells = [];
          $(tr)
            .find("td, th")
            .each((k, cell) => {
              cells.push($(cell).text().trim());
            });
          rows.push(cells);
        });
      tables.push({ rows });
    });
    return tables;
  }

  extractForms($) {
    const forms = [];
    $("form").each((i, el) => {
      const inputs = [];
      $(el)
        .find("input, textarea, select")
        .each((j, input) => {
          inputs.push({
            type: $(input).attr("type") || input.tagName.toLowerCase(),
            name: $(input).attr("name") || "",
            placeholder: $(input).attr("placeholder") || "",
            required: $(input).attr("required") !== undefined,
          });
        });
      forms.push({
        action: $(el).attr("action") || "",
        method: $(el).attr("method") || "get",
        inputs: inputs,
      });
    });
    return forms;
  }

  extractHeader($) {
    const header = $("header, .header, #header").first();
    if (header.length) {
      return {
        html: header.html(),
        text: header.text().trim(),
      };
    }
    return null;
  }

  extractFooter($) {
    const footer = $("footer, .footer, #footer").first();
    if (footer.length) {
      return {
        html: footer.html(),
        text: footer.text().trim(),
      };
    }
    return null;
  }

  extractSidebar($) {
    const sidebar = $(".sidebar, #sidebar, aside").first();
    if (sidebar.length) {
      return {
        html: sidebar.html(),
        text: sidebar.text().trim(),
      };
    }
    return null;
  }

  extractMainContent($) {
    const main = $("main, .main, #main, .content, #content").first();
    if (main.length) {
      return {
        html: main.html(),
        text: main.text().trim(),
      };
    }
    return null;
  }

  getContentType(path) {
    const ext = path.split(".").pop().toLowerCase();
    const types = {
      css: "text/css",
      js: "application/javascript",
      html: "text/html",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      svg: "image/svg+xml",
      pdf: "application/pdf",
    };
    return types[ext] || "application/octet-stream";
  }

  generateModernHTML(structuredPageData, siteData) {
    const isHomepage = structuredPageData.path === "index.html";

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${structuredPageData.title}</title>
    <meta name="description" content="${structuredPageData.description}">
    <meta name="keywords" content="${structuredPageData.keywords}">
    
    <!-- Modern CSS Framework -->
    <link rel="stylesheet" href="assets/modern.css">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Meta tags -->
    <meta property="og:title" content="${structuredPageData.title}">
    <meta property="og:description" content="${structuredPageData.description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${structuredPageData.url}">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${structuredPageData.title}">
    <meta name="twitter:description" content="${
      structuredPageData.description
    }">
</head>
<body>
    <!-- Modern Header -->
    <header class="modern-header">
        <nav class="nav-container">
            <div class="nav-brand">
                <a href="index.html" class="brand-link">
                    <span class="brand-text">${siteData.metadata.domain}</span>
                </a>
            </div>
            <div class="nav-menu">
                ${this.generateModernNavigation(
                  siteData.navigation,
                  structuredPageData.path
                )}
            </div>
            <div class="nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>

    <!-- Main Content -->
    <main class="modern-main">
        <div class="container">
            ${this.generateModernContent(structuredPageData)}
        </div>
    </main>

    <!-- Modern Footer -->
    <footer class="modern-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>${siteData.metadata.domain}</h3>
                    <p>Transformed with modern design and enhanced functionality.</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    ${this.generateFooterLinks(siteData.navigation)}
                </div>
                <div class="footer-section">
                    <h4>About</h4>
                    <p>This site was transformed using Eddie Website Transformer.</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} ${
      siteData.metadata.domain
    }. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Modern JavaScript -->
    <script src="assets/modern.js"></script>
</body>
</html>`;
  }

  generateModernNavigation(navigation, currentPath) {
    return navigation
      .map(
        (item) =>
          `<a href="${item.path}" class="nav-link ${
            item.path === currentPath ? "active" : ""
          }">${item.title}</a>`
      )
      .join("");
  }

  generateModernContent(structuredPageData) {
    let content = "";

    // Add page title if not homepage
    if (structuredPageData.path !== "index.html" && structuredPageData.title) {
      content += `<div class="page-header">
        <h1 class="page-title">${structuredPageData.title}</h1>
        ${
          structuredPageData.description
            ? `<p class="page-description">${structuredPageData.description}</p>`
            : ""
        }
      </div>`;
    }

    // Add main content sections
    if (structuredPageData.content.headings.length > 0) {
      content += '<div class="content-sections">';
      structuredPageData.content.headings.forEach((heading) => {
        if (heading.level === 1 && structuredPageData.path === "index.html") {
          content += `<h1 class="hero-title">${heading.text}</h1>`;
        } else {
          content += `<h${heading.level} class="content-heading">${heading.text}</h${heading.level}>`;
        }
      });
      content += "</div>";
    }

    // Add paragraphs
    if (structuredPageData.content.paragraphs.length > 0) {
      content += '<div class="content-text">';
      structuredPageData.content.paragraphs.forEach((paragraph) => {
        content += `<p class="content-paragraph">${paragraph}</p>`;
      });
      content += "</div>";
    }

    // Add images
    if (structuredPageData.content.images.length > 0) {
      content += '<div class="content-images">';
      structuredPageData.content.images.forEach((image) => {
        content += `<img src="${image.src}" alt="${image.alt}" class="content-image" loading="lazy">`;
      });
      content += "</div>";
    }

    return content;
  }

  generateFooterLinks(navigation) {
    return navigation
      .slice(0, 5)
      .map(
        (item) => `<a href="${item.path}" class="footer-link">${item.title}</a>`
      )
      .join("");
  }

  generateModernCSS() {
    return `
/* Modern CSS Framework - Eddie Website Transformer */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #3b82f6;
  --primary-dark: #1d4ed8;
  --secondary-color: #6366f1;
  --accent-color: #f59e0b;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-light: #9ca3af;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-dark: #111827;
  --border-color: #e5e7eb;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  overflow-x: hidden;
}

/* Modern Header */
.modern-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand .brand-link {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.nav-brand .brand-link:hover {
  opacity: 0.8;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 4px;
}

.nav-toggle span {
  width: 25px;
  height: 3px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Main Content */
.modern-main {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

/* Hero Section */
.hero-title {
  font-size: 4rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Content Sections */
.content-sections {
  margin-bottom: 2rem;
}

.content-heading {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.content-text {
  margin-bottom: 2rem;
}

.content-paragraph {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

/* Images */
.content-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.content-image {
  width: 100%;
  height: auto;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.content-image:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

/* Modern Footer */
.modern-footer {
  background: linear-gradient(135deg, var(--bg-dark) 0%, #1f2937 100%);
  color: white;
  padding: 3rem 0 1rem 0;
  margin-top: 4rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
  color: white;
}

.footer-section p {
  color: #d1d5db;
  line-height: 1.6;
}

.footer-link {
  display: block;
  color: #d1d5db;
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--primary-color);
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding-top: 1rem;
  text-align: center;
  color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .nav-toggle {
    display: flex;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .content-images {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-sections,
.content-text,
.content-images {
  animation: fadeInUp 0.6s ease-out;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus styles */
.nav-link:focus,
.footer-link:focus {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .modern-header,
  .modern-footer {
    display: none;
  }
  
  .modern-main {
    padding: 0;
  }
  
  .content-image {
    box-shadow: none;
  }
}
`;
  }

  generateModernJS() {
    return `
// Modern JavaScript - Eddie Website Transformer
document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Lazy loading for images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  // Add loading states
  const images = document.querySelectorAll('.content-image');
  images.forEach(img => {
    img.addEventListener('load', function() {
      this.style.opacity = '1';
    });
    
    img.addEventListener('error', function() {
      this.style.opacity = '0.5';
      this.alt = 'Image failed to load';
    });
  });
  
  // Add scroll effects
  let lastScrollTop = 0;
  const header = document.querySelector('.modern-header');
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down
      header.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up
      header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
  });
  
  // Add keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });
  
  document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
  });
  
  // Performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
      }, 0);
    });
  }
  
  // Add error handling
  window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
  });
  
  // Add service worker registration (if available)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        console.log('ServiceWorker registration successful');
      }).catch(function(err) {
        console.log('ServiceWorker registration failed');
      });
    });
  }
});

// Add CSS for keyboard navigation
const style = document.createElement('style');
style.textContent = \`
.keyboard-navigation *:focus {
  outline: 2px solid var(--accent-color) !important;
  outline-offset: 2px !important;
}

.nav-menu.active {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  padding: 1rem;
  box-shadow: var(--shadow-lg);
}

.nav-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.nav-toggle.active span:nth-child(2) {
  opacity: 0;
}

.nav-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.modern-header {
  transition: transform 0.3s ease;
}

.content-image {
  opacity: 0;
  transition: opacity 0.3s ease;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
}
\`;
document.head.appendChild(style);
`;
  }
}

module.exports = {
  MultiPageTransformer,
  transformMultiPageWebsite: async (url) => {
    const transformer = new MultiPageTransformer();
    return await transformer.transformWebsite(url);
  },
};
