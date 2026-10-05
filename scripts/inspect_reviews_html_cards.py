import bs4

def inspect_reviews_page_cards():
    with open('reviews.html', 'r', encoding='utf-8') as f:
        soup = bs4.BeautifulSoup(f.read(), 'html.parser')

    cards = soup.find_all(class_='review-card')
    print(f"reviews.html total review-card elements: {len(cards)}")

    for idx, card in enumerate(cards, 1):
        author = card.find(class_='review-author')
        text = card.find(class_='review-text')
        town = card.find(class_='review-town')
        a_name = author.get_text(strip=True) if author else ''
        t_text = text.get_text(strip=True) if text else ''
        t_town = town.get_text(strip=True) if town else ''
        safe_author = a_name.encode('ascii', 'replace').decode('ascii')
        safe_text = t_text[:50].encode('ascii', 'replace').decode('ascii')
        print(f"#{idx:2d}: [{safe_author}] ({t_town}) '{safe_text}'")

if __name__ == '__main__':
    inspect_reviews_page_cards()
