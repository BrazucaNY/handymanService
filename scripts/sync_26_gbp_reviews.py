import bs4

USER_26_NAMES = [
    "Harvey Kaminski",
    "Mary V White",
    "Jelly Wang",
    "Vineet Bansal",
    "Ben Berkey",
    "Darin Fass",
    "Paula Reardon",
    "Lori Ann Marcella",
    "Jacob Marquez",
    "Ricardo",
    "Dilani Wanasinghe",
    "Franklin Miranda",
    "Carlos Ramirez",
    "Beth Isenberg",
    "Lala Alla",
    "Kathy Roberts",
    "The Tiny Mess Club",
    "Nicole Poteat",
    "Escober Investments",
    "Randy Hecht",
    "Neil Arnold",
    "Pam Jaffee",
    "Wolfgang von Loewenstein",
    "Mandy",
    "Nick Valsangkar",
    "Anne Bryant"
]

def get_cards_map(soup):
    items = soup.find_all(class_='rev-card-item')
    cards_map = {}
    for item in items:
        name_el = item.find('strong')
        if name_el:
            name = name_el.get_text(strip=True)
            cards_map[name.lower()] = item
    return cards_map

def sync_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = bs4.BeautifulSoup(f.read(), 'html.parser')

    cards_map = get_cards_map(soup)
    track = soup.find(id='reviewTrack') or soup.find(class_='reviews-track')
    if not track:
        print(f"ERROR: Could not find review track in {filepath}")
        return

    ordered_items = []
    missing = []
    for name in USER_26_NAMES:
        key = name.lower()
        if key in cards_map:
            ordered_items.append(cards_map[key])
        else:
            # check partial match
            matched = False
            for k, v in cards_map.items():
                if key in k or k in key:
                    ordered_items.append(v)
                    matched = True
                    break
            if not matched:
                missing.append(name)

    if missing:
        print(f"ERROR: {filepath} missing cards for: {missing}")
        return

    # Clear track children and append ordered_items
    track.clear()
    for item in ordered_items:
        track.append(item)

    # Save formatted HTML back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())

    print(f"Successfully updated {filepath} review track with exactly {len(ordered_items)} GBP reviews in order!")

if __name__ == '__main__':
    sync_page('index.html')
    sync_page('book.html')
