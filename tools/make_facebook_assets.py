"""Facebook Page assets for Botticus: profile picture and cover photo (v2, 2026-10-31).

Deterministic (PIL), same brand values as make_botticus_images.py. Re-run after a brand change.

    python tools/make_facebook_assets.py

Writes to OneDrive\\Desktop\\Botticus\\facebook\\:
  profile-720.png      square; a gold chat bubble carrying the B mark, on ink. Reads at 40 px.
  cover-1640x924.png   centred headline; see cover() for the crop reasoning.
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONTS = r"C:\Windows\Fonts"
OUT = r"C:\Users\OpenC\OneDrive\Desktop\Botticus\facebook"
INK = (21, 18, 28)
INK_2 = (31, 27, 42)
INK_3 = (44, 39, 58)
GOLD = (232, 163, 61)
GOLD_DEEP = (196, 130, 36)
WHITE = (255, 255, 255)
MUTED = (178, 172, 196)
BUBBLE_BOT = (58, 52, 76)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def gradient(w, h, top, bottom):
    img = Image.new("RGB", (w, h), top)
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        d.line([(0, y), (w, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return img


def glow(img, box, color, radius):
    """Soft radial light behind an element."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse(box, fill=color + (90,))
    layer = layer.filter(ImageFilter.GaussianBlur(radius))
    img.paste(layer, (0, 0), layer)


def bubble(d, box, fill, radius, tail=None):
    """Rounded chat bubble; tail 'left'/'right' squares off that bottom corner (chat-app look)."""
    corners = {"left": (True, True, True, False), "right": (True, True, False, True)}.get(tail, (True,) * 4)
    d.rounded_rectangle(box, radius=radius, fill=fill, corners=corners)


def wrap(d, text, f, width):
    words, lines, line = text.split(), [], ""
    for w in words:
        trial = (line + " " + w).strip()
        if d.textlength(trial, font=f) <= width:
            line = trial
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def mark(size):
    """Gold chat bubble with the ink B. Square canvas, transparent."""
    s = 4  # supersample for clean curves
    S = size * s
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = int(S * 0.14)
    box = (pad, pad, S - pad, S - pad - int(S * 0.06))
    bubble(d, box, GOLD, radius=int(S * 0.20))
    x0, y0, x1, y1 = box
    d.polygon([(x0 + int(S * 0.06), y1 - int(S * 0.16)), (x0 - int(S * 0.02), y1 + int(S * 0.10)), (x0 + int(S * 0.26), y1 - int(S * 0.01))], fill=GOLD)
    f = font("georgiab.ttf", int(S * 0.50))
    bb = d.textbbox((0, 0), "B", font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2 - int(S * 0.01)
    d.text((cx - tw / 2 - bb[0], cy - th / 2 - bb[1]), "B", font=f, fill=INK)
    return img.resize((size, size), Image.LANCZOS)


def profile():
    size = 720
    img = gradient(size, size, INK_2, INK)
    glow(img, (120, 120, 600, 600), GOLD_DEEP, 90)
    # Facebook shows the picture in a circle: keep the bubble tail inside that circle.
    m = mark(int(size * 0.84))
    off = (size - m.width) // 2
    img.paste(m, (off, off - 10), m)
    return img


def cover():
    """1640x924 (16:9, Meta's stated computer ratio). Desktop currently shows a ~2.7:1 band and
    phones 2.4:1, both from the middle, so everything sits inside the central 1250x560 and the
    background runs edge to edge. Deliberately little text: a cover is a sign, not a brochure."""
    w, h = 1640, 924
    img = gradient(w, h, INK_2, INK)
    glow(img, (560, 160, 1080, 680), GOLD_DEEP, 160)
    d = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2

    # Brand line
    m = mark(84)
    name_f = font("segoeuib.ttf", 46)
    name_w = d.textlength("BOTTICUS", font=name_f)
    bx = int(cx - (84 + 22 + name_w) / 2)
    img.paste(m, (bx, cy - 230), m)
    d.text((bx + 84 + 22, cy - 230 + 14), "BOTTICUS", font=name_f, fill=WHITE)

    # Headline, two lines, centred
    head = font("georgiab.ttf", 86)
    for i, (line, color) in enumerate([("Message your Bot.", WHITE), ("Get on with your day.", GOLD)]):
        tw = d.textlength(line, font=head)
        d.text((cx - tw / 2, cy - 110 + i * 104), line, font=head, fill=color)

    d.rectangle([cx - 60, cy + 122, cx + 60, cy + 126], fill=GOLD)

    sub_f = font("segoeui.ttf", 32)
    sub = "We tailor AI agents to you, your business, and your family."
    d.text((cx - d.textlength(sub, font=sub_f) / 2, cy + 150), sub, font=sub_f, fill=MUTED)
    site_f = font("segoeuib.ttf", 30)
    site = "botticus.com"
    d.text((cx - d.textlength(site, font=site_f) / 2, cy + 206), site, font=site_f, fill=GOLD)
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    profile().save(os.path.join(OUT, "profile-720.png"), "PNG", optimize=True)
    cover().save(os.path.join(OUT, "cover-1640x924.png"), "PNG", optimize=True)
    print("wrote profile-720.png and cover-1640x924.png to", OUT)


if __name__ == "__main__":
    main()
