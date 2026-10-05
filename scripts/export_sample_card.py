import bs4

def print_track_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        soup = bs4.BeautifulSoup(f.read(), 'html.parser')

    items = soup.find_all(class_='rev-card-item')
    print(f"Total items found: {len(items)}")
    if items:
        with open('sample_card.html', 'w', encoding='utf-8') as out:
            out.write(items[0].prettify())
        print("Wrote sample_card.html")

if __name__ == '__main__':
    print_track_html()
