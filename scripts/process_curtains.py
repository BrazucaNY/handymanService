import os
import sys
from PIL import Image
import piexif

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def to_exif_deg(val):
    abs_val = abs(val)
    d = int(abs_val)
    m = int((abs_val - d) * 60)
    s = int(round((abs_val - d - m / 60.0) * 3600.0 * 100))
    return ((d, 1), (m, 1), (s, 100))

def build_exif_dict(title, city, lat, lon):
    tags_str = f"handyman; {city} NY; curtain rod installation; custom drapery hanging; window treatments; pinch pleat drapes; Westchester County; Here Handyman; home repair; local handyman"
    xp_title = f"{title}\0".encode('utf-16le')
    xp_comment = f"Here Handyman local curtain rod installation & window treatments in {city} NY. Visit https://www.herehandyman.com or Call (516) 350-0801\0".encode('utf-16le')
    xp_author = "David - Here Handyman\0".encode('utf-16le')
    xp_keywords = f"{tags_str}\0".encode('utf-16le')
    xp_subject = f"{title}\0".encode('utf-16le')

    zeroth_ifd = {
        piexif.ImageIFD.ImageDescription: f"{title}. Professional window treatment & curtain rod installation services in {city}, NY by Here Handyman.".encode('utf-8'),
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
    src_before = r"C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1792086204976_01129a6b.jpg"
    src_after = r"C:/Users/davi6/.gemini/antigravity/brain/37fb85cf-cf25-4347-ae07-6d93c5dfe048/.user_uploaded/media_1792086204971_a70ed4ad.jpg"

    dst_before = "assets/images/before-after/custom_pinch_pleat_curtain_rod_installation_scarsdale_before.webp"
    dst_after = "assets/images/before-after/custom_pinch_pleat_curtain_rod_installation_scarsdale_after.webp"

    lat = 40.995931
    lon = -73.784569
    city = "Scarsdale"

    # Process Before
    if os.path.exists(src_before):
        im_b = Image.open(src_before)
        if im_b.mode != 'RGB':
            im_b = im_b.convert('RGB')
        exif_dict_b = build_exif_dict("Heavy-Duty Curtain Rod Brackets Wall Framing Anchoring", city, lat, lon)
        exif_bytes_b = piexif.dump(exif_dict_b)
        im_b.save(dst_before, 'WEBP', quality=85, optimize=True, exif=exif_bytes_b)
        print(f"[OK] Saved {dst_before}")
        os.remove(src_before)
        print(f"[CLEANUP] Deleted source: {src_before}")
    else:
        print(f"[WARN] Source before not found: {src_before}")

    # Process After
    if os.path.exists(src_after):
        im_a = Image.open(src_after)
        if im_a.mode != 'RGB':
            im_a = im_a.convert('RGB')
        exif_dict_a = build_exif_dict("Custom Pinch-Pleat Linen Drapery & Bronze Curtain Rod Installation", city, lat, lon)
        exif_bytes_a = piexif.dump(exif_dict_a)
        im_a.save(dst_after, 'WEBP', quality=85, optimize=True, exif=exif_bytes_a)
        print(f"[OK] Saved {dst_after}")
        os.remove(src_after)
        print(f"[CLEANUP] Deleted source: {src_after}")
    else:
        print(f"[WARN] Source after not found: {src_after}")

def update_gallery():
    with open('gallery.html', 'r', encoding='utf-8') as f:
        content = f.read()

    new_card = '      { id:"custom-pinch-pleat-curtains-scarsdale", title:"Custom Pinch-Pleat Linen Drapery & Bronze Curtain Rod Installation", town:"Scarsdale", place:"Scarsdale, NY (10583)", desc:"Wall stud locating, heavy-duty triple bracket anchor installation, laser level rod mounting, and floor-to-ceiling pinch-pleat linen drapery hanging.", tag:"Repairs", serviceUrl:"/general-repairs", before:IMG+"/custom_pinch_pleat_curtain_rod_installation_scarsdale_before.webp", after:IMG+"/custom_pinch_pleat_curtain_rod_installation_scarsdale_after.webp" },\n'

    if 'id:"custom-pinch-pleat-curtains-scarsdale"' not in content:
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

    new_slide = '''          <!-- Job Curtains: Custom Pinch-Pleat Linen Drapery & Bronze Curtain Rod Installation — Scarsdale, NY -->
          <figure class="ba-slide" style="min-width:100%;margin:0;flex-shrink:0;position:relative">
           <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;background:#000">
            <div style="position:relative">
             <img alt="Heavy-duty curtain rod brackets anchored above double-hung window in Scarsdale NY" decoding="async" height="1024" loading="lazy" src="/assets/images/before-after/custom_pinch_pleat_curtain_rod_installation_scarsdale_before.webp" style="width:100%;height:480px;object-fit:cover;display:block" width="768"/>
             <span style="position:absolute;top:14px;left:14px;background:rgba(7,24,40,0.9);color:#fff;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.2)">
              Before
             </span>
            </div>
            <div style="position:relative">
             <img alt="Installed oil-rubbed bronze rod with custom pinch-pleated linen drapes in Scarsdale NY" decoding="async" height="1024" loading="lazy" src="/assets/images/before-after/custom_pinch_pleat_curtain_rod_installation_scarsdale_after.webp" style="width:100%;height:480px;object-fit:cover;display:block" width="768"/>
             <span style="position:absolute;top:14px;left:14px;background:#eab308;color:#071828;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px">
              After
             </span>
            </div>
           </div>
           <figcaption style="background:#0b2a4a;padding:16px 24px;color:#fff;font-size:15px;font-weight:700;text-align:center;letter-spacing:0.5px;border-top:1px solid rgba(255,255,255,0.1)">
            Custom Pinch-Pleat Linen Drapery &amp; Bronze Curtain Rod Installation — Scarsdale, NY
           </figcaption>
          </figure>\n'''

    if 'Job Curtains' not in content:
        marker = '<div class="ba-slides" style="display:flex;transition:transform 0.5s ease-in-out">\n'
        content = content.replace(marker, marker + new_slide)
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("[OK] Added to index.html carousel")
    else:
        print("[SKIP] Already in index.html")

def update_general_repairs():
    with open('general-repairs.html', 'r', encoding='utf-8') as f:
        content = f.read()

    new_card = '''      <!-- Project: Custom Pinch-Pleat Drapery -->
      <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid rgba(7,24,40,0.1);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: #071828;">
          <div style="position: relative;">
            <span style="position: absolute; top: 8px; left: 8px; background: #071828; color: #fff; font-family:'Bebas Neue',sans-serif; font-size: 0.9rem; padding: 2px 8px; border-radius: 3px;">BEFORE</span>
            <img src="/assets/images/before-after/custom_pinch_pleat_curtain_rod_installation_scarsdale_before.webp" alt="Heavy-duty curtain rod brackets anchored above double-hung window in Scarsdale NY" style="width: 100%; height: 220px; object-fit: cover;">
          </div>
          <div style="position: relative;">
            <span style="position: absolute; top: 8px; left: 8px; background: #eab308; color: #071828; font-family:'Bebas Neue',sans-serif; font-size: 0.9rem; padding: 2px 8px; border-radius: 3px; font-weight: bold;">AFTER</span>
            <img src="/assets/images/before-after/custom_pinch_pleat_curtain_rod_installation_scarsdale_after.webp" alt="Installed oil-rubbed bronze rod with custom pinch-pleated linen drapes in Scarsdale NY" style="width: 100%; height: 220px; object-fit: cover;">
          </div>
        </div>
        <div style="padding: 20px;">
          <h4 style="font-family:'Bebas Neue',sans-serif; font-size: 1.4rem; color: #071828; margin-bottom: 6px;">Custom Pinch-Pleat Drapery &amp; Curtain Rod Mounting</h4>
          <p style="font-size: 0.92rem; color: #555; line-height: 1.6;">Scarsdale (10583) • Stud-anchored heavy bronze rod brackets, laser leveled, and hung floor-to-ceiling custom linen pinch-pleated drapes.</p>
        </div>
      </div>\n'''

    if 'custom_pinch_pleat_curtain_rod_installation_scarsdale_after.webp' not in content:
        marker = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">\n'
        content = content.replace(marker, marker + new_card)
        with open('general-repairs.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("[OK] Added to general-repairs.html")
    else:
        print("[SKIP] Already in general-repairs.html")

if __name__ == '__main__':
    process_images()
    update_gallery()
    update_index()
    update_general_repairs()
