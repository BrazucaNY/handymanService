const fs = require('fs');
const path = require('path');

const baseDir = 'assets/images';
const categories = ['carpentry', 'painting', 'electrical', 'plumbing', 'repairs'];

const galleryList = [];

categories.forEach(cat => {
  const dir = path.join(baseDir, cat);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    // Sort files numerically
    files.sort((a, b) => {
      const numA = parseInt(path.parse(a).name);
      const numB = parseInt(path.parse(b).name);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });
    
    files.forEach(file => {
      if (/\.(webp|jpg|jpeg|png)$/i.test(file)) {
        const indexName = path.parse(file).name;
        const index = parseInt(indexName) || 1;
        galleryList.push({
          category: cat,
          src: `assets/images/${cat}/${file}`,
          index: index
        });
      }
    });
  }
});

console.log(`Found ${galleryList.length} images across categories.`);

// Read index.html
let html = fs.readFileSync('index.html', 'utf8');

// Target the start of interactive gallery loader logic
const startKey = "let currentIndex = 0;\n    let imagesList = [];\n    const localGalleryImages = []; // Stores loaded images metadata";
const endKey = "// Restore fallback items in case folders are completely empty";

const startIndex = html.indexOf(startKey);
const endIndex = html.indexOf(endKey);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not locate injection placeholders inside index.html!");
  process.exit(1);
}

// Format the new script block content
const newScriptBlock = `let currentIndex = 0;
    let imagesList = [];
    
    // Injected static gallery files mapping
    const localGalleryImages = ${JSON.stringify(galleryList, null, 2).replace(/\n/g, '\n    ')};

    // Append image dynamically to DOM
    function addGalleryItemDOM(category, src, index) {
      const item = document.createElement('div');
      item.className = \`gallery-item \${category}\`;
      
      // Make the first carpentry image tall for layout asymmetry
      const isFirstCarpentry = (category === 'carpentry' && src.endsWith('1.webp'));
      if (isFirstCarpentry) {
        item.classList.add('tall');
      }
      
      const badge = document.createElement('div');
      badge.className = 'gallery-badge';
      badge.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      
      const img = document.createElement('img');
      img.src = src;
      img.alt = \`\${category} project photo \${index}\`;
      img.setAttribute('loading', 'lazy');
      img.setAttribute('width', isFirstCarpentry ? '600' : '400');
      img.setAttribute('height', isFirstCarpentry ? '900' : '267');
      
      const label = document.createElement('div');
      label.className = 'gallery-label';
      label.textContent = \`\${category.charAt(0).toUpperCase() + category.slice(1)} Project #\${index}\`;
      
      item.appendChild(badge);
      item.appendChild(img);
      item.appendChild(label);
      galleryGrid.appendChild(item);
    }

    // Main loader loop
    function loadAllGalleryImages() {
      // Clear static fallbacks
      galleryGrid.innerHTML = '';
      
      localGalleryImages.forEach(img => {
        addGalleryItemDOM(img.category, img.src, img.index);
      });
      
      // If we loaded no images (e.g. offline or empty folders), reload fallback static items!
      if (localGalleryImages.length === 0) {
        restoreStaticFallback();
      } else {
        filterGalleryDOM('all');
      }
    }

    `;

const updatedHtml = html.substring(0, startIndex) + newScriptBlock + html.substring(endIndex);

fs.writeFileSync('index.html', updatedHtml, 'utf8');
console.log("Injected static array successfully into index.html!");
