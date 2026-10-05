import bs4

def inspect_structure():
    for filename in ['index.html', 'book.html', 'reviews.html']:
        with open(filename, 'r', encoding='utf-8') as f:
            soup = bs4.BeautifulSoup(f.read(), 'html.parser')

        # Find carousel or review grid container
        print(f"=== {filename} ===")
        reviews_track = soup.find(id=re.compile(r'review.*track', re.I)) or soup.find(class_=re.compile(r'review.*track', re.I)) or soup.find(class_=re.compile(r'reviews.*grid', re.I))
        if reviews_track:
            cards = reviews_track.find_all(recursive=False)
            print(f"Found track/container with {len(cards)} direct children.")
            if cards:
                print("Sample card HTML:")
                print(str(cards[0])[:300].replace('\n', ' '))
        else:
            print("No track container found by ID/class pattern.")

if __name__ == '__main__':
    import re
    inspect_structure()
