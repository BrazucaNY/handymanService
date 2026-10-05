import bs4

def check_reviews_html():
    with open('reviews.html', 'r', encoding='utf-8') as f:
        soup = bs4.BeautifulSoup(f.read(), 'html.parser')

    cards = soup.find_all(class_='review-card')
    print(f"reviews.html review-card count: {len(cards)}")
    for idx, card in enumerate(cards, 1):
        author = card.find(class_='review-author')
        text = card.find(class_='review-text')
        town = card.find(class_='review-town')
        a_name = author.get_text(strip=True) if author else 'N/A'
        safe_name = a_name.encode('ascii', 'replace').decode('ascii')
        print(f"Card #{idx:2d}: {safe_name}")

if __name__ == '__main__':
    check_reviews_html()
