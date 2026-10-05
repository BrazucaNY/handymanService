import bs4

def inspect_parent():
    with open('index.html', 'r', encoding='utf-8') as f:
        soup = bs4.BeautifulSoup(f.read(), 'html.parser')

    items = soup.find_all(class_='rev-card-item')
    if items:
        parent = items[0].parent
        print("Parent tag:", parent.name)
        print("Parent attributes:", parent.attrs)

if __name__ == '__main__':
    inspect_parent()
