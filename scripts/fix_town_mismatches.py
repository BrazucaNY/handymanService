import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

replacements = [
    ('Cabinet Back Wall Plywood Closure &amp; Framing — Scarsdale, NY', 'Cabinet Back Wall Plywood Closure &amp; Framing — White Plains, NY'),
    ('Custom 3-Window Horizontal Blinds Installation — White Plains, NY', 'Custom 3-Window Horizontal Blinds Installation — Scarsdale, NY'),
    ('Lower Wall Water Damage Drywall Patching &amp; Baseboard Trim Restoration — Chappaqua, NY', 'Lower Wall Water Damage Drywall Patching &amp; Baseboard Trim Restoration — Scarsdale, NY'),
    ('Heavy Ornate Silver Mirror Wall Mounting &amp; Stud Anchoring — Harrison, NY', 'Heavy Ornate Silver Mirror Wall Mounting &amp; Stud Anchoring — Scarsdale, NY'),
    ('Large Flat Screen TV Wall Mounting — Larchmont, NY', 'Large Flat Screen TV Wall Mounting — White Plains, NY'),
    ('Precision Copper Pipe &amp; Quarter-Turn Valve Replacement — Hartsdale, NY', 'Precision Copper Pipe &amp; Quarter-Turn Valve Replacement — Scarsdale, NY'),
    ('Modern Bidet Toilet &amp; Bathroom Fixture Replacement — Dobbs Ferry, NY', 'Modern Bidet Toilet &amp; Bathroom Fixture Replacement — Scarsdale, NY'),
    ('Custom Bookshelf &amp; Desk Hutch Assembly — Pleasantville, NY', 'Custom Bookshelf &amp; Desk Hutch Assembly — Scarsdale, NY'),
    ('Custom Furniture Assembly &amp; Dresser Setup — Bedford, NY', 'Custom Furniture Assembly &amp; Dresser Setup — Scarsdale, NY'),
    ('Custom Handyman Project — New Rochelle, NY', 'Custom Handyman Project — White Plains, NY')
]

for orig, repl in replacements:
    if orig in c:
        c = c.replace(orig, repl)
        print(f'[FIXED index.html] {orig} -> {repl}')
    else:
        print(f'[NOT FOUND in index.html] {orig}')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)

with open('gallery.html', 'r', encoding='utf-8') as f:
    g = f.read()

g_repls = [
    ('id:"smart-lock-door-hardware-scarsdale", title:"Front Door Hardware & Smart Deadbolt Lock Installation", town:"Scarsdale"', 'id:"smart-lock-door-hardware-scarsdale", title:"Front Door Hardware & Smart Deadbolt Lock Installation", town:"White Plains"'),
    ('id:"bidet-toilet-yonkers", title:"Modern Bidet Toilet & Bathroom Fixture Replacement", town:"Yonkers"', 'id:"bidet-toilet-yonkers", title:"Modern Bidet Toilet & Bathroom Fixture Replacement", town:"Scarsdale"')
]

for orig, repl in g_repls:
    if orig in g:
        g = g.replace(orig, repl)
        print(f'[FIXED gallery.html] {orig} -> {repl}')
    else:
        print(f'[NOT FOUND in gallery.html] {orig}')

with open('gallery.html', 'w', encoding='utf-8') as f:
    f.write(g)
