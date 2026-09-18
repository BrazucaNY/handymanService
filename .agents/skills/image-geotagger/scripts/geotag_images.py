import os
import sys
import glob
from PIL import Image
import piexif

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Westchester Cities & GPS Coordinates
TOWN_COORDINATES = {
    "white_plains": {"lat": 41.033987, "lon": -73.762910, "city": "White Plains"},
    "scarsdale": {"lat": 41.005100, "lon": -73.784600, "city": "Scarsdale"},
    "harrison": {"lat": 41.045100, "lon": -73.714600, "city": "Harrison"},
    "rye": {"lat": 40.980700, "lon": -73.683700, "city": "Rye"},
    "mamaroneck": {"lat": 40.948700, "lon": -73.734600, "city": "Mamaroneck"},
    "yonkers": {"lat": 40.931200, "lon": -73.898700, "city": "Yonkers"},
    "new_rochelle": {"lat": 40.911500, "lon": -73.782400, "city": "New Rochelle"},
    "default": {"lat": 41.033987, "lon": -73.762910, "city": "White Plains"}
}

SERVICE_NAMES = {
    "tv": "TV Mounting & Cable Management",
    "furniture": "Furniture Assembly",
    "drywall": "Drywall & Hole Repair",
    "painting": "Interior Painting",
    "electrical": "Light Fixture & Electrical Repair",
    "plumbing": "Plumbing & Faucet Repair",
    "bathroom": "Bathroom Renovation & Repair",
    "door": "Door Repair & Installation",
    "carpentry": "Carpentry & Shelving",
    "gutter": "Fall Gutter Cleaning",
    "default": "Handyman Home Repair"
}

def to_exif_deg(val):
    abs_val = abs(val)
    d = int(abs_val)
    m = int((abs_val - d) * 60)
    s = int(round((abs_val - d - m/60.0) * 3600.0 * 100))
    return ((d, 1), (m, 1), (s, 100))

def build_exif_dict(title, city, lat, lon):
    tags_str = f"handyman; {city} NY; TV mounting; furniture assembly; drywall repair; Westchester County; Here Handyman; home repair; local handyman"
    
    # Encode Windows XP metadata fields (UTF-16LE with null terminator)
    xp_title = f"{title}\0".encode('utf-16le')
    xp_comment = f"Here Handyman local repair services in {city} NY. Visit https://www.herehandyman.com or Call (516) 350-0801\0".encode('utf-16le')
    xp_author = f"David - Here Handyman\0".encode('utf-16le')
    xp_keywords = f"{tags_str}\0".encode('utf-16le')
    xp_subject = f"{title}\0".encode('utf-16le')

    zeroth_ifd = {
        piexif.ImageIFD.ImageDescription: f"{title}. Professional handyman services in {city}, NY by Here Handyman. Call (516) 350-0801 or visit https://www.herehandyman.com.".encode('utf-8'),
        piexif.ImageIFD.Make: b"Here Handyman",
        piexif.ImageIFD.Model: b"Here Handyman Local SEO Engine",
        piexif.ImageIFD.Artist: b"David - Here Handyman",
        piexif.ImageIFD.Copyright: b"Copyright (c) 2026 Here Handyman (https://www.herehandyman.com). All Rights Reserved.",
        piexif.ImageIFD.Software: b"Here Handyman Image Geotagger",
        # Windows File Explorer Specific Tags (XPTitle, XPComment, XPAuthor, XPKeywords, XPSubject)
        40091: xp_title,
        40092: xp_comment,
        40093: xp_author,
        40094: xp_keywords,
        40095: xp_subject
    }
    
    exif_ifd = {
        piexif.ExifIFD.UserComment: f"Title: {title} | Author: Here Handyman | Tags: {tags_str} | URL: https://www.herehandyman.com".encode('utf-8')
    }
    
    gps_ifd = {
        piexif.GPSIFD.GPSLatitudeRef: b'N' if lat >= 0 else b'S',
        piexif.GPSIFD.GPSLatitude: to_exif_deg(lat),
        piexif.GPSIFD.GPSLongitudeRef: b'E' if lon >= 0 else b'W',
        piexif.GPSIFD.GPSLongitude: to_exif_deg(lon),
    }
    
    return {"0th": zeroth_ifd, "Exif": exif_ifd, "GPS": gps_ifd}

def process_images(target_dir):
    print("=====================================================================")
    print("📍 WINDOWS TAGS & EXIF EMBEDDER FOR HERE HANDYMAN IMAGES")
    print(f"Target Directory: {target_dir}")
    print("=====================================================================\n")

    extensions = ('*.jpg', '*.jpeg', '*.webp', '*.png')
    files = []
    for ext in extensions:
        files.extend(glob.glob(os.path.join(target_dir, '**', ext), recursive=True))

    print(f"Found {len(files)} total images to add Tags...\n")

    success_count = 0
    for path in files:
        filename = os.path.basename(path).lower()
        
        # Match city
        matched_city_key = "default"
        for city_key in TOWN_COORDINATES:
            if city_key in filename:
                matched_city_key = city_key
                break
        city_data = TOWN_COORDINATES[matched_city_key]
        
        # Match service
        matched_service = "default"
        for svc_key in SERVICE_NAMES:
            if svc_key in filename:
                matched_service = svc_key
                break
        svc_title = SERVICE_NAMES[matched_service]
        
        title = f"{svc_title} in {city_data['city']}, NY | Here Handyman"
        
        try:
            exif_dict = build_exif_dict(title, city_data['city'], city_data['lat'], city_data['lon'])
            exif_bytes = piexif.dump(exif_dict)
            
            img = Image.open(path)
            
            if path.lower().endswith(('.jpg', '.jpeg')):
                img.save(path, "jpeg", exif=exif_bytes, quality=95)
                print(f"  ✓ Added Windows Tags (JPEG): {os.path.basename(path):<40} ➔ Tags: handyman, {city_data['city']} NY")
                success_count += 1
            else:
                img.save(path, exif=exif_bytes, quality=95)
                print(f"  ✓ Added Windows Tags:        {os.path.basename(path):<40} ➔ Tags: handyman, {city_data['city']} NY")
                success_count += 1
                
        except Exception as e:
            try:
                img = Image.open(path)
                img.save(path, quality=95)
                print(f"  ✓ Refreshed Image:          {os.path.basename(path):<40}")
                success_count += 1
            except Exception as e2:
                print(f"  ❌ Error on {os.path.basename(path)}: {e2}")

    print(f"\n=====================================================================")
    print(f"🎉 COMPLETED: {success_count}/{len(files)} images updated with Windows Tags, Keywords, Subject & Title!")
    print(f"=====================================================================")

if __name__ == "__main__":
    scan_dir = sys.argv[1] if len(sys.argv) > 1 else r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman\assets\images"
    process_images(scan_dir)
