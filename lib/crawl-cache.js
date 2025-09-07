const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");

/**
 * Smart crawl cache system to avoid recrawling websites unnecessarily
 */
class CrawlCache {
  constructor() {
    this.cacheDir = path.join(__dirname, "..", ".crawl-cache");
    this.cacheFile = path.join(this.cacheDir, "crawl-metadata.json");
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate a unique cache key for a website
   */
  generateCacheKey(url, options = {}) {
    const normalizedUrl = this.normalizeUrl(url);
    const optionsHash = crypto
      .createHash("md5")
      .update(JSON.stringify(options))
      .digest("hex")
      .substring(0, 8);

    return `${normalizedUrl}-${optionsHash}`;
  }

  /**
   * Normalize URL for consistent cache keys
   */
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      // Remove trailing slash and normalize protocol
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname.replace(
        /\/$/,
        ""
      )}`;
    } catch (error) {
      return url;
    }
  }

  /**
   * Load cache metadata
   */
  async loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        return await fs.readJson(this.cacheFile);
      }
    } catch (error) {
      console.warn("⚠️ Failed to load crawl cache:", error.message);
    }
    return {};
  }

  /**
   * Save cache metadata
   */
  async saveCache(cache) {
    try {
      await fs.writeJson(this.cacheFile, cache, { spaces: 2 });
    } catch (error) {
      console.warn("⚠️ Failed to save crawl cache:", error.message);
    }
  }

  /**
   * Check if a website has been crawled recently
   */
  async hasRecentCrawl(url, options = {}, maxAgeHours = 24) {
    const cache = await this.loadCache();
    const cacheKey = this.generateCacheKey(url, options);
    const entry = cache[cacheKey];

    if (!entry) {
      return false;
    }

    const now = new Date();
    const crawlTime = new Date(entry.timestamp);
    const ageHours = (now - crawlTime) / (1000 * 60 * 60);

    return ageHours < maxAgeHours;
  }

  /**
   * Get crawl metadata for a website
   */
  async getCrawlMetadata(url, options = {}) {
    const cache = await this.loadCache();
    const cacheKey = this.generateCacheKey(url, options);
    return cache[cacheKey] || null;
  }

  /**
   * Record a successful crawl
   */
  async recordCrawl(url, options = {}, metadata = {}) {
    const cache = await this.loadCache();
    const cacheKey = this.generateCacheKey(url, options);

    cache[cacheKey] = {
      url: this.normalizeUrl(url),
      timestamp: new Date().toISOString(),
      options,
      metadata: {
        pagesCount: metadata.pagesCount || 0,
        assetsCount: metadata.assetsCount || 0,
        crawlDepth: metadata.crawlDepth || 0,
        maxPages: metadata.maxPages || 0,
        ...metadata,
      },
    };

    await this.saveCache(cache);
  }

  /**
   * Check if crawl is needed based on various conditions
   */
  async shouldCrawl(url, options = {}, forceRecrawl = false) {
    if (forceRecrawl) {
      console.log("🔄 Force recrawl requested");
      return true;
    }

    const hasRecent = await this.hasRecentCrawl(url, options);
    if (hasRecent) {
      const metadata = await this.getCrawlMetadata(url, options);
      console.log(`✅ Recent crawl found (${metadata.timestamp})`);
      console.log(
        `📊 Previous crawl: ${metadata.metadata.pagesCount} pages, ${metadata.metadata.assetsCount} assets`
      );
      return false;
    }

    console.log("🆕 No recent crawl found, proceeding with crawl");
    return true;
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    const cache = await this.loadCache();
    const entries = Object.values(cache);

    return {
      totalEntries: entries.length,
      oldestEntry:
        entries.length > 0
          ? Math.min(...entries.map((e) => new Date(e.timestamp)))
          : null,
      newestEntry:
        entries.length > 0
          ? Math.max(...entries.map((e) => new Date(e.timestamp)))
          : null,
      totalPages: entries.reduce(
        (sum, e) => sum + (e.metadata.pagesCount || 0),
        0
      ),
      totalAssets: entries.reduce(
        (sum, e) => sum + (e.metadata.assetsCount || 0),
        0
      ),
    };
  }

  /**
   * Clean old cache entries
   */
  async cleanCache(maxAgeHours = 168) {
    // Default: 1 week
    const cache = await this.loadCache();
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, entry] of Object.entries(cache)) {
      const entryTime = new Date(entry.timestamp);
      const ageHours = (now - entryTime) / (1000 * 60 * 60);

      if (ageHours > maxAgeHours) {
        delete cache[key];
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      await this.saveCache(cache);
      console.log(`🧹 Cleaned ${cleanedCount} old cache entries`);
    }

    return cleanedCount;
  }

  /**
   * Clear all cache
   */
  async clearCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        await fs.remove(this.cacheFile);
        console.log("🗑️ Crawl cache cleared");
      }
    } catch (error) {
      console.warn("⚠️ Failed to clear crawl cache:", error.message);
    }
  }
}

module.exports = { CrawlCache };
