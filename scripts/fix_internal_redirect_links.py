files = ['about.html', 'index.html', 'white-plains-handyman.html']
for fn in files:
    with open(fn, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace('href="https://www.herehandyman.com/book-appointment"', 'href="https://www.herehandyman.com/book"')
    c = c.replace('href="/book-appointment"', 'href="/book"')
    c = c.replace('href="/book-appointment/"', 'href="/book"')
    with open(fn, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Updated internal links in', fn)
