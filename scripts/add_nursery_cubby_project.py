import os
import sys
from PIL import Image
import piexif
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def to_exif_deg(val):
    abs_val = abs(val)
    d = int(abs_val)
    m = int((abs_val - d) * 60)
    s = int(round((abs_val - d - m / 60.0) * 3600.0 * 100))
    return ((d, 1), (m, 1), (s, 100))

def build_exif_dict(title, city, lat, lon):
    tags_str = f"handyman; {city} NY; furniture assembly; nursery cubby bookcase; Westchester County; Here Handyman; home repair; local handyman"
    xp_title = f"{title}\0".encode('utf-16le')
    xp_comment = f"Here Handyman local furniture assembly in {city} NY. Visit https://www.herehandyman.com or Call (516) 350-0801\0".encode('utf-16le')
    xp_author = "David - Here Handyman\0".encode('utf-16le')
    xp_keywords = f"{tags_str}\0".encode('utf-16le')
    xp_subject = f"{title}\0".encode('utf-16le')

    zeroth_ifd = {
        piexif.ImageIFD.ImageDescription: f"{title}. Professional handyman services in {city}, NY by Here Handyman.".encode('utf-8'),
        piexif.ImageIFD.Make: b"Here Handyman",
        piexif.ImageIFD.Model: b"Here Handyman Local SEO Engine",
        piexif.ImageIFD.Artist: b"David - Here Handyman",
        piexif.ImageIFD.Copyright: b"Copyright (c) 2026 Here Handyman. All Rights Reserved.",
        piexif.ImageIFD.Software: b"Here Handyman Image Geotagger",
        0x9c9b: xp_title,
        0x9c9c: xp_comment,
        0x9c9d: xp_author,
        0x9c9e: xp_keywords,
        0x9c9f: xp_subject,
    }

    gps_ifd = {
        piexif.GPSIFD.GPSLatitudeRef: b'N' if lat >= 0 else b'S',
        piexif.GPSIFD.GPSLatitude: to_exif_deg(lat),
        piexif.GPSIFD.GPSLongitudeRef: b'E' if lon >= 0 else b'W',
        piexif.GPSIFD.GPSLongitude: to_exif_deg(lon),
        piexif.GPSIFD.GPSMapDatum: b"WGS-84",
    }

    return {"0th": zeroth_ifd, "Exif": {}, "GPS": gps_ifd, "1st": {}, "thumbnail": None}

def process_images():
    src_before = r"C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1792067884640_d162f4ba.jpg"
    src_after = r"C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1792067884622_db270339.jpg"

    dst_before = "assets/images/before-after/nursery_modular_bookcase_cubby_assembly_chappaqua_before.webp"
    dst_after = "assets/images/before-after/nursery_modular_bookcase_cubby_assembly_chappaqua_after.webp"

    lat = 41.157876
    lon = -73.765134
    city = "Chappaqua"

    # Process Before
    if os.path.exists(src_before):
        im_b = Image.open(src_before)
        if im_b.mode != 'RGB':
            im_b = im_b.convert('RGB')
        exif_dict_b = build_exif_dict("Dual Low-Profile Nursery Bookcase Unboxing & Layout Prep", city, lat, lon)
        exif_bytes_b = piexif.dump(exif_dict_b)
        im_b.save(dst_before, 'WEBP', quality=85, optimize=True, exif=exif_bytes_b)
        print(f"[OK] Saved {dst_before}")
        os.remove(src_before)
        print(f"[CLEANUP] Deleted source: {src_before}")

    # Process After
    if os.path.exists(src_after):
        im_a = Image.open(src_after)
        if im_a.mode != 'RGB':
            im_a = im_a.convert('RGB')
        exif_dict_a = build_exif_dict("Dual Low-Profile Nursery Bookcase & Modular Toy Cubby Assembly", city, lat, lon)
        exif_bytes_a = piexif.dump(exif_dict_a)
        im_a.save(dst_after, 'WEBP', quality=85, optimize=True, exif=exif_bytes_a)
        print(f"[OK] Saved {dst_after}")
        os.remove(src_after)
        print(f"[CLEANUP] Deleted source: {src_after}")

