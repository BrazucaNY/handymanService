import os
import re

def fix_index():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Review count
    content = content.replace('24+ verified 5-star Google Business Profile reviews', '26 verified 5-star Google Business Profile reviews')

    # Kitchen light -> Eastchester
    content = content.replace(
        'alt="Unboxed modern LED ceiling flush-mount light fixture sitting with box before installation ? Rye NY"',
        'alt="Unboxed modern LED ceiling flush-mount light fixture sitting with box before installation ? Eastchester NY"'
    )
    content = content.replace(
        'alt="Modern white circular LED ceiling flush-mount light fixture mounted and illuminated ? Rye NY"',
        'alt="Modern white circular LED ceiling flush-mount light fixture mounted and illuminated ? Eastchester NY"'
    )
    content = content.replace(
        'Modern LED Kitchen Flush-Mount Ceiling Light Fixture Replacement ? Rye, NY',
        'Modern LED Kitchen Flush-Mount Ceiling Light Fixture Replacement ? Eastchester, NY'
    )

    # Kitchen floating shelves -> White Plains
    content = content.replace(
        'alt="Blank white subway tile kitchen backsplash wall before floating shelves installation ? Bronxville NY"',
        'alt="Blank white subway tile kitchen backsplash wall before floating shelves installation ? White Plains NY"'
    )
    content = content.replace(
        'alt="Custom natural wood floating shelves with matte black pipe brackets mounted on subway tile kitchen backsplash ? Bronxville NY"',
        'alt="Custom natural wood floating shelves with matte black pipe brackets mounted on subway tile kitchen backsplash ? White Plains NY"'
    )
    content = content.replace(
        'Custom Natural Wood Floating Shelves on Subway Tile ? Bronxville, NY',
        'Custom Natural Wood Floating Shelves on Subway Tile ? White Plains, NY'
    )

    # Dog crate -> Scarsdale
    content = content.replace(
        'alt="Unassembled sliding barn door dog crate furniture console parts and hardware on floor before assembly ? Chappaqua NY"',
        'alt="Unassembled sliding barn door dog crate furniture console parts and hardware on floor before assembly ? Scarsdale NY"'
    )
    content = content.replace(
        'alt="Fully assembled wooden sliding barn door dog crate credenza console with storage drawers ? Chappaqua NY"',
        'alt="Fully assembled wooden sliding barn door dog crate credenza console with storage drawers ? Scarsdale NY"'
    )
    content = content.replace(
        'Sliding Barn Door Dog Crate Credenza &amp; Furniture Assembly ? Chappaqua, NY',
        'Sliding Barn Door Dog Crate Credenza &amp; Furniture Assembly ? Scarsdale, NY'
    )

    # Bathroom mirror -> White Plains
    content = content.replace(
        'alt="Bathroom wall tile prepped for mirror mounting before installation ? Harrison NY"',
        'alt="Bathroom wall tile prepped for mirror mounting before installation ? White Plains NY"'
    )
    content = content.replace(
        'alt="Decorative gold oval mirror mounted securely on bathroom tile wall ? Harrison NY"',
        'alt="Decorative gold oval mirror mounted securely on bathroom tile wall ? White Plains NY"'
    )
    content = content.replace(
        'Decorative Gold Bathroom Mirror Mounting on Tile ? Harrison, NY',
        'Decorative Gold Bathroom Mirror Mounting on Tile ? White Plains, NY'
    )

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("index.html updated successfully.")

