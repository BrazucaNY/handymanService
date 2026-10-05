import re

def restore_rating_badge_phrase():
    # 1. index.html
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(
        r'<span>\s*5\.0 Rating( • Verified Google Reviews)?\s*</span>',
        '<span>5.0 Rating based on verified Google Reviews</span>',
        content
    )
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("index.html rating badge updated.")

    # 2. book.html
    with open('book.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(
        r'<span>\s*5\.0 Rating( • Verified Google Reviews)?\s*</span>',
        '<span>5.0 Rating based on verified Google Reviews</span>',
        content
    )
    with open('book.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("book.html rating badge updated.")

    # 3. reviews.html
    with open('reviews.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(
        r'<span>\s*5\.0 / 5\.0 Rating( • Verified Google Reviews)?\s*</span>',
        '<span>5.0 / 5.0 Rating based on verified Google Reviews</span>',
        content
    )
    with open('reviews.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("reviews.html rating badge updated.")

if __name__ == '__main__':
    restore_rating_badge_phrase()
