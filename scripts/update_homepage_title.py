import re

def update_homepage_title():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    new_title = "<title>Here Handyman | Premium Westchester County NY Handyman Services</title>"
    content = re.sub(r'<title>.*?</title>', new_title, content, flags=re.DOTALL)

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("index.html title tag updated successfully to: Here Handyman | Premium Westchester County NY Handyman Services")

if __name__ == '__main__':
    update_homepage_title()
