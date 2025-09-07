const fs = require('fs-extra');
const path = require('path');

/**
 * Normalizer that converts any site scrape to Eddie's canonical schema
 */

/**
 * Convert existing website data to Eddie schema v1
 */
async function normalizeToEddieSchema(websiteData) {
  const { metadata, pages, assets } = websiteData;
  const { domain, title, description, keywords } = metadata;
  
  // Compute brand seed color (for now, use arts theme)
  const brandSeed = computeBrandSeed(domain, title, description);
  
  // Create navigation from pages
  const nav = pages.map((page, index) => ({
    title: page.title || `Page ${index + 1}`,
    slug: page.path || `page-${index + 1}`,
  }));
  
  // Convert pages to Eddie format
  const eddiePages = pages.map((page, index) => {
    const sections = [];
    
    // Add hero section if page has images
    if (page.content.images.length > 0) {
      const heroImage = page.content.images[0];
      sections.push({
        type: 'heading',
        level: 1,
        text: page.title || `Page ${index + 1}`,
      });
      
      sections.push({
        type: 'image',
        src: heroImage.src,
        alt: heroImage.alt || '',
        caption: heroImage.title || '',
      });
    } else {
      sections.push({
        type: 'heading',
        level: 1,
        text: page.title || `Page ${index + 1}`,
      });
    }
    
    // Add description as paragraph
    if (page.description && page.description.trim()) {
      sections.push({
        type: 'paragraph',
        text: page.description,
      });
    }
    
    // Add headings
    page.content.headings.forEach(heading => {
      sections.push({
        type: 'heading',
        level: heading.level,
        text: heading.text,
      });
    });
    
    // Add paragraphs
    page.content.paragraphs.forEach(paragraph => {
      if (paragraph.text && paragraph.text.trim()) {
        sections.push({
          type: 'paragraph',
          text: paragraph.text,
        });
      }
    });
    
    // Add images as gallery if multiple
    if (page.content.images.length > 1) {
      sections.push({
        type: 'gallery',
        items: page.content.images.map(img => img.src),
      });
    } else if (page.content.images.length === 1 && !sections.some(s => s.type === 'image')) {
      const img = page.content.images[0];
      sections.push({
        type: 'image',
        src: img.src,
        alt: img.alt || '',
        caption: img.title || '',
      });
    }
    
    // Add links as buttons
    page.content.links.forEach(link => {
      if (link.href && link.text) {
        sections.push({
          type: 'button',
          text: link.text,
          href: link.href,
        });
      }
    });
    
    // Add lists
    page.content.lists.forEach(list => {
      if (list.items && list.items.length > 0) {
        sections.push({
          type: 'list',
          items: list.items,
        });
      }
    });
    
    return {
      slug: page.path || `page-${index + 1}`,
      title: page.title || `Page ${index + 1}`,
      hero: page.content.images.length > 0 ? {
        title: page.title || `Page ${index + 1}`,
        subtitle: page.description || '',
        image: page.content.images[0].src,
      } : undefined,
      sections,
    };
  });
  
  // Create Eddie document
  const eddieDoc = {
    version: '1.0',
    site: {
      title: title || domain,
      description: description || '',
      brandSeed: brandSeed,
      logo: pages.find(p => p.content.images.length > 0)?.content.images[0]?.src,
    },
    nav,
    pages: eddiePages,
  };
  
  return eddieDoc;
}

/**
 * Compute brand seed color based on content
 */
function computeBrandSeed(domain, title, description) {
  const content = `${domain} ${title} ${description}`.toLowerCase();
  
  // Arts/Culture theme
  if (content.includes('art') || content.includes('culture') || content.includes('museum') || 
      content.includes('gallery') || content.includes('creative') || content.includes('bayou')) {
    return '#9C27B0'; // Purple
  }
  
  // Business theme
  if (content.includes('business') || content.includes('corporate') || content.includes('company')) {
    return '#2196F3'; // Blue
  }
  
  // Education theme
  if (content.includes('education') || content.includes('school') || content.includes('university') || 
      content.includes('learning') || content.includes('academic')) {
    return '#4CAF50'; // Green
  }
  
  // Health theme
  if (content.includes('health') || content.includes('medical') || content.includes('hospital') || 
      content.includes('wellness') || content.includes('care')) {
    return '#E91E63'; // Pink
  }
  
  // Tech theme
  if (content.includes('tech') || content.includes('software') || content.includes('digital') || 
      content.includes('app') || content.includes('web')) {
    return '#FF9800'; // Orange
  }
  
  // Default theme
  return '#5F6FFF'; // Default blue
}

/**
 * Validate Eddie document against schema
 */
function validateEddieDoc(doc) {
  // Basic validation
  if (!doc.version || doc.version !== '1.0') {
    throw new Error('Invalid version: must be "1.0"');
  }
  
  if (!doc.site || !doc.site.title) {
    throw new Error('Site title is required');
  }
  
  if (!doc.nav || !Array.isArray(doc.nav) || doc.nav.length === 0) {
    throw new Error('Navigation is required and must be non-empty');
  }
  
  if (!doc.pages || !Array.isArray(doc.pages) || doc.pages.length === 0) {
    throw new Error('Pages are required and must be non-empty');
  }
  
  // Validate each page
  doc.pages.forEach((page, index) => {
    if (!page.slug || !page.title || !page.sections) {
      throw new Error(`Page ${index + 1} is missing required fields: slug, title, or sections`);
    }
    
    if (!Array.isArray(page.sections)) {
      throw new Error(`Page ${index + 1} sections must be an array`);
    }
    
    // Validate sections
    page.sections.forEach((section, sectionIndex) => {
      if (!section.type) {
        throw new Error(`Page ${index + 1}, Section ${sectionIndex + 1} is missing type`);
      }
      
      const validTypes = ['heading', 'paragraph', 'image', 'gallery', 'list', 'quote', 'button', 'html'];
      if (!validTypes.includes(section.type)) {
        throw new Error(`Page ${index + 1}, Section ${sectionIndex + 1} has invalid type: ${section.type}`);
      }
    });
  });
  
  return true;
}

module.exports = {
  normalizeToEddieSchema,
  computeBrandSeed,
  validateEddieDoc,
};
