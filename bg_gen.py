#!/usr/bin/env python3
"""Tech Grid — Modern developer-tool aesthetic with geometric precision.
Deep navy slate with coral accent. Clean, engineered, credible.
"""
import os, sys

PAGE_W, PAGE_H = 794, 1123
C = {'bg': '#0f172a', 'grid': '#1e293b', 'line': '#334155', 'accent': '#f97316', 'text': '#f8fafc', 'muted': '#94a3b8'}

SVG = lambda body: f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{{margin:0;padding:0}}body{{width:{PAGE_W}px;height:{PAGE_H}px;background:{C["bg"]}}}</style></head><body><svg width="{PAGE_W}" height="{PAGE_H}" xmlns="http://www.w3.org/2000/svg">{body}</svg></body></html>'''

# Cover: bold geometric grid with accent diagonal
COVER = SVG(f'''
<rect width="100%" height="100%" fill="{C['bg']}"/>
<!-- Subtle grid pattern -->
<g opacity="0.15">
<line x1="100" y1="0" x2="100" y2="1123" stroke="{C['grid']}" stroke-width="1"/>
<line x1="250" y1="0" x2="250" y2="1123" stroke="{C['grid']}" stroke-width="1"/>
<line x1="400" y1="0" x2="400" y2="1123" stroke="{C['grid']}" stroke-width="1"/>
<line x1="550" y1="0" x2="550" y2="1123" stroke="{C['grid']}" stroke-width="1"/>
<line x1="700" y1="0" x2="700" y2="1123" stroke="{C['grid']}" stroke-width="1"/>
<line x1="0" y1="200" x2="794" y2="200" stroke="{C['grid']}" stroke-width="1"/>
<line x1="0" y1="500" x2="794" y2="500" stroke="{C['grid']}" stroke-width="1"/>
<line x1="0" y1="800" x2="794" y2="800" stroke="{C['grid']}" stroke-width="1"/>
</g>
<!-- Accent diagonal stripe -->
<polygon points="500,0 794,0 794,400 650,400" fill="{C['accent']}" opacity="0.12"/>
<!-- Accent line -->
<line x1="80" y1="420" x2="350" y2="420" stroke="{C['accent']}" stroke-width="3" opacity="0.9"/>
<!-- Small accent dot -->
<circle cx="80" cy="410" r="4" fill="{C['accent']}"/>
<!-- Bottom accent bar -->
<rect x="0" y="1080" width="794" height="43" fill="{C['accent']}" opacity="0.08"/>
<!-- Code-like decoration -->
<text x="550" y="180" font-family="monospace" font-size="11" fill="{C['muted']}" opacity="0.4">// AI Spend Audit</text>
<text x="550" y="200" font-family="monospace" font-size="11" fill="{C['muted']}" opacity="0.4">// Round 1 Complete</text>
''')

# Body: minimal, clean, just a subtle top line
BODY = SVG(f'''
<rect width="100%" height="100%" fill="#ffffff"/>
<!-- Very subtle top accent line -->
<line x1="72" y1="50" x2="722" y2="50" stroke="{C['accent']}" stroke-width="1.5" opacity="0.3"/>
<!-- Subtle corner mark -->
<circle cx="722" cy="50" r="2" fill="{C['accent']}" opacity="0.2"/>
''')

# Backcover: echoes cover geometry, softened
BACK = SVG(f'''
<rect width="100%" height="100%" fill="{C['bg']}"/>
<!-- Grid echo -->
<g opacity="0.1">
<line x1="100" y1="0" x2="100" y2="1123" stroke="{C['grid']}" stroke-width="1"/>
<line x1="300" y1="0" x2="300" y2="1123" stroke="{C['grid']}" stroke-width="1"/>
<line x1="500" y1="0" x2="500" y2="1123" stroke="{C['grid']}" stroke-width="1"/>
<line x1="700" y1="0" x2="700" y2="1123" stroke="{C['grid']}" stroke-width="1"/>
</g>
<!-- Bottom accent area -->
<polygon points="0,900 300,900 200,1123 0,1123" fill="{C['accent']}" opacity="0.08"/>
<!-- Accent line -->
<line x1="80" y1="850" x2="280" y2="850" stroke="{C['accent']}" stroke-width="2" opacity="0.7"/>
<!-- Code decoration -->
<text x="80" y="880" font-family="monospace" font-size="10" fill="{C['muted']}" opacity="0.35">// shipped with Credex</text>
''')

def _render(tpl, out):
    from playwright.sync_api import sync_playwright
    os.makedirs(out, exist_ok=True)
    pairs = list(tpl.items())
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': PAGE_W, 'height': PAGE_H}, device_scale_factor=2)
        for n, h in pairs:
            pg.set_content(h)
            pg.screenshot(path=os.path.join(out, n), type='png')
            print(n)
        b.close()

if __name__=='__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '/mnt/agents/output/bg'
    _render({'cover_bg.png': COVER, 'backcover_bg.png': BACK, 'body_bg.png': BODY}, out)
    print("Done - Tech Grid backgrounds")
