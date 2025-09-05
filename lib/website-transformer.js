const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

class WebsiteTransformer {
  constructor() {
    this.timeout = parseInt(process.env.TRANSFORMATION_TIMEOUT) || 30000;
  }

  async transformWebsite(url) {
    console.log(`🔍 Analyzing website: ${url}`);
    
    try {
      // Scrape the website
      const { html, metadata } = await this.scrapeWebsite(url);
      
      // Transform the content
      const transformedContent = await this.transformContent(html, metadata, url);
      
      console.log(`✅ Website transformation completed`);
      return transformedContent;
    } catch (error) {
      console.error(`❌ Transformation failed for ${url}:`, error.message);
      throw error;
    }
  }

  async scrapeWebsite(url) {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: this.timeout 
      });

      // Extract metadata
      const metadata = await page.evaluate(() => {
        return {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content || '',
          keywords: document.querySelector('meta[name="keywords"]')?.content || '',
          viewport: document.querySelector('meta[name="viewport"]')?.content || '',
          canonical: document.querySelector('link[rel="canonical"]')?.href || '',
          ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
          ogDescription: document.querySelector('meta[property="og:description"]')?.content || '',
          ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
          twitterCard: document.querySelector('meta[name="twitter:card"]')?.content || '',
          favicon: document.querySelector('link[rel="icon"]')?.href || document.querySelector('link[rel="shortcut icon"]')?.href || ''
        };
      });

      // Get the HTML content
      const html = await page.content();
      
      return { html, metadata };
    } finally {
      await browser.close();
    }
  }

  async transformContent(html, metadata, originalUrl) {
    const $ = cheerio.load(html);
    
    // Remove unwanted elements
    this.cleanupHTML($);
    
    // Enhance the HTML structure
    this.enhanceHTML($, metadata, originalUrl);
    
    // Generate modern CSS
    const css = this.generateModernCSS($, metadata);
    
    // Generate enhanced JavaScript
    const js = this.generateEnhancedJS($, metadata);
    
    // Finalize HTML
    const finalHTML = this.finalizeHTML($, metadata, originalUrl);
    
    return {
      html: finalHTML,
      css: css,
      js: js,
      metadata: metadata
    };
  }

  cleanupHTML($) {
    // Remove common unwanted elements
    $('script[src*="analytics"]').remove();
    $('script[src*="tracking"]').remove();
    $('script[src*="ads"]').remove();
    $('iframe[src*="ads"]').remove();
    $('.advertisement, .ads, .ad-banner').remove();
    $('noscript').remove();
    
    // Remove inline styles that might conflict
    $('*').removeAttr('style');
    
    // Clean up classes
    $('*').each(function() {
      const classes = $(this).attr('class');
      if (classes) {
        const cleanClasses = classes
          .split(' ')
          .filter(cls => !cls.includes('ad-') && !cls.includes('tracking'))
          .join(' ');
        $(this).attr('class', cleanClasses || null);
      }
    });
  }

  enhanceHTML($, metadata, originalUrl) {
    // Add modern HTML5 structure
    if (!$('html').attr('lang')) {
      $('html').attr('lang', 'en');
    }
    
    // Enhance head section
    $('head').prepend(`
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
    `);
    
    // Add modern meta tags
    $('head').append(`
      <meta name="theme-color" content="#2563eb">
      <meta name="robots" content="index, follow">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    `);
    
    // Add CSS and JS links
    $('head').append(`
      <link rel="stylesheet" href="style.css">
      <script src="script.js" defer></script>
    `);
    
    // Enhance main content structure
    if (!$('main').length) {
      $('body').wrapInner('<main></main>');
    }
    
    // Add modern navigation if none exists
    if (!$('nav').length) {
      $('main').prepend(`
        <nav class="modern-nav">
          <div class="nav-container">
            <a href="#" class="nav-brand">${metadata.title || 'Transformed Site'}</a>
            <div class="nav-links">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </nav>
      `);
    }
    
    // Add footer
    if (!$('footer').length) {
      $('main').after(`
        <footer class="modern-footer">
          <div class="footer-container">
            <p>&copy; ${new Date().getFullYear()} ${metadata.title || 'Transformed Site'}</p>
            <p>Transformed from <a href="${originalUrl}" target="_blank" rel="noopener">original site</a></p>
          </div>
        </footer>
      `);
    }
  }

  generateModernCSS($, metadata) {
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

.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 2rem; }

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }

.p-1 { padding: 0.5rem; }
.p-2 { padding: 1rem; }
.p-3 { padding: 1.5rem; }
.p-4 { padding: 2rem; }

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

  generateEnhancedJS($, metadata) {
    return `
// Enhanced JavaScript for transformed website
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Transformed website loaded successfully');
  
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
  
  // Add touch gestures for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left
        console.log('Swipe left detected');
      } else {
        // Swipe right
        console.log('Swipe right detected');
      }
    }
  }
  
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

  finalizeHTML($, metadata, originalUrl) {
    // Ensure proper HTML5 structure
    let html = $.html();
    
    // Add transformation metadata
    const transformationMeta = \`
    <!-- Transformed by Eddie Website Transformer -->
    <!-- Original URL: \${originalUrl} -->
    <!-- Transformed: \${new Date().toISOString()} -->
    <!-- Enhanced with modern design and functionality -->
    \`;
    
    html = html.replace('<head>', \`<head>\${transformationMeta}\`);
    
    return html;
  }
}

module.exports = {
  WebsiteTransformer,
  transformWebsite: async (url) => {
    const transformer = new WebsiteTransformer();
    return await transformer.transformWebsite(url);
  }
};
