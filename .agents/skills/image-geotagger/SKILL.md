---
name: image-geotagger
description: Geotags all website, portfolio, and Google Business Profile images with EXIF GPS metadata for Westchester County cities (White Plains, Scarsdale, Harrison, Rye, Yonkers, Mamaroneck, New Rochelle) to boost local Google Maps ranking signals.
---

# 📍 Image Geotagger Skill for Here Handyman

This skill automatically injects **EXIF GPS Latitude & Longitude Metadata** and **City Location Tags** into all images used on **herehandyman.com** and uploaded to **Google Business Profile**.

## 🎯 Purpose
Google Maps and Google Search crawlers extract embedded EXIF location metadata from uploaded photos to verify that work was completed at real physical job sites in Westchester County. 

## 🗺️ Supported Westchester Towns & GPS Coordinates

| Town / City | Latitude | Longitude |
| :--- | :---: | :---: |
| **White Plains, NY** | `41.033987` | `-73.762910` |
| **Scarsdale, NY** | `41.005100` | `-73.784600` |
| **Harrison, NY** | `41.045100` | `-73.714600` |
| **Rye, NY** | `40.980700` | `-73.683700` |
| **Mamaroneck, NY** | `40.948700` | `-73.734600` |
| **Yonkers, NY** | `40.931200` | `-73.898700` |
| **New Rochelle, NY** | `40.911500` | `-73.782400` |

## 🚀 How to Run the Geotagger Script

Run the automated Python geotagger across your image portfolio:

```bash
python .agents/skills/image-geotagger/scripts/geotag_images.py "assets/images"
```

## 🛡️ Best Practices for Google Maps Image Uploads
1. **Filename**: Name photos after the service and town (e.g., `tv-mounting-white-plains.jpg`, `drywall-repair-scarsdale.jpg`).
2. **GPS Metadata**: Ensure EXIF metadata tags match the local Westchester city coordinates.
3. **Alt Text**: Match `alt` attribute on HTML pages with the service and location (e.g. `alt="TV Mounting installation in White Plains NY"`).
