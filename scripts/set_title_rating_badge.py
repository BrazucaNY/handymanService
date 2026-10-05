import re

def set_title_rating_badge():
    # 1. index.html
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(
        r'<span>\s*5\.0 Rating( based on verified Google Reviews| • Verified Google Reviews)?\s*</span>',
        '<span>5.0 Rating — Here Handyman</span>',
        content
    )
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("index.html rating badge set to '5.0 Rating — Here Handyman'.")

    # 2. book.html
    with open('book.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(
        r'<span>\s*5\.0 Rating( based on verified Google Reviews| • Verified Google Reviews)?\s*</span>',
        '<span>5.0 Rating — Here Handyman</span>',
        content
    )
    with open('book.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("book.html rating badge set to '5.0 Rating — Here Handyman'.")

    # 3. reviews.html
    with open('reviews.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(
        r'<span>\s*5\.0 / 5\.0 Rating( based on verified Google Reviews| • Verified Google Reviews)?\s*</span>',
        '<span>5.0 Rating — Here Handyman</span>',
        content
    )
    with open('reviews.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("reviews.html rating badge set to '5.0 Rating — Here Handyman'.")

if __name__ == '__main__':
    set_title_rating_badge()
