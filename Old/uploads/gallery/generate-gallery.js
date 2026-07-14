const fs = require('fs');
const path = require('path');

// Use current folder since you're running inside 'gallery'
const galleryDir = path.join(__dirname, '.'); 

// Get all image files in the folder
const images = fs.readdirSync(galleryDir)
  .filter(file => /\.(jpe?g|png|webp|gif)$/i.test(file)) // only images
  .map(file => `uploads/gallery/${file}`); // relative path for website

// Save as gallery.json
fs.writeFileSync('gallery.json', JSON.stringify(images, null, 2));

console.log(`gallery.json generated with ${images.length} images.`);
