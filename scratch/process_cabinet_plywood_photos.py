import os
from PIL import Image
import piexif

def to_exif_deg(val):
    abs_val = abs(val)
    d = int(abs_val)
    m = int((abs_val - d) * 60)
    s = int(round((abs_val - d - m/60.0) * 3600.0 * 100))
    return ((d, 1), (m, 1), (s, 100))

def build_exif(title, city="White Plains", lat=41.033987, lon=-73.762910):
    tags_str = f"handyman; {city} NY; cabinet back wall repair; plywood closure; carpentry repair; Westchester County; Here Handyman"
    xp_title = f"{title}\0".encode('utf-16le')
    xp_comment = f"Here Handyman custom cabinet back wall repair and plywood closure in {city} NY. Call (516) 350-0801\0".encode('utf-16le')
    xp_author = f"David - Here Handyman\0".encode('utf-16le')
    xp_keywords = f"{tags_str}\0".encode('utf-16le')
    xp_subject = f"{title}\0".encode('utf-16le')

    zeroth_ifd = {
        piexif.ImageIFD.ImageDescription: f"{title}. Professional cabinet back wall repair in {city}, NY by Here Handyman.".encode('utf-8'),
        piexif.ImageIFD.Make: b"Here Handyman",
        piexif.ImageIFD.Model: b"Here Handyman Geotagger",
        piexif.ImageIFD.Artist: b"David - Here Handyman",
        piexif.ImageIFD.Copyright: b"Copyright (c) 2026 Here Handyman",
        40091: xp_title,
        40092: xp_comment,
        40093: xp_author,
        40094: xp_keywords,
        40095: xp_subject
    }
    exif_ifd = {
        piexif.ExifIFD.UserComment: f"Title: {title} | Author: Here Handyman | Tags: {tags_str}".encode('utf-8')
    }
    gps_ifd = {
        piexif.GPSIFD.GPSLatitudeRef: b'N',
        piexif.GPSIFD.GPSLatitude: to_exif_deg(lat),
        piexif.GPSIFD.GPSLongitudeRef: b'W',
        piexif.GPSIFD.GPSLongitude: to_exif_deg(lon),
    }
    return piexif.dump({"0th": zeroth_ifd, "Exif": exif_ifd, "GPS": gps_ifd})

# media_1790130843223.jpg is BEFORE (cutout exposing studs inside cabinet)
# media_1790130843217.jpg is AFTER (clean birch plywood panel installed)
src_before = r"C:/Users/davi6/.gemini/antigravity/brain/af47e037-656a-43eb-8ff4-ac82a7e93119/.user_uploaded/media_1790130843223.jpg"
src_after = r"C:/Users/davi6/.gemini/antigravity/brain/af47e037-656a-43eb-8ff4-ac82a7e93119/.user_uploaded/media_1790130843217.jpg"

out_ba_dir = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman\assets\images\before-after"

img_b = Image.open(src_before).convert('RGB')
img_a = Image.open(src_after).convert('RGB')

exif_b = build_exif('Cabinet Back Wall Plywood Closure Before - White Plains NY')
exif_a = build_exif('Cabinet Back Wall Plywood Closure After - White Plains NY')

webp_b_path = os.path.join(out_ba_dir, 'cabinet_back_wall_plywood_closure_white_plains_before.webp')
webp_a_path = os.path.join(out_ba_dir, 'cabinet_back_wall_plywood_closure_white_plains_after.webp')

img_b.save(webp_b_path, 'webp', quality=82, exif=exif_b)
img_a.save(webp_a_path, 'webp', quality=82, exif=exif_a)

print("SUCCESS: Processed cabinet back wall photos to WebP with EXIF geotags!")
print(f"WebP Before: {os.path.getsize(webp_b_path)} bytes")
print(f"WebP After:  {os.path.getsize(webp_a_path)} bytes")
