import os
import sys
import glob
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

site_dir = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman"
html_files = [f for f in glob.glob(os.path.join(site_dir, "**", "*.html"), recursive=True) if "node_modules" not in f and ".netlify" not in f]

schema_template = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": "https://www.herehandyman.com/#business",
    "name": "Here Handyman",
    "url": "https://www.herehandyman.com",
    "telephone": "+1-516-350-0801",
    "email": "info@herehandyman.com",
    "priceRange": "$$",
    "image": "https://www.herehandyman.com/assets/images/og-image.webp",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "White Plains",
        "addressRegion": "NY",
        "postalCode": "10607",
        "addressCountry": "US"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 41.033989,
        "longitude": -73.76291
    },
    "areaServed": [
        { "@type": "City", "name": "White Plains", "sameAs": "https://en.wikipedia.org/wiki/White_Plains,_New_York" },
        { "@type": "City", "name": "Scarsdale", "sameAs": "https://en.wikipedia.org/wiki/Scarsdale,_New_York" },
        { "@type": "City", "name": "Yonkers", "sameAs": "https://en.wikipedia.org/wiki/Yonkers,_New_York" },
        { "@type": "City", "name": "Harrison", "sameAs": "https://en.wikipedia.org/wiki/Harrison,_New_York" },
        { "@type": "City", "name": "Rye", "sameAs": "https://en.wikipedia.org/wiki/Rye,_New_York" },
        { "@type": "City", "name": "Tarrytown", "sameAs": "https://en.wikipedia.org/wiki/Tarrytown,_New_York" },
        { "@type": "City", "name": "Mamaroneck", "sameAs": "https://en.wikipedia.org/wiki/Mamaroneck,_New_York" }
    ],
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "50",
        "bestRating": "5.0",
        "worstRating": "1.0"
    }
}

updated = 0
for f in html_files:
    rel = os.path.relpath(f, site_dir)
    with open(f, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()

    # Check if HomeAndConstructionBusiness or LocalBusiness schema is present
    if "HomeAndConstructionBusiness" not in content and "schema.org" not in content:
        script_tag = f'\n<script type="application/ld+json">\n{json.dumps(schema_template, indent=2)}\n</script>\n'
        content = content.replace("</head>", f"{script_tag}</head>")
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        updated += 1
        print(f"  ✓ Injected Local Business Schema: {rel}")

print(f"\nLocal SEO Schema Booster audit completed! Total files checked: {len(html_files)}, Injected: {updated}")
