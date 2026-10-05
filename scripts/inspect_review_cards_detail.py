import bs4
import json

def inspect_details(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        soup = bs4.BeautifulSoup(f.read(), 'html.parser')

    track = soup.find(id='reviewsTrack') or soup.find(id='reviews-track') or soup.find(class_='reviews-track')
    if not track:
        print(f"{filename}: No track found")
        return

    items = track.find_all(class_='rev-card-item')
    print(f"=== {filename} ({len(items)} items) ===")
    for idx, item in enumerate(items, 1):
        name_el = item.find('strong')
        text_el = item.find(class_='rev-card-text')
        date_el = item.find(class_='rev-card-date')
        badge_el = item.find(class_='rev-card-badge')
        name = name_el.get_text(strip=True) if name_el else 'N/A'
        text = text_el.get_text(strip=True) if text_el else 'N/A'
        date = date_el.get_text(strip=True) if date_el else 'N/A'
        badge = badge_el.get_text(strip=True) if badge_el else ''
        safe_name = name.encode('ascii', 'replace').decode('ascii')
        safe_text = text[:60].encode('ascii', 'replace').decode('ascii')
        print(f"#{idx:2d}: [{safe_name}] ({date}) ({badge}) '{safe_text}'")

if __name__ == '__main__':
    inspect_details('index.html')
    inspect_details('book.html')
