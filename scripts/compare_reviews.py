import re

def print_full_lists():
    with open('index.html', 'r', encoding='utf-8') as f:
        idx_content = f.read()
    with open('book.html', 'r', encoding='utf-8') as f:
        book_content = f.read()

    user_26 = [
        "Harvey Kaminski", "Mary V White", "Jelly Wang", "Vineet Bansal", "Ben Berkey",
        "Darin Fass", "paula reardon", "Lori Ann Marcella", "Jacob Marquez", "Ricardo",
        "Dilani Wanasinghe", "Franklin Miranda", "Carlos Ramirez", "Beth Isenberg", "Lala Alla",
        "Kathy Roberts", "the tiny mess club", "Nicole Poteat", "Escober Investments", "Randy Hecht",
        "Neil Arnold", "Pam Jaffee", "Wolfgang von Loewenstein", "Mandy", "Nick Valsangkar", "Anne Bryant"
    ]

    # extract reviewer names from HTML cards
    # Pattern: <strong>...</strong> in carousel cards
    idx_names = re.findall(r'<strong[^>]*>([^<]+)</strong>', idx_content)
    book_names = re.findall(r'<strong[^>]*>([^<]+)</strong>', book_content)

    print("=== USER 26 REVIEWS (Count: 26) ===")
    for i, name in enumerate(user_26, 1):
        print(f"{i:2d}. {name}")

    print("\n=== INDEX.HTML REVIEWS ===")
    for i, name in enumerate(idx_names, 1):
        print(f"{i:2d}. {name}")

    print("\n=== BOOK.HTML REVIEWS ===")
    for i, name in enumerate(book_names, 1):
        print(f"{i:2d}. {name}")

if __name__ == '__main__':
    print_full_lists()
