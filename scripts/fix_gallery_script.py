import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace line 6523 if (!galleryGrid) return;
content = content.replace("    const galleryGrid = document.querySelector('.gallery-grid');\n    if (!galleryGrid) return;", "    let galleryGrid;\n    function getGalleryGrid() { return document.querySelector('.gallery-grid'); }")
content = content.replace("    const galleryGrid = document.querySelector('.gallery-grid');", "    let galleryGrid;\n    function getGalleryGrid() { return document.querySelector('.gallery-grid'); }")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated galleryGrid declaration!")