def fix_dashboard():
    with open('dashboard.html', 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('var BASE_GBP_REVIEWS = 24;', 'var BASE_GBP_REVIEWS = 26;')
    content = content.replace('<div class="num" id="statReviews">24</div>', '<div class="num" id="statReviews">26</div>')

    with open('dashboard.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("dashboard.html updated successfully.")

def fix_llms():
    with open('llms.txt', 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('5.0 stars on Google (24+ verified reviews)', '5.0 stars on Google (26 verified reviews)')

    with open('llms.txt', 'w', encoding='utf-8') as f:
        f.write(content)
    print("llms.txt updated successfully.")

def fix_gallery():
    with open('gallery.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Smoke detector before/after swap
    old_smoke = 'before:IMG+"/smoke_detector_predated_installation_scarsdale_after.webp", after:IMG+"/smoke_detector_predated_installation_scarsdale_before.webp"'
    new_smoke = 'before:IMG+"/smoke_detector_predated_installation_scarsdale_before.webp", after:IMG+"/smoke_detector_predated_installation_scarsdale_after.webp"'
    if old_smoke in content:
        content = content.replace(old_smoke, new_smoke)
        print("gallery.html smoke detector before/after swapped.")
    else:
        print("WARNING: old_smoke not found in gallery.html")

    # Kitchen light ID & town
    old_light = '{ id:"kitchen-flush-mount-light-scarsdale", title:"Modern LED Kitchen Flush-Mount Ceiling Light Fixture Replacement", town:"Scarsdale", place:"Scarsdale, NY (10583)"'
    new_light = '{ id:"kitchen-flush-mount-light-eastchester", title:"Modern LED Kitchen Flush-Mount Ceiling Light Fixture Replacement", town:"Eastchester", place:"Eastchester, NY (10709)"'
    if old_light in content:
        content = content.replace(old_light, new_light)
        print("gallery.html kitchen light updated to Eastchester.")
    else:
        print("WARNING: old_light not found in gallery.html")

    # Bidet item ID
    old_bidet = 'id:"bidet-toilet-yonkers", title:"Modern Bidet Toilet & Bathroom Fixture Replacement", town:"Scarsdale"'
    new_bidet = 'id:"bidet-toilet-scarsdale", title:"Modern Bidet Toilet & Bathroom Fixture Replacement", town:"Scarsdale"'
    if old_bidet in content:
        content = content.replace(old_bidet, new_bidet)
        print("gallery.html bidet item ID updated to bidet-toilet-scarsdale.")

    with open('gallery.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("gallery.html updated successfully.")

def fix_services():
    with open('services.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Schema zip 10607 -> 10601
    content = re.sub(r'("postalCode":\s*)"10607"', r'\1"10601"', content)

    with open('services.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("services.html updated successfully.")

def fix_town_zips():
    zip_map = {
        'briarcliff-manor-handyman.html': ('10580', '10510'),
        'bronxville-handyman.html': ('10580', '10708'),
        'eastchester-handyman.html': ('10580', '10709'),
        'elmsford-handyman.html': ('10580', '10523'),
        'irvington-handyman.html': ('10580', '10533'),
        'larchmont-handyman.html': ('10580', '10538'),
        'mount-vernon-handyman.html': ('10580', '10550'),
        'ossining-handyman.html': ('10580', '10562'),
        'pelham-handyman.html': ('10580', '10803'),
        'sleepy-hollow-handyman.html': ('10580', '10591'),
        'valhalla-handyman.html': ('10580', '10595'),

        'drywall-repair-mamaroneck.html': ('10538', '10543'),
        'electrical-repairs-mamaroneck.html': ('10538', '10543'),
        'furniture-assembly-mamaroneck.html': ('10538', '10543'),
        'general-repairs-mamaroneck.html': ('10538', '10543'),
        'interior-painting-mamaroneck.html': ('10538', '10543'),
        'kitchen-remodeling-mamaroneck.html': ('10538', '10543'),
        'mamaroneck-handyman.html': ('10538', '10543'),
        'plumbing-repairs-mamaroneck.html': ('10538', '10543'),
        'tv-mounting-mamaroneck.html': ('10538', '10543')
    }

    for filename, (old_zip, new_zip) in zip_map.items():
        if not os.path.exists(filename):
            print(f"Skipping missing file: {filename}")
            continue
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        old_pattern = f'"postalCode": "{old_zip}"'
        new_pattern = f'"postalCode": "{new_zip}"'
        if old_pattern in content:
            content = content.replace(old_pattern, new_pattern)
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"{filename}: {old_zip} -> {new_zip}")
        else:
            print(f"Pattern {old_pattern} not found in {filename}")

if __name__ == '__main__':
    fix_index()
    fix_dashboard()
    fix_llms()
    fix_gallery()
    fix_services()
    fix_town_zips()
