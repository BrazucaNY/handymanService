import bs4

def find_sections(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = bs4.BeautifulSoup(f.read(), 'html.parser')

    print(f"=== {filepath} SECTIONS ===")
    for sec in soup.find_all('section'):
        sec_id = sec.get('id', '')
        sec_class = sec.get('class', [])
        h2 = sec.find('h2')
        h2_text = h2.get_text(strip=True) if h2 else ''
        safe_h2 = h2_text.encode('ascii', 'replace').decode('ascii')
        print(f"  <section id='{sec_id}' class='{' '.join(sec_class)}'> H2: {safe_h2}")

if __name__ == '__main__':
    find_sections('index.html')
    find_sections('about.html')
