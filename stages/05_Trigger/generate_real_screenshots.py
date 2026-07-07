#!/usr/bin/env python3
"""
DeepFlow Real Screenshot Generator — App-like mockups for Play Store listings.
Uses Pillow to render dark-theme UI mockups with 3-Second Rule captions.

Usage: python3 generate_real_screenshots.py
"""
import os, textwrap
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), 'screenshots')
W, H = 1080, 1920

# DeepFlow colour palette
BG = (13, 13, 18)
SURFACE = (22, 22, 28)
BORDER = (40, 40, 48)
TEXT_PRIMARY = (255, 255, 255)
TEXT_MUTED = (153, 153, 153)
ACCENT_GOLD = (201, 168, 76)
ACCENT_AMBER = (239, 159, 39)
STATE_DANGER = (235, 87, 87)

LISTINGS = {
    'adhd_focus': {
        'title': 'ADHD Focus Timer',
        'tagline': 'Structure without the shame spiral.',
        'screens': [
            {
                'slot': 1,
                'label': 'FlowOrb Session Setup',
                'caption': 'Set your goal. Start writing. No excuses.',
                'elements': 'orb_setup',
            },
            {
                'slot': 2,
                'label': 'Writing Arena',
                'caption': 'Distraction-free editor. Just you and the page.',
                'elements': 'writing',
            },
            {
                'slot': 3,
                'label': 'Focus Score Report',
                'caption': 'Real-time feedback on your writing velocity.',
                'elements': 'report',
            },
            {
                'slot': 4,
                'label': 'Grace Token Rescue',
                'caption': '3 streak saves per day. Perfection is overrated.',
                'elements': 'grace',
            },
            {
                'slot': 5,
                'label': 'Binaural Audio Controls',
                'caption': 'Alpha/Theta waves for deep flow states.',
                'elements': 'audio',
            },
        ],
    },
    'pomodoro_writing': {
        'title': 'Pomodoro Writing Timer',
        'tagline': 'Write in focused sprints. Build your streak.',
        'screens': [
            {'slot': 1, 'label': 'Session Setup', 'caption': 'Your Pomodoro writing timer starts here.', 'elements': 'orb_setup'},
            {'slot': 2, 'label': 'Active Sprint', 'caption': 'Timer runs, you write. No interruptions.', 'elements': 'writing'},
            {'slot': 3, 'label': 'Sprint Report', 'caption': 'See your words-per-session grow.', 'elements': 'report'},
            {'slot': 4, 'label': 'Streak Calendar', 'caption': 'Watch your consistency grow, one session at a time.', 'elements': 'streak'},
            {'slot': 5, 'label': 'Focus Layers', 'caption': 'Binaural beats for creative flow.', 'elements': 'audio'},
        ],
    },
    'deep_work_timer': {
        'title': 'Deep Work Timer',
        'tagline': 'Turn your phone into a focus tool.',
        'screens': [
            {'slot': 1, 'label': 'Set Your Target', 'caption': 'Words or minutes — you decide.', 'elements': 'orb_setup'},
            {'slot': 2, 'label': 'Writing Flow', 'caption': 'Deep work on autopilot.', 'elements': 'writing'},
            {'slot': 3, 'label': 'Post-Session Metrics', 'caption': 'Focus Score measures velocity, not word count.', 'elements': 'report'},
            {'slot': 4, 'label': 'Grace Token Recovery', 'caption': 'Life happens. Your streak is protected.', 'elements': 'grace'},
            {'slot': 5, 'label': 'Audio Focus Engine', 'caption': 'Distraction-free deep work starts here.', 'elements': 'audio'},
        ],
    },
    'time_blindness': {
        'title': 'Time Blindness Timer',
        'tagline': 'Visual flow tracking without clock anxiety.',
        'screens': [
            {'slot': 1, 'label': 'Visual Timer Startup', 'caption': 'No numbers. No countdown. Just flow.', 'elements': 'orb_setup'},
            {'slot': 2, 'label': 'Writing in Flow', 'caption': 'The orb grows. You write. Time disappears.', 'elements': 'writing'},
            {'slot': 3, 'label': 'Focus Analytics', 'caption': 'Actionable feedback on your session.', 'elements': 'report'},
            {'slot': 4, 'label': 'Guillotine Rescue', 'caption': '10-second fuse. Grace tokens save your streak.', 'elements': 'grace'},
            {'slot': 5, 'label': 'Sensory Controls', 'caption': 'Alpha/Beta waves for neurodivergent minds.', 'elements': 'audio'},
        ],
    },
}