def update_gallery():
    with open('gallery.html', 'r', encoding='utf-8') as f:
        content = f.read()

    new_card = '      { id:"nursery-modular-bookcase-cubby-chappaqua", title:"Dual Low-Profile Nursery Bookcase & Modular Toy Cubby Assembly", town:"Chappaqua", place:"Chappaqua, NY (10514)", desc:"White-glove unboxing, component sorting, precision dowel and cam-lock fastening, and seamless dual modular alignment under window sill for children\'s nursery playroom.", tag:"Assembly", serviceUrl:"/furniture-assembly", before:IMG+"/nursery_modular_bookcase_cubby_assembly_chappaqua_before.webp", after:IMG+"/nursery_modular_bookcase_cubby_assembly_chappaqua_after.webp" },\n'

    if 'id:"nursery-modular-bookcase-cubby-chappaqua"' not in content:
        # Insert right after the start of PROJECTS array
        marker = 'const PROJECTS = [\n'
        content = content.replace(marker, marker + new_card)
        with open('gallery.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("[OK] Added to gallery.html")
    else:
        print("[SKIP] Already in gallery.html")

def update_index():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    new_slide = '''          <!-- Job Nursery Cubby: Dual Low-Profile Nursery Bookcase & Modular Toy Cubby Assembly — Chappaqua, NY -->
          <figure class="ba-slide" style="min-width:100%;margin:0;flex-shrink:0;position:relative">
           <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;background:#000">
            <div style="position:relative">
             <img alt="Flat-pack modular bookcase panels and assembly manual laid out on carpet before assembly in Chappaqua, NY" decoding="async" height="1024" loading="lazy" src="/assets/images/before-after/nursery_modular_bookcase_cubby_assembly_chappaqua_before.webp" style="width:100%;height:480px;object-fit:cover;display:block" width="824"/>
             <span style="position:absolute;top:14px;left:14px;background:rgba(7,24,40,0.9);color:#fff;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.2)">
              Before
             </span>
            </div>
            <div style="position:relative">
             <img alt="Dual white modular low-profile bookcase and toy cubby storage units assembled and staged under window in Chappaqua, NY" decoding="async" height="1024" loading="lazy" src="/assets/images/before-after/nursery_modular_bookcase_cubby_assembly_chappaqua_after.webp" style="width:100%;height:480px;object-fit:cover;display:block" width="824"/>
             <span style="position:absolute;top:14px;left:14px;background:#eab308;color:#071828;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px">
              After
             </span>
            </div>
           </div>
           <figcaption style="background:#0b2a4a;padding:16px 24px;color:#fff;font-size:15px;font-weight:700;text-align:center;letter-spacing:0.5px;border-top:1px solid rgba(255,255,255,0.1)">
            Dual Low-Profile Nursery Bookcase &amp; Modular Toy Cubby Assembly — Chappaqua, NY
           </figcaption>
          </figure>\n'''

    if 'Job Nursery Cubby' not in content:
        # Insert right after the ba-slides opening
        marker = '<div class="ba-slides" style="display:flex;transition:transform 0.5s ease-in-out">\n'
        content = content.replace(marker, marker + new_slide)
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("[OK] Added to index.html carousel")
    else:
        print("[SKIP] Already in index.html")

def update_furniture_page():
    with open('furniture-assembly.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Update legacy White Plains references in furniture-assembly.html
    content = content.replace(
        'Belffin Modular Sectional Sofa Assembly in White Plains NY',
        'Belffin Modular Sectional Sofa Assembly in Chappaqua NY'
    )
    content = content.replace(
        'White Plains (10601) — Unboxing, module bracket connections & floor layout.',
        'Chappaqua (10514) — Unboxing, module bracket connections & floor layout.'
    )
    content = content.replace(
        'White Plains (10601) · Unboxing, module bracket connections & floor layout.',
        'Chappaqua (10514) · Unboxing, module bracket connections & floor layout.'
    )
    content = content.replace(
        'White Plains (10605) — Level table assembly & chair leg torque checks.',
        'Bedford (10506) — Level table assembly & chair leg torque checks.'
    )
    content = content.replace(
        'White Plains (10605) · Level table assembly & chair leg torque checks.',
        'Bedford (10506) · Level table assembly & chair leg torque checks.'
    )

    new_card = '''      <div style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06);">
        <img src="/assets/images/before-after/nursery_modular_bookcase_cubby_assembly_chappaqua_after.webp" alt="Dual Low-Profile Nursery Bookcase and Modular Toy Cubby Assembly in Chappaqua NY" style="width: 100%; height: 250px; object-fit: cover;">
        <div style="padding: 18px;">
          <h4 style="font-family:'Bebas Neue',sans-serif; font-size: 1.3rem; color: #071828; margin-bottom: 4px;">Modular Nursery Bookcase &amp; Toy Cubby</h4>
          <p style="font-size: 0.9rem; opacity: 0.8;">Chappaqua (10514) · Dual low-profile storage unit build, cam-lock fastening &amp; under-window alignment.</p>
        </div>
      </div>\n'''

    if 'nursery_modular_bookcase_cubby_assembly_chappaqua_after.webp' not in content:
        marker = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">\n'
        content = content.replace(marker, marker + new_card)
        with open('furniture-assembly.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("[OK] Added to furniture-assembly.html")
    else:
        print("[SKIP] Already in furniture-assembly.html")

if __name__ == '__main__':
    process_images()
    update_gallery()
    update_index()
    update_furniture_page()
