import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

def process_photos():
    uploads = [
        {
            "src": "C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1790614820249.jpg",
            "dst": "assets/images/portfolio/front_door_handle_deadbolt_lock_white_plains.webp"
        },
        {
            "src": "C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1790614820253.jpg",
            "dst": "assets/images/portfolio/smart_lock_deadbolt_door_installation_scarsdale.webp"
        },
        {
            "src": "C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1790614820272.jpg",
            "dst": "assets/images/before-after/patio_exterior_painting_makeover_white_plains_before.webp"
        },
        {
            "src": "C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1790614820388.jpg",
            "dst": "assets/images/before-after/patio_exterior_painting_makeover_white_plains_after.webp"
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
