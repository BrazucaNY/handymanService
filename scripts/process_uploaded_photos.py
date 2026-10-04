import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

def process_photos():
    uploads = [
        {
            "src": "C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1791156467715.jpg",
            "dst": "assets/images/before-after/vizio_tv_wall_mount_installation_yonkers_before.webp"
        },
        {
            "src": "C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1791156473146.jpg",
            "dst": "assets/images/before-after/vizio_tv_wall_mount_installation_yonkers_after.webp"
        },
        {
            "src": "C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1791156470247.jpg",
            "dst": "assets/images/portfolio/vizio_tv_vesa_bracket_prep_yonkers.webp"
        },
        {
            "src": "C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1791156538618.jpg",
            "dst": "assets/images/before-after/smoke_detector_predated_installation_scarsdale_before.webp"
        },
        {
            "src": "C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1791156536794.jpg",
            "dst": "assets/images/before-after/smoke_detector_predated_installation_scarsdale_after.webp"
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
