import os

files_to_delete = [
    'assets/gallery/handyman-hero-van.webp',
    'assets/images/before-after/tv_mounting_grasscloth_wall_white_console_scarsdale_after.webp',
    'assets/images/portfolio/lg_83inch_oled_c4_tv_mounting_white_plains_before_after.webp',
    'assets/images/tv-mounting-ardsley-after.webp',
    'assets/images/tv-mounting-ardsley-before.webp',
    'assets/images/before-after/ceiling_curtain_track_white_plains_before.webp',
    'assets/images/before-after/ceiling_curtain_track_white_plains_after.webp',
    'assets/images/before-after/ceiling_curtain_track_installation_white_plains_before.webp',
    'assets/images/before-after/ceiling_curtain_track_installation_white_plains_after.webp',
    'assets/images/before-after/bathroon_after.webp',
    'assets/images/portfolio/curtain-rod-installation-white-plains.webp',
    'assets/images/portfolio/sage_green_shiplap_accent_wall_painting_white_plains.webp',
    'assets/images/portfolio/hallway_framed_art_mounting_scarsdale.webp',
    'assets/images/before-after/samsung_85inch_crystal_uhd_tv_unboxing_white_plains_before.webp',
    'assets/images/before-after/tv_mounting_geometric_wall_floating_mantel_yonkers_after.webp'
]

total_freed_bytes = 0
deleted_count = 0

for rel_path in files_to_delete:
    full_path = os.path.normpath(rel_path)
    if os.path.exists(full_path):
        size = os.path.getsize(full_path)
        os.remove(full_path)
        total_freed_bytes += size
        deleted_count += 1
        print(f"[DELETED] {rel_path} ({size/1024:.1f} KB)")
    else:
        print(f"[SKIPPED] {rel_path} (does not exist)")

print(f"\nDone! Deleted {deleted_count} files.")
print(f"Total space freed: {total_freed_bytes/1024:.2f} KB ({total_freed_bytes/(1024*1024):.2f} MB)")
