import os

def fix_paths():
    for filepath in ['index.html', 'about.html']:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        content = content.replace('/assets/images/before-after/dresser-scarsdale-before.jpg', '/assets/images/before-after/dresser-scarsdale-before.webp')
        content = content.replace('/assets/images/before-after/dresser-scarsdale-after.jpg', '/assets/images/before-after/dresser-scarsdale-after.webp')
        content = content.replace('/assets/images/before-after/dresser-harrison-before.jpg', '/assets/images/before-after/dresser-harrison-before.webp')
        content = content.replace('/assets/images/before-after/dresser-harrison-after.jpg', '/assets/images/before-after/dresser-harrison-after.webp')
        content = content.replace('/assets/images/before-after/gazebo-hartsdale-before.jpg', '/assets/images/before-after/gazebo-hartsdale-before.webp')
        content = content.replace('/assets/images/before-after/gazebo-hartsdale-after.jpg', '/assets/images/before-after/gazebo-hartsdale-after.webp')
        content = content.replace('/assets/images/before-after/toiler_herehandyman.jpg', '/assets/images/before-after/toiler_herehandyman_before.webp')
        content = content.replace('/assets/images/jobs/white-plains-closet-shelving.jpg', '/assets/images/jobs/white-plains-closet-shelving.webp')
        content = content.replace('/assets/images/david.webp', '/assets/images/herehandyman.webp')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed image extension paths in {filepath}.")

if __name__ == '__main__':
    fix_paths()
