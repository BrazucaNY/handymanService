import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

def process_photos():
    uploads = [
        {
            "src": "C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1791155060656.jpg",
            "dst": "assets/images/before-after/leather_recliner_armchair_assembly_white_plains_before.webp"
        },
        {
            "src": "C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1791155067348.jpg",
            "dst": "assets/images/before-after/leather_recliner_armchair_assembly_white_plains_after.webp"
        }
    ]

    for item in uploads:
        src = item["src"]
        dst = item["dst"]
        if os.path.exists(src):
            img = Image.open(src)
            # Ensure RGB
            if img.mode != 'RGB':
                img = img.convert('RGB')
            # Save optimized WebP
            img.save(dst, 'WEBP', quality=85, optimize=True)
            print(f"[SUCCESS] Converted and saved: {dst}")

            # Delete original source file immediately per Rule 3
            os.remove(src)
            print(f"[CLEANUP] Deleted original source file: {src}")
        else:
            print(f"[WARNING] Source file not found or already deleted: {src}")

if __name__ == '__main__':
    process_photos()
