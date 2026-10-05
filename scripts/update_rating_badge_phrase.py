def update_rating_badge_phrase():
    # 1. index.html
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('<span>5.0 Rating</span>', '<span>5.0 Rating • Verified Google Reviews</span>')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("index.html rating badge phrase updated.")

    # 2. book.html
    with open('book.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('<span>5.0 Rating</span>', '<span>5.0 Rating • Verified Google Reviews</span>')
    with open('book.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("book.html rating badge phrase updated.")

    # 3. reviews.html
    with open('reviews.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('<span>5.0 / 5.0 Rating</span>', '<span>5.0 / 5.0 Rating • Verified Google Reviews</span>')
    with open('reviews.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("reviews.html rating badge phrase updated.")

if __name__ == '__main__':
    update_rating_badge_phrase()
