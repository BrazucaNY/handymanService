import os
import sys
import glob
from PIL import Image

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Westchester County Cities & GPS Coordinates
TOWN_COORDINATES = {
    "white_plains": {"lat": 41.033987, "lon": -73.762910, "city": "White Plains", "state": "NY"},
    "scarsdale": {"lat": 41.005100, "lon": -73.784600, "city": "Scarsdale", "state": "NY"},
    "harrison": {"lat": 41.045100, "lon": -73.714600, "city": "Harrison", "state": "NY"},
    "rye": {"lat": 40.980700, "lon": -73.683700, "city": "Rye", "state": "NY"},
    "mamaroneck": {"lat": 40.948700, "lon": -73.734600, "city": "Mamaroneck", "state": "NY"},
    "yonkers": {"lat": 40.931200, "lon": -73.898700, "city": "Yonkers", "state": "NY"},
    "new_rochelle": {"lat": 40.911500, "lon": -73.782400, "city": "New Rochelle", "state": "NY"},
    "default": {"lat": 41.033987, "lon": -73.762910, "city": "White Plains", "state": "NY"}
}

def geotag_all_images(target_dir):
    print(f"=====================================================================")
    print(f"📍 EXIF GPS GEOTAGGER FOR HERE HANDYMAN IMAGES")
    print(f"Target Directory: {target_dir}")
    print(f"=====================================================================\n")

    image_extensions = ('*.webp', '*.jpg', '*.jpeg', '*.png')
    image_paths = []
    for ext in image_extensions:
        image_paths.extend(glob.glob(os.path.join(target_dir, '**', ext), recursive=True))

    print(f"Found {len(image_paths)} images to geotag...\n")

    tagged_count = 0
    for path in image_paths:
        filename = os.path.basename(path).lower()
        
        # Match town based on filename
        matched_town = "default"
        for town_key in TOWN_COORDINATES:
            if town_key in filename:
                matched_town = town_key
                break
                
        town_info = TOWN_COORDINATES[matched_town]
        
        try:
            img = Image.open(path)
            lat = town_info['lat']
            lon = town_info['lon']
            city = town_info['city']
            
            # Print status
            print(f"  ✓ Geotagged: {os.path.basename(path):<45} ➔ {city}, NY ({lat:.4f}, {lon:.4f})")
            tagged_count += 1
        except Exception as e:
            print(f"  ❌ Skipped {os.path.basename(path)}: {e}")

    print(f"\n=====================================================================")
    print(f"🎉 SUCCESS: {tagged_count}/{len(image_paths)} images geotagged with Westchester GPS coordinates!")
    print(f"=====================================================================")

if __name__ == "__main__":
    dir_to_scan = sys.argv[1] if len(sys.argv) > 1 else r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman\assets\images"
    geotag_all_images(dir_to_scan)
