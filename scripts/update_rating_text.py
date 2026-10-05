def update_rating_text():
    # 1. index.html
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('5.0 Rating based on 26 Verified Google Reviews', '5.0 Rating')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("index.html rating badge updated.")

    # 2. book.html
    with open('book.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('5.0 Rating based on 26 Verified Google Reviews', '5.0 Rating')
    with open('book.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("book.html rating badge updated.")

    # 3. reviews.html
    with open('reviews.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('5.0 / 5.0 Rating (26 Verified Google Reviews)', '5.0 / 5.0 Rating')
    with open('reviews.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("reviews.html rating badge updated.")

if __name__ == '__main__':
    update_rating_text()
