import bs4

def map_current_cards():
    with open('index.html', 'r', encoding='utf-8') as f:
        soup = bs4.BeautifulSoup(f.read(), 'html.parser')

    items = soup.find_all(class_='rev-card-item')
    print(f"Index.html total cards: {len(items)}\n")
    for idx, item in enumerate(items, 1):
        name = item.find('strong').get_text(strip=True) if item.find('strong') else ''
        sub = item.find('span', class_=None).get_text(strip=True) if item.find('div', class_='rev-author-info') else ''
        text = item.find(class_='rev-card-text').get_text(strip=True) if item.find(class_='rev-card-text') else ''
        avatar = item.find(class_='rev-avatar').get_text(strip=True) if item.find(class_='rev-avatar') else ''

        # get subtitle cleanly
        author_info = item.find(class_='rev-author-info')
        if author_info:
            spans = author_info.find_all('span')
            sub = spans[0].get_text(strip=True) if spans else ''

        print(f"Card #{idx:2d}:")
        print(f"  Name:     {name}")
        print(f"  Initials: {avatar}")
        print(f"  Subtitle: {sub}")
        print(f"  Text:     {text}")
        print("-" * 50)

if __name__ == '__main__':
    map_current_cards()
