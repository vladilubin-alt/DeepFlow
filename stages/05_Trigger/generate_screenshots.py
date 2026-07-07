#!/usr/bin/env python3
"""
DeepFlow Screenshot Generator — Placeholder PNGs for Play Store listings.
Replaces these with real app screenshots before submission.

Usage: python3 generate_screenshots.py
"""

import os, struct, zlib

OUT = os.path.join(os.path.dirname(__file__), 'screenshots')
W, H = 1080, 1920
BG = (13, 13, 18)

def _chunk(t, d):
    c = t + d
    return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

def _png(w, h):
    raw = b'\x00' + bytes(BG) * w
    raw = b'\n'.join([raw] * h)
    c = zlib.compress(raw)
    return (b'\x89PNG\r\n\x1a\n' +
            _chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) +
            _chunk(b'IDAT', c) +
            _chunk(b'IEND', b''))

def main():
    listings = ['adhd_focus', 'pomodoro_writing', 'deep_work_timer', 'time_blindness']
    for l in listings:
        d = os.path.join(OUT, l)
        os.makedirs(d, exist_ok=True)
        for i in range(1, 6):
            p = os.path.join(d, f'screenshot_{i:02d}_{l}.png')
            with open(p, 'wb') as f:
                f.write(_png(W, H))
            print(f'  [+] {l}/{os.path.basename(p)}')

        ld = os.path.join(d, 'landscape')
        os.makedirs(ld, exist_ok=True)
        for i in range(1, 6):
            p = os.path.join(ld, f'screenshot_{i:02d}_{l}_landscape.png')
            with open(p, 'wb') as f:
                f.write(_png(1920, 1080))
            print(f'  [+] {l}/landscape/{os.path.basename(p)}')

    # Feature graphic
    fg = os.path.join(OUT, 'feature_graphic.png')
    with open(fg, 'wb') as f:
        f.write(_png(1024, 500))
    print(f'  [+] feature_graphic.png')

    print(f'\nDone. Replace with real screenshots before Play Store submission.')

if __name__ == '__main__':
    main()
