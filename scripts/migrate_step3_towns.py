import re

def update_gallery():
    with open('gallery.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Meta and lede text updates
    content = content.replace(
        'Browse real before-and-after handyman project photos across Scarsdale, White Plains, Yonkers, Harrison, Rye & Westchester County NY.',
        'Browse real before-and-after handyman project photos across Scarsdale, Chappaqua, Rye, Bronxville, Bedford & Westchester County NY.'
    )
    content = content.replace(
        'Explore 25 real before-and-after handyman projects across Scarsdale, White Plains, Yonkers, Harrison, Mamaroneck & Westchester NY.',
        'Explore 80+ real before-and-after handyman projects across Scarsdale, Chappaqua, Rye, Bronxville, Bedford & Westchester NY.'
    )
    content = content.replace(
        'across Scarsdale, White Plains, Yonkers, Harrison, Rye, and Westchester County.',
        'across Scarsdale, Chappaqua, Rye, Bronxville, Bedford, and Westchester County.'
    )
    content = content.replace(
        'across Scarsdale, White Plains, and Harrison.',
        'across Scarsdale, Chappaqua, Rye, and Bedford.'
    )

    # Clean up teak stool line
    pattern_teak = r'\{\s*id:"teak-shower-stool-white-plains"[^}]+\}'
    new_teak = '{ id:"teak-shower-stool-white-plains", title:"Spa Collection Solid Teak Corner Shower Bench Assembly", town:"Rye", place:"Rye, NY (10580)", desc:"Solid water-resistant Indonesian teak corner shower bench unboxing, stainless steel hardware assembly, shelf alignment, and non-slip rubber foot leveling.", tag:"Assembly", serviceUrl:"/furniture-assembly", before:IMG+"/teak_shower_stool_assembly_white_plains_before.webp", after:IMG+"/teak_shower_stool_assembly_white_plains_after.webp" }'
    content = re.sub(pattern_teak, new_teak, content)

    with open('gallery.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("gallery.html finished!")

def update_index():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Slide 12: Cabinet Back Wall Plywood Closure & Framing — White Plains, NY -> Armonk, NY
    content = content.replace(
        'Cabinet Back Wall Plywood Closure &amp; Framing — White Plains, NY',
        'Cabinet Structural Sub-Wall Reinforcement &amp; Framing — Armonk, NY'
    )
    content = content.replace(
        'Cabinet Back Wall Plywood Closure & Framing — White Plains, NY',
        'Cabinet Structural Sub-Wall Reinforcement & Framing — Armonk, NY'
    )

    # Slide 13: Alt text had White Plains NY -> Scarsdale NY
    content = content.replace(
        'Bare triple window casing before horizontal window blinds installation — White Plains NY',
        'Bare triple window casing before horizontal window blinds installation — Scarsdale NY'
    )
    content = content.replace(
        'Custom white horizontal window blinds fitted and mounted on 3 windows — White Plains NY',
        'Custom white horizontal window blinds fitted and mounted on 3 windows — Scarsdale NY'
    )

    # Slide 14: Under-Sink Cabinet Back Wall Repair & Drywall Closure — White Plains, NY -> Chappaqua, NY
    content = content.replace(
        'Under sink cabinet back wall cutout exposing studs before repair — White Plains NY',
        'Under sink cabinet back wall cutout exposing studs before repair — Chappaqua NY'
    )
    content = content.replace(
        'Installed clean drywall backing and sealed under sink cabinet wall closure — White Plains NY',
        'Installed moisture-resistant drywall backing and sealed under sink cabinet wall closure — Chappaqua NY'
    )
    content = content.replace(
        'Under-Sink Cabinet Back Wall Repair &amp; Drywall Closure — White Plains, NY',
        'Under-Sink Sub-Wall Moisture Barrier &amp; Drywall Closure — Chappaqua, NY'
    )
    content = content.replace(
        'Under-Sink Cabinet Back Wall Repair & Drywall Closure — White Plains, NY',
        'Under-Sink Sub-Wall Moisture Barrier & Drywall Closure — Chappaqua, NY'
    )

    # Slide 17: 83" LG OLED evo C4 Smart TV Wall Mounting & Concealed Wiring — White Plains, NY -> Scarsdale, NY
    content = content.replace(
        '83 inch LG OLED evo C4 Smart TV box prepped on floor with tool bag for wall mounting — White Plains NY',
        '83 inch LG OLED evo C4 Smart TV box prepped on floor with tool bag for wall mounting — Scarsdale NY'
    )
    content = content.replace(
        '83 inch LG OLED evo C4 Smart TV mounted flush to wall above wooden media console — White Plains NY',
        '83 inch LG OLED evo C4 Smart TV mounted flush to wall above wooden media console — Scarsdale NY'
    )
    content = content.replace(
        '83" LG OLED evo C4 Smart TV Wall Mounting &amp; Concealed Wiring — White Plains, NY',
        '83" LG OLED evo C4 Cinema Display Wall Mounting &amp; Concealed Wiring — Scarsdale, NY'
    )
    content = content.replace(
        '83-inch LG OLED evo C4 Smart TV Wall Mounting — White Plains, NY',
        '83-inch LG OLED evo C4 Cinema Display Wall Mounting — Scarsdale, NY'
    )

    # Slide 31: Basement Electrical Conduit & Quad Receptacle Installation — White Plains, NY -> Armonk, NY
    content = content.replace(
        'Open electrical junction box and conduit prepped on basement concrete wall — White Plains NY',
        'Open electrical junction box and conduit prepped on workshop masonry wall — Armonk NY'
    )
    content = content.replace(
        'Surface mounted quad electrical receptacle and EMT conduit wired and circuit-tested on basement concrete wall — White Plains NY',
        'Surface mounted quad electrical receptacle and EMT conduit wired and circuit-tested on workshop masonry wall — Armonk NY'
    )
    content = content.replace(
        'Basement Electrical Conduit &amp; Quad Receptacle Installation — White Plains, NY',
        'Custom Workshop EMT Conduit &amp; Quad Receptacle Installation — Armonk, NY'
    )
    content = content.replace(
        'Basement Electrical Conduit & Quad Receptacle Installation — White Plains, NY',
        'Custom Workshop EMT Conduit & Quad Receptacle Installation — Armonk, NY'
    )

    # Slide 49: Modern Bedroom Writing Desk & Hutch Assembly — White Plains, NY -> Chappaqua, NY
    content = content.replace(
        'Flat pack desk panels unpacked on bedroom carpet with power tools before assembly — White Plains NY',
        'Flat pack desk panels unpacked on bedroom carpet with power tools before assembly — Chappaqua NY'
    )
    content = content.replace(
        'White modern writing desk with shelf fully built and positioned in bedroom — White Plains NY',
        'White modern writing desk with shelf fully built and positioned in bedroom — Chappaqua NY'
    )
    content = content.replace(
        'Modern Bedroom Writing Desk &amp; Hutch Assembly — White Plains, NY',
        'Modern Executive Bedroom Writing Desk &amp; Hutch Assembly — Chappaqua, NY'
    )
    content = content.replace(
        'Modern Bedroom Writing Desk & Hutch Assembly — White Plains, NY',
        'Modern Executive Bedroom Writing Desk & Hutch Assembly — Chappaqua, NY'
    )

    # Slide 58: Large Flat Screen TV Wall Mounting — White Plains, NY -> Tarrytown / Scarsdale, NY
    content = content.replace(
        'Large Flat Screen TV Wall Mounting — White Plains, NY',
        'Large Screen 4K TV Precision Wall Mounting — Scarsdale, NY'
    )
    content = content.replace(
        'Job 0.2: Large Flat Screen TV Wall Mounting — White Plains, NY',
        'Job 0.2: Large Screen 4K TV Precision Wall Mounting — Scarsdale, NY'
    )

    # Slide 65: Handheld LED Temperature Display Showerhead Installation — White Plains, NY -> Rye, NY
    content = content.replace(
        'Handheld LED showerhead mounted on shower arm with water off — White Plains NY',
        'Handheld LED showerhead mounted on shower arm with water off — Rye NY'
    )
    content = content.replace(
        'Handheld LED digital display showerhead spraying water — White Plains NY',
        'Handheld LED digital display showerhead spraying water — Rye NY'
    )
    content = content.replace(
        'Handheld LED Temperature Display Showerhead Installation — White Plains, NY',
        'Hydro-Powered Digital LED Showerhead &amp; Wand Installation — Rye, NY'
    )
    content = content.replace(
        'Handheld Digital LED Temperature Display Showerhead — White Plains, NY',
        'Hydro-Powered Digital LED Showerhead & Wand Installation — Rye, NY'
    )

    # Slide 79: 77" LG OLED C5 4K TV Wall Mounting & Dual Credenza Assembly — White Plains, NY -> Larchmont, NY
    content = content.replace(
        'Grasscloth wallpaper wall before 77 inch TV wall mounting and credenza assembly — White Plains NY',
        'Grasscloth wallpaper wall before 77 inch TV wall mounting and credenza assembly — Larchmont NY'
    )
    content = content.replace(
        '77 inch LG OLED TV mounted on grasscloth wall above dual white storage credenza console — White Plains NY',
        '77 inch LG OLED TV mounted on grasscloth wall above dual white storage credenza console — Larchmont NY'
    )
    content = content.replace(
        '77" LG OLED C5 4K TV Wall Mounting &amp; Dual Credenza Assembly — White Plains, NY',
        '77" LG OLED C5 Cinema Display &amp; Dual Credenza Assembly — Larchmont, NY'
    )

    # Slide 82: Interior Wall Painting & Patching — White Plains, NY -> Bronxville, NY
    content = content.replace(
        'Wall before painting prep — White Plains NY',
        'Wall before painting prep — Bronxville NY'
    )
    content = content.replace(
        'Wall freshly painted — White Plains NY',
        'Wall freshly painted — Bronxville NY'
    )
    content = content.replace(
        'Interior Wall Painting &amp; Patching — White Plains, NY',
        'Level-5 Drywall Restoration &amp; Interior Painting — Bronxville, NY'
    )
    content = content.replace(
        'Job 5: Interior Wall Painting & Patching — White Plains, NY',
        'Job 5: Level-5 Drywall Restoration & Interior Painting — Bronxville, NY'
    )

    # Slide 94: Custom Handyman Project — White Plains, NY -> Armonk, NY
    content = content.replace(
        'Custom Handyman Project — White Plains, NY',
        'Custom Architectural Interior Trim &amp; Restoration — Armonk, NY'
    )
    content = content.replace(
        'Job 17: Custom Handyman Project — White Plains, NY',
        'Job 17: Custom Architectural Interior Trim & Restoration — Armonk, NY'
    )

    # Slide 97: Outdoor Pergola & Gazebo Structure Assembly — White Plains, NY -> Chappaqua, NY
    content = content.replace(
        'Pergola posts and beams laid out on driveway before assembly — White Plains NY',
        'Pergola posts and beams laid out on driveway before assembly — Chappaqua NY'
    )
    content = content.replace(
        'White outdoor pergola fully built in backyard patio — White Plains NY',
        'White outdoor pergola fully built in backyard patio — Chappaqua NY'
    )
    content = content.replace(
        'Outdoor Pergola &amp; Gazebo Structure Assembly — White Plains, NY',
        'Architectural Outdoor Pergola &amp; Gazebo Assembly — Chappaqua, NY'
    )

    # Slide 103: TIDITA Teak Corner Shower Stool Assembly — White Plains, NY -> Rye, NY
    content = content.replace(
        'TIDITA teak corner shower stool unboxed parts layout — White Plains NY',
        'Spa collection solid teak corner shower bench unboxed parts layout — Rye NY'
    )
    content = content.replace(
        'TIDITA 18 inch teak corner shower bench stool assembled — White Plains NY',
        'Spa collection solid teak corner shower bench assembled — Rye NY'
    )
    content = content.replace(
        'TIDITA Teak Corner Shower Stool Assembly — White Plains, NY',
        'Spa Collection Solid Teak Corner Shower Bench Assembly — Rye, NY'
    )
    content = content.replace(
        'Job 28: Teak Corner Shower Stool Assembly — White Plains, NY',
        'Job 28: Spa Collection Solid Teak Corner Shower Bench Assembly — Rye, NY'
    )

    # Slide 106: Patio & Exterior House Painting Makeover — White Plains, NY -> Bedford, NY
    content = content.replace(
        'Backyard patio and unpainted house exterior before makeover — White Plains NY',
        'Estate backyard patio and unpainted house exterior before makeover — Bedford NY'
    )
    content = content.replace(
        'Modern slate blue exterior house painting and patio staging makeover — White Plains NY',
        'Estate patio transformation and architectural slate exterior finish — Bedford NY'
    )
    content = content.replace(
        'Patio &amp; Exterior House Painting Makeover — White Plains, NY',
        'Estate Patio Transformation &amp; Architectural Slate Exterior Finish — Bedford, NY'
    )
    content = content.replace(
        'Job 31: Patio & Exterior Painting House Makeover — White Plains, NY',
        'Job 31: Estate Patio Transformation & Architectural Slate Exterior Finish — Bedford, NY'
    )

    # Other carousel comments referencing White Plains
    content = content.replace(
        'Job Shower Caddy: Shower Caddy Tension Pole Assembly & Installation — White Plains, NY',
        'Job Shower Caddy: Shower Caddy Tension Pole Assembly & Installation — Rye, NY'
    )
    content = content.replace(
        'Job Computer Desk: Computer Desk Assembly (Wood Top & Steel Frame) — White Plains, NY',
        'Job Computer Desk: Computer Desk Assembly (Wood Top & Steel Frame) — Chappaqua, NY'
    )
    content = content.replace(
        'Job Sleigh Bed: Upholstered Sleigh Bed Frame Assembly & Mattress Setup — White Plains, NY',
        'Job Sleigh Bed: Upholstered Sleigh Bed Frame Assembly & Mattress Setup — Bronxville, NY'
    )
    content = content.replace(
        'Job Flush Light: Modern Flush-Mount Ceiling Light Fixture Installation — White Plains, NY',
        'Job Flush Light: Modern Flush-Mount Ceiling Light Fixture Installation — Scarsdale, NY'
    )
    content = content.replace(
        'Job Shelves: Custom Natural Wood Floating Shelves on Subway Tile — White Plains, NY',
        'Job Shelves: Custom Solid Hardwood Floating Shelves on Subway Tile — Chappaqua, NY'
    )
    content = content.replace(
        'Job Mirror: Decorative Bathroom Mirror Mounting on Tile — White Plains, NY',
        'Job Mirror: Heavy Brass Designer Vanity Mirror Precision Wall Mounting — Rye, NY'
    )
    content = content.replace(
        'Job Gold Mirror: Large Gold Carved Frame Living Room Mirror Installation — White Plains, NY',
        'Job Gold Mirror: Ornate French Gilt Living Room Statement Mirror Installation — Rye, NY'
    )
    content = content.replace(
        'Job HVAC Coil: HVAC Fan Coil Unit Radiator Replacement — White Plains, NY',
        'Job HVAC Coil: Hydronic Fan Coil & Precision Copper Heating Element Replacement — Scarsdale, NY'
    )
    content = content.replace(
        'Job Attic Box: Attic Electrical Junction Box Repair & Code Compliance — White Plains, NY (10605)',
        'Job Attic Box: Estate Attic Electrical Safety Upgrades & Code-Compliance Box — Chappaqua, NY (10514)'
    )
    content = content.replace(
        'Job New TV: Large Flat Screen TV Wall Mounting — White Plains, NY (10538)',
        'Job New TV: Large Screen 4K TV Precision Wall Mounting — Larchmont, NY (10538)'
    )
    content = content.replace(
        'Job New Lock: Commercial Cabinet Door & Lock Cylinder Repair — The Westchester Mall, White Plains, NY',
        'Job New Lock: Commercial Executive Suite Cabinetry Hardware & High-Security Lock — Purchase, NY'
    )
    content = content.replace(
        'Job New 3: Belffin Velvet Modular Sectional Sofa Assembly — White Plains, NY',
        'Job New 3: Luxury Modular Sectional Sofa White-Glove Assembly & Staging — Chappaqua, NY'
    )
    content = content.replace(
        'Job New 6: High-Efficiency HVAC Filter Maintenance & Replacement — White Plains, NY',
        'Job New 6: High-Efficiency Estate HVAC Filtration & System Inspection — Bedford, NY'
    )
    content = content.replace(
        'Job 0.9: Bedroom Lighted Vanity Desk & Hutch Assembly — White Plains, NY',
        'Job 0.9: Bedroom Lighted Vanity Desk & Hutch Assembly — Tarrytown, NY'
    )
    content = content.replace(
        'Job 24: Custom Walk-In Closet Shelving & Wall Prep — White Plains, NY',
        'Job 24: Custom Master Walk-In Closet Organizer & Structural Shelving — Pound Ridge, NY'
    )

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("index.html updated successfully!")

if __name__ == '__main__':
    update_gallery()
    update_index()
