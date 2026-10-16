import os
import sys
import glob
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    root_dir = "."
    images_dir = os.path.join("assets", "images")

    # 1. Gather all image files in assets/images
    all_images = []
    for root, dirs, files in os.walk(images_dir):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in ['.webp', '.jpg', '.jpeg', '.png', '.svg', '.gif', '.ico']:
                rel_path = os.path.relpath(os.path.join(root, f), root_dir).replace('\\', '/')
                all_images.append(rel_path)

    print(f"Total image files found in assets/images: {len(all_images)}")

    # 2. Gather all code/markup files
    code_files = []
    for ext in ['*.html', '*.js', '*.css', '*.json', '*.xml']:
        code_files.extend(glob.glob(f"**/{ext}", recursive=True))

    # Exclude node_modules, .git, scratch, dist if any
    filtered_code = []
    for f in code_files:
        fn = f.replace('\\', '/')
        if any(x in fn for x in ['.git/', 'node_modules/', '.gemini/']):
            continue
        filtered_code.append(f)

    print(f"Total code/markup files scanned: {len(filtered_code)}")

    # Read all content into memory
    file_contents = {}
    for cf in filtered_code:
        try:
            with open(cf, 'r', encoding='utf-8', errors='ignore') as f:
                file_contents[cf] = f.read()
        except Exception as e:
            pass

    # 3. Check usage of each image
    used_images = []
    unused_images = []

    for img in all_images:
        filename = os.path.basename(img)
        # Check if basename or relative path is in any file
        is_used = False
        for cf, content in file_contents.items():
            if filename in content:
                is_used = True
                break

        if is_used:
            used_images.append(img)
        else:
            unused_images.append(img)

    print("\n" + "="*50)
    print("IMAGE AUDIT RESULTS")
    print("="*50)
    print(f"Total images: {len(all_images)}")
    print(f"Actively Used Images: {len(used_images)}")
    print(f"Unused / Orphaned Images: {len(unused_images)}")

    if unused_images:
        print("\nList of UNUSED images:")
        for u in unused_images:
            size_kb = os.path.getsize(u) / 1024
            print(f"  - {u} ({size_kb:.1f} KB)")
    else:
        print("\nAll images in assets/images are actively referenced and serving website content!")

if __name__ == '__main__':
    main()
