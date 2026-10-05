import bs4

def inspect_reviews_html_classes():
    with open('reviews.html', 'r', encoding='utf-8') as f:
        soup = bs4.BeautifulSoup(f.read(), 'html.parser')

    classes = set()
    for tag in soup.find_all(True):
        if tag.get('class'):
            classes.update(tag.get('class'))
    print("Classes in reviews.html matching 'rev' or 'card' or 'grid':")
    for c in sorted(classes):
        if 'rev' in c or 'card' in c or 'grid' in c or 'review' in c:
            print(f" - {c}")

if __name__ == '__main__':
    inspect_reviews_html_classes()