def load_font(size, bold=False):
    try:
        if bold:
            return ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', size, index=0)
        return ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', size, index=1)
    except (OSError, IndexError):
        try:
            return ImageFont.truetype('/Library/Fonts/Arial.ttf', size)
        except OSError:
            return ImageFont.load_default()


def rounded_box(draw, x1, y1, x2, y2, fill, radius=12):
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill)


def draw_status_bar(draw):
    """iOS-like status bar at top."""
    fmt = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 26)
    draw.text((40, 60), '9:41', fill=TEXT_PRIMARY, font=fmt)
    # signal/battery placeholder
    draw.text((W - 120, 62), '📶 🔋', fill=TEXT_MUTED, font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 18))


def draw_orb_setup(draw, listing_title, listing_tagline):
    """Screen 1: Session setup with FlowOrb."""
    draw_status_bar(draw)
    # Title
    ttl = load_font(32, bold=True)
    draw.text((60, 140), listing_title, fill=TEXT_PRIMARY, font=ttl)
    sub = load_font(18)
    draw.text((60, 190), listing_tagline, fill=TEXT_MUTED, font=sub)

    # Orb circle
    cx, cy = W // 2, 520
    draw.ellipse([cx - 140, cy - 140, cx + 140, cy + 140], fill=None, outline=ACCENT_GOLD, width=4)
    draw.ellipse([cx - 100, cy - 100, cx + 100, cy + 100], fill=ACCENT_GOLD + (30,))
    inner_font = load_font(28, bold=True)
    draw.text((cx - 50, cy - 16), '0:00', fill=ACCENT_GOLD, font=inner_font)

    # Target input area
    rounded_box(draw, 60, 720, W - 60, 820, SURFACE)
    ifont = load_font(22)
    draw.text((100, 755), 'Tap to set target words or minutes', fill=TEXT_MUTED, font=ifont)

    # Start button
    rounded_box(draw, 200, 890, W - 200, 980, ACCENT_GOLD)
    bfont = load_font(28, bold=True)
    draw.text((W // 2 - 55, 922), '▶  Start', fill=BG, font=bfont)


def draw_writing_arena(draw):
    """Screen 2: Active writing session with timer."""
    draw_status_bar(draw)
    # Timer showing progress
    lfont = load_font(42, bold=True)
    draw.text((W // 2 - 60, 130), '12:34', fill=ACCENT_GOLD, font=lfont)
    # Progress bar
    rounded_box(draw, 60, 195, W - 60, 208, BORDER)
    rounded_box(draw, 60, 195, 540, 208, ACCENT_AMBER)

    # Words written
    wfont = load_font(20)
    draw.text((60, 240), 'words  342 / 500', fill=TEXT_MUTED, font=wfont)

    # Writing area
    rounded_box(draw, 40, 290, W - 40, 1200, SURFACE, radius=16)
    content_lines = [
        'The morning light crept through the curtain,',
        'casting long shadows across the wooden floor.',
        'She sat at the desk, fingers hovering over',
        'the keyboard, waiting for the words to come.',
        '',
        'They always came. Eventually.',
        'The trick was to stop waiting and start',
        'typing — even if the first draft was garbage.',
    ]
    lh = 50
    y_off = 340
    cfont = load_font(24)
    for ln in content_lines:
        draw.text((75, y_off), ln, fill=TEXT_PRIMARY, font=cfont)
        y_off += lh

    # Grace token indicator
    rounded_box(draw, 40, 1280, W - 40, 1340, SURFACE, radius=12)
    draw.text((80, 1305), '✦ GRACE TOKENS  03/03', fill=ACCENT_GOLD, font=load_font(18, bold=True))


def draw_focus_report(draw):
    """Screen 3: Post-session focus report."""
    draw_status_bar(draw)
    lfont = load_font(36, bold=True)
    draw.text((60, 140), 'Focus Report', fill=TEXT_PRIMARY, font=lfont)

    # Focus score big number
    sf = load_font(72, bold=True)
    draw.text((60, 230), '87', fill=ACCENT_GOLD, font=sf)
    sfl = load_font(22)
    draw.text((170, 265), 'Focus Score', fill=TEXT_MUTED, font=sfl)

    # Stats strip
    stats = [('Duration', '25:00'), ('Words', '487'), ('WPM', '19.5'), ('Streak', '12 d')]
    x = 60
    for label, val in stats:
        rounded_box(draw, x, 380, x + 230, 470, SURFACE, radius=12)
        draw.text((x + 20, 400), val, fill=TEXT_PRIMARY, font=load_font(30, bold=True))
        draw.text((x + 20, 438), label, fill=TEXT_MUTED, font=load_font(16))
        x += 250

    # Bar chart
    chart_y = 540
    draw.text((60, chart_y), 'Session Velocity', fill=TEXT_PRIMARY, font=load_font(22, bold=True))
    bars = [(100, 'M'), (180, 'T'), (140, 'W'), (210, 'T'), (160, 'F'), (190, 'S'), (170, 'S')]
    bar_x = 80
    max_h = 200
    for h, label in bars:
        bh = int(h / 210 * max_h)
        draw.rectangle([bar_x, chart_y + 80 + max_h - bh, bar_x + 80, chart_y + 80 + max_h], fill=ACCENT_GOLD)
        draw.text((bar_x + 30, chart_y + 80 + max_h + 10), label, fill=TEXT_MUTED, font=load_font(16))
        bar_x += 120


def draw_grace_token(draw):
    """Screen 4: Guillotine rescue / grace token moment."""
    draw_status_bar(draw)
    lfont = load_font(36, bold=True)
    draw.text((60, 140), 'Guillotine Triggered!', fill=STATE_DANGER, font=lfont)

    # Timer fuse
    sf = load_font(120, bold=True)
    draw.text((W // 2 - 70, 300), '07', fill=ACCENT_AMBER, font=sf)
    draw.text((W // 2 - 30, 440), 'seconds left', fill=TEXT_MUTED, font=load_font(20))

    # Grace token option
    rounded_box(draw, 60, 580, W - 60, 700, SURFACE, radius=16)
    draw.text((100, 610), '✦ Use Grace Token', fill=ACCENT_GOLD, font=load_font(26, bold=True))
    draw.text((100, 654), 'Save your streak (2 remaining today)', fill=TEXT_MUTED, font=load_font(18))

    # Give up option
    rounded_box(draw, 60, 740, W - 60, 840, SURFACE, radius=16)
    draw.text((100, 774), '✕ Let it go', fill=STATE_DANGER, font=load_font(22))

    # Visual pulse ring
    cx, cy = W // 2, 1050
    for r_off in [0, 30, 60]:
        r = 100 + r_off
        a = max(10, 80 - r_off * 2)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=None, outline=STATE_DANGER + (a,), width=3)


def draw_streak_calendar(draw):
    """Screen variant: streak calendar view."""
    draw_status_bar(draw)
    lfont = load_font(36, bold=True)
    draw.text((60, 140), 'Streak Calendar', fill=TEXT_PRIMARY, font=lfont)

    sf = load_font(72, bold=True)
    draw.text((60, 220), '12', fill=ACCENT_GOLD, font=sf)
    draw.text((170, 265), 'day streak', fill=TEXT_MUTED, font=load_font(22))

    # Calendar grid
    grid_x, grid_y = 60, 420
    days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    filled = [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1]
    cfont = load_font(14)
    idx = 0
    for row in range(4):
        for col in range(7):
            x = grid_x + col * 130
            y = grid_y + row * 130
            is_filled = idx < len(filled) and filled[idx]
            clr = ACCENT_GOLD if is_filled else BORDER
            draw.ellipse([x, y, x + 80, y + 80], fill=clr)
            draw.text((x + 35, grid_y + row * 130 + 95), days[col], fill=TEXT_MUTED, font=cfont)
            idx += 1


def draw_audio_controls(draw):
    """Screen 5: Binaural audio / sensory layer controls."""
    draw_status_bar(draw)
    lfont = load_font(36, bold=True)
    draw.text((60, 140), 'Focus Layers', fill=TEXT_PRIMARY, font=lfont)

    options = [
        ('Alpha (6 Hz)', 'Creative flow · Deep focus', True),
        ('Beta (14 Hz)', 'Analytical focus · Productivity', False),
        ('Theta (4 Hz)', 'Meditative · Light trance', False),
        ('White Noise', 'Background masking', False),
        ('Off', 'No audio layer', False),
    ]
    y_off = 260
    for name, desc, active in options:
        bg = ACCENT_GOLD + (20,) if active else SURFACE
        rounded_box(draw, 60, y_off, W - 60, y_off + 130, bg, radius=16)
        draw.text((100, y_off + 20), name, fill=ACCENT_GOLD if active else TEXT_PRIMARY, font=load_font(24, bold=True))
        draw.text((100, y_off + 65), desc, fill=TEXT_MUTED, font=load_font(16))
        if active:
            draw.text((W - 120, y_off + 35), '▶', fill=ACCENT_GOLD, font=load_font(28))
        y_off += 155

    # Volume slider
    rounded_box(draw, 100, y_off + 20, W - 100, y_off + 60, SURFACE, radius=8)
    rounded_box(draw, 100, y_off + 20, 500, y_off + 60, ACCENT_AMBER, radius=8)
    draw.text((W // 2 - 30, y_off + 25), 'Volume', fill=TEXT_MUTED, font=load_font(16))


ELEMENT_RENDERERS = {
    'orb_setup': lambda d, lt, ltg: draw_orb_setup(d, lt, ltg),
    'writing': lambda d, lt, ltg: draw_writing_arena(d),
    'report': lambda d, lt, ltg: draw_focus_report(d),
    'grace': lambda d, lt, ltg: draw_grace_token(d),
    'streak': lambda d, lt, ltg: draw_streak_calendar(d),
    'audio': lambda d, lt, ltg: draw_audio_controls(d),
}


def add_caption_overlay(draw, caption, is_landscape=False):
    """3-Second Rule caption overlaid at the bottom."""
    if is_landscape:
        box_h = 100
        y_base = H - box_h - 30
    else:
        box_h = 140
        y_base = H - box_h - 50

    # Semi-transparent bar
    for i in range(box_h):
        alpha = int(180 * (1 - i / box_h))
        draw.rectangle([0, y_base + i, W, y_base + i + 1], fill=(0, 0, 0, alpha))

    # Caption text
    cfont = load_font(30, bold=True)
    # Word wrap
    words = caption.split()
    lines = []
    current = ''
    for w in words:
        test = current + ' ' + w if current else w
        if cfont.getlength(test) < W - 120:
            current = test
        else:
            lines.append(current)
            current = w
    if current:
        lines.append(current)

    y_text = y_base + 20
    for ln in lines:
        bbox = cfont.getbbox(ln)
        tw = bbox[2] - bbox[0]
        draw.text(((W - tw) // 2, y_text), ln, fill=TEXT_PRIMARY, font=cfont)
        y_text += 42


def render_listing_screens(listing_key, listing_data):
    """Render all 5 screens for a listing, both portrait and landscape."""
    base_dir = os.path.join(OUT, listing_key)
    landscape_dir = os.path.join(base_dir, 'landscape')
    os.makedirs(base_dir, exist_ok=True)
    os.makedirs(landscape_dir, exist_ok=True)

    title = listing_data['title']
    tagline = listing_data['tagline']

    for screen in listing_data['screens']:
        slot = screen['slot']
        caption = screen['caption']
        elem = screen['elements']

        # Portrait
        img = Image.new('RGB', (W, H), BG)
        draw = ImageDraw.Draw(img)
        renderer = ELEMENT_RENDERERS.get(elem, lambda d, lt, ltg: None)
        renderer(draw, title, tagline)
        add_caption_overlay(draw, caption)
        fname = f'screenshot_{slot:02d}_{listing_key}.png'
        img.save(os.path.join(base_dir, fname))
        print(f'  [✓] {listing_key}/{fname}')

        # Landscape (1920x1080)
        Wl, Hl = 1920, 1080
        imgl = Image.new('RGB', (Wl, Hl), BG)
        drawl = ImageDraw.Draw(imgl)
        # Simplified landscape render — title bar + main element
        ttl_font = load_font(28, bold=True)
        drawl.text((60, 50), title, fill=TEXT_PRIMARY, font=ttl_font)
        drawl.text((60, 95), tagline, fill=TEXT_MUTED, font=load_font(18))
        # Content area
        element_map = {
            'orb_setup': lambda: draw_orb_setup_landscape(drawl),
            'writing': lambda: draw_writing_arena_landscape(drawl),
            'report': lambda: draw_focus_report_landscape(drawl),
            'grace': lambda: draw_grace_token_landscape(drawl),
            'streak': lambda: draw_streak_calendar_landscape(drawl),
            'audio': lambda: draw_audio_controls_landscape(drawl),
        }
        element_map.get(elem, lambda: None)()
        add_caption_overlay(drawl, caption, is_landscape=True)
        fname_l = f'screenshot_{slot:02d}_{listing_key}_landscape.png'
        imgl.save(os.path.join(landscape_dir, fname_l))
        print(f'  [✓] {listing_key}/landscape/{fname_l}')


def draw_orb_setup_landscape(draw):
    cx, cy = 960, 380
    draw.ellipse([cx - 90, cy - 90, cx + 90, cy + 90], fill=None, outline=ACCENT_GOLD, width=4)
    draw.ellipse([cx - 60, cy - 60, cx + 60, cy + 60], fill=ACCENT_GOLD + (30,))
    draw.text((cx - 30, cy - 16), '0:00', fill=ACCENT_GOLD, font=load_font(24, bold=True))
    rounded_box(draw, 600, 580, 1320, 660, SURFACE)
    draw.text((660, 610), 'Tap to set target words or minutes', fill=TEXT_MUTED, font=load_font(18))
    rounded_box(draw, 750, 720, 1170, 790, ACCENT_GOLD)
    draw.text((W // 2 - 40, 742), '▶  Start', fill=BG, font=load_font(24, bold=True))


def draw_writing_arena_landscape(draw):
    draw.text((60, 150), '12:34', fill=ACCENT_GOLD, font=load_font(36, bold=True))
    rounded_box(draw, 60, 210, 400, 222, BORDER)
    rounded_box(draw, 60, 210, 250, 222, ACCENT_AMBER)
    draw.text((60, 250), 'words  342 / 500', fill=TEXT_MUTED, font=load_font(16))
    rounded_box(draw, 60, 290, 1860, 900, SURFACE, radius=12)
    y_off = 330
    for ln in ['The morning light crept through the curtain,',
               'casting long shadows across the wooden floor.',
               'She sat at the desk, fingers hovering over',
               'the keyboard, waiting for the words to come.']:
        draw.text((100, y_off), ln, fill=TEXT_PRIMARY, font=load_font(22))
        y_off += 42


def draw_focus_report_landscape(draw):
    draw.text((60, 160), 'Focus Report', fill=TEXT_PRIMARY, font=load_font(28, bold=True))
    draw.text((80, 230), '87', fill=ACCENT_GOLD, font=load_font(60, bold=True))
    draw.text((170, 265), 'Focus Score', fill=TEXT_MUTED, font=load_font(18))
    stats = [('Duration', '25:00'), ('Words', '487'), ('WPM', '19.5'), ('Streak', '12 d')]
    x = 80
    for label, val in stats:
        rounded_box(draw, x, 370, x + 180, 440, SURFACE, radius=10)
        draw.text((x + 15, 383), val, fill=TEXT_PRIMARY, font=load_font(24, bold=True))
        draw.text((x + 15, 415), label, fill=TEXT_MUTED, font=load_font(14))
        x += 200


def draw_grace_token_landscape(draw):
    draw.text((60, 160), 'Guillotine Triggered!', fill=STATE_DANGER, font=load_font(30, bold=True))
    draw.text((W // 2 - 30, 260), '07', fill=ACCENT_AMBER, font=load_font(100, bold=True))
    draw.text((W // 2 - 30, 370), 'seconds left', fill=TEXT_MUTED, font=load_font(18))
    rounded_box(draw, 200, 460, W - 200, 540, SURFACE)
    draw.text((350, 482), '✦ Use Grace Token', fill=ACCENT_GOLD, font=load_font(22, bold=True))


def draw_streak_calendar_landscape(draw):
    draw.text((60, 160), 'Streak: 12 days', fill=TEXT_PRIMARY, font=load_font(28, bold=True))
    grid_x, grid_y = 100, 280
    for row in range(3):
        for col in range(7):
            x = grid_x + col * 90
            y = grid_y + row * 90
            draw.ellipse([x, y, x + 60, y + 60], fill=ACCENT_GOLD)


def draw_audio_controls_landscape(draw):
    draw.text((60, 160), 'Focus Layers', fill=TEXT_PRIMARY, font=load_font(28, bold=True))
    options = ['Alpha (6 Hz)', 'Beta (14 Hz)', 'Theta (4 Hz)', 'White Noise', 'Off']
    y_off = 250
    for name in options:
        rounded_box(draw, 80, y_off, W - 80, y_off + 90, SURFACE, radius=12)
        draw.text((130, y_off + 25), name, fill=TEXT_PRIMARY, font=load_font(20))
        y_off += 110


def render_feature_graphic():
    """Feature graphic: 1024x500"""
    fg = Image.new('RGB', (1024, 500), BG)
    draw = ImageDraw.Draw(fg)

    # Orb
    cx, cy = 160, 250
    draw.ellipse([cx - 60, cy - 60, cx + 60, cy + 60], fill=ACCENT_GOLD + (30,))
    draw.ellipse([cx - 80, cy - 80, cx + 80, cy + 80], fill=None, outline=ACCENT_GOLD, width=3)

    # Title
    draw.text((300, 170), 'DeepFlow', fill=ACCENT_GOLD, font=load_font(52, bold=True))
    draw.text((300, 240), 'ADHD Writing Timer', fill=TEXT_PRIMARY, font=load_font(28))
    draw.text((300, 295), 'Focus Timer · Grace Tokens · Streak Protection', fill=TEXT_MUTED, font=load_font(18))

    # Tagline
    rounded_box(draw, 300, 360, 850, 410, ACCENT_GOLD, radius=8)
    draw.text((330, 370), 'Structure without the shame spiral', fill=BG, font=load_font(18, bold=True))

    path = os.path.join(OUT, 'feature_graphic.png')
    fg.save(path)
    print(f'  [✓] feature_graphic.png')


def render_tablet_screens():
    """Tablet screenshots: 1920x1200 for each listing (2 per listing)."""
    for listing_key in LISTINGS:
        td = os.path.join(OUT, listing_key, 'tablet')
        os.makedirs(td, exist_ok=True)
        for i in range(1, 3):
            Wt, Ht = 1920, 1200
            img = Image.new('RGB', (Wt, Ht), BG)
            draw = ImageDraw.Draw(img)
            ttl_font = load_font(36, bold=True)
            draw.text((80, 80), LISTINGS[listing_key]['title'], fill=TEXT_PRIMARY, font=ttl_font)
            draw.text((80, 140), LISTINGS[listing_key]['tagline'], fill=TEXT_MUTED, font=load_font(22))
            # Content area
            rounded_box(draw, 80, 220, 1840, 1100, SURFACE, radius=20)
            cfont = load_font(28)
            draw.text((160, 300), 'Tap to start a focus session', fill=TEXT_PRIMARY, font=cfont)
            cx, cy = 960, 680
            draw.ellipse([cx - 120, cy - 120, cx + 120, cy + 120], fill=None, outline=ACCENT_GOLD, width=5)
            draw.ellipse([cx - 80, cy - 80, cx + 80, cy + 80], fill=ACCENT_GOLD + (25,))
            draw.text((cx - 40, cy - 18), '0:00', fill=ACCENT_GOLD, font=load_font(32, bold=True))
            fname = f'screenshot_tablet_{i:02d}_{listing_key}.png'
            img.save(os.path.join(td, fname))
            print(f'  [✓] {listing_key}/tablet/{fname}')


def main():
    print('DeepFlow Screenshot Generator — Real App Mockups\n')

    for listing_key, listing_data in LISTINGS.items():
        print(f'── {listing_key} ──')
        render_listing_screens(listing_key, listing_data)

    print('\n── feature graphic ──')
    render_feature_graphic()

    print('\n── tablet screenshots ──')
    render_tablet_screens()

    print(f'\nDone. All screenshots saved to {OUT}/')
    print('Upload these to Google Play Console → Store Listing → Screenshots.')


if __name__ == '__main__':
    main()
