def update_index_meta():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Meta description
    content = content.replace(
        '<meta content="Top-rated handyman in Westchester County NY. White Plains, Scarsdale &amp; Yonkers. Furniture, TV mounting, drywall &amp; electrical. Free quotes: (516) 350-0801." name="description"/>',
        '<meta content="5.0 ★ Top-rated handyman in Westchester County NY. Serving Scarsdale, Chappaqua, Rye &amp; Bedford. TV mounting, furniture assembly, carpentry &amp; electrical. Free quotes: (516) 350-0801." name="description"/>'
    )

    # OG description
    content = content.replace(
        '<meta content="Professional residential assembly and home maintenance services across Scarsdale, White Plains, Yonkers, and surrounding Westchester County communities. No middlemen, direct expert care." property="og:description"/>',
        '<meta content="Professional residential assembly and luxury home craftsmanship across Scarsdale, Chappaqua, Rye, Bedford, and Westchester County. No middlemen, direct expert care." property="og:description"/>'
    )

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated index.html metadata")

def update_furniture_meta():
    with open('furniture-assembly.html', 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace(
        '<meta name="description" content="5.0 ★ IKEA, Wayfair &amp; Amazon furniture assembly in Westchester NY. Upfront flat-rate quotes in White Plains, Scarsdale &amp; Yonkers. Call (516) 350-0801!">',
        '<meta name="description" content="5.0 ★ IKEA, Wayfair &amp; Amazon furniture assembly in Westchester NY. Upfront flat-rate quotes in Scarsdale, Chappaqua, Rye &amp; Westchester. Call (516) 350-0801!">'
    )
    content = content.replace(
        'Flat-rate upfront quotes & prompt service in White Plains, Scarsdale & Yonkers. Call (516) 350-0801!',
        'Flat-rate upfront quotes & prompt service in Scarsdale, Chappaqua, Rye & Westchester. Call (516) 350-0801!'
    )

    with open('furniture-assembly.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated furniture-assembly.html metadata")

if __name__ == '__main__':
    update_index_meta()
    update_furniture_meta()
