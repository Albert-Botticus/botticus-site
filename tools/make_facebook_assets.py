"""Facebook Page assets for Botticus: profile picture and cover photo (v2, 2026-10-31).

Deterministic (PIL), same brand values as make_botticus_images.py. Re-run after a brand change.

    python tools/make_facebook_assets.py

Writes to OneDrive\\Desktop\\Botticus\\facebook\\:
  profile-720.png      square; a gold chat bubble carrying the B mark, on ink. Reads at 40 px.
  cover-1640x624.png   headline on the left, a short Bot conversation on the right.

Cover safe area: Facebook shows the middle ~1110 px on phones and lays the round profile picture
over the bottom-left on desktop, so everything that matters sits inside x 265..1375 and above
y 470, and the bottom-left stays empty.
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
    w, h = 1640, 624
    img = gradient(w, h, INK_2, INK)
    glow(img, (900, -80, 1500, 420), GOLD_DEEP, 120)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w, 6], fill=GOLD)

    # Left: brand line + headline.
    x = 330
    m = mark(72)
    img.paste(m, (x, 110), m)
    d.text((x + 90, 112), "BOTTICUS", font=font("segoeuib.ttf", 40), fill=WHITE)
    d.text((x + 92, 158), "Your life. Your business. Your Bot.", font=font("segoeui.ttf", 24), fill=MUTED)
    head = font("georgiab.ttf", 62)
    d.text((x, 226), "Message your Bot.", font=head, fill=WHITE)
    d.text((x, 302), "Watch it get done.", font=head, fill=GOLD)
    d.text((x + 2, 392), "Tailored AI agents for business owners", font=font("segoeui.ttf", 26), fill=MUTED)
    d.text((x + 2, 426), "and their families. Columbus, Ohio.", font=font("segoeui.ttf", 26), fill=MUTED)
    d.text((x + 2, 478), "botticus.com", font=font("segoeuib.ttf", 26), fill=GOLD)

    # Right: a short conversation card. Inside the phone-safe area (x < 1375).
    cx0, cy0, cx1, cy1 = 975, 70, 1375, 556
    d.rounded_rectangle((cx0, cy0, cx1, cy1), radius=28, fill=INK_3)
    d.rounded_rectangle((cx0, cy0, cx1, cy0 + 58), radius=28, fill=(52, 46, 68))
    d.rectangle((cx0, cy0 + 30, cx1, cy0 + 58), fill=(52, 46, 68))
    mm = mark(34)
    img.paste(mm, (cx0 + 20, cy0 + 12), mm)
    d.text((cx0 + 64, cy0 + 15), "Your Bot", font=font("segoeuib.ttf", 22), fill=WHITE)
    d.ellipse((cx1 - 100, cy0 + 24, cx1 - 88, cy0 + 36), fill=(78, 196, 120))
    d.text((cx1 - 80, cy0 + 17), "online", font=font("segoeui.ttf", 18), fill=MUTED)

    fb = font("segoeui.ttf", 20)
    y = cy0 + 72
    maxw = 316
    pad = 14
    lh = 26
    chat = [
        ("you", "Did the Henderson order ship? Mia's field trip form is due Friday."),
        ("bot", "Shipped at 9:40, tracking sent. Field trip form signed and submitted, confirmation in your inbox."),
        ("you", "Perfect. Dentist Tuesday after 3?"),
        ("bot", "Booked, 3:40. On the family calendar, reminder at 2:30."),
    ]
    for who, text in chat:
        lines = wrap(d, text, fb, maxw - 2 * pad)
        tw = max(d.textlength(l, font=fb) for l in lines) + 2 * pad
        bh = len(lines) * lh + 2 * pad - 4
        if who == "you":
            x1 = cx1 - 22
            x0 = x1 - tw
            bubble(d, (x0, y, x1, y + bh), GOLD, 18, tail="right")
            color = INK
        else:
            x0 = cx0 + 22
            x1 = x0 + tw
            bubble(d, (x0, y, x1, y + bh), BUBBLE_BOT, 18, tail="left")
            color = WHITE
        ty = y + pad - 3
        for l in lines:
            d.text((x0 + pad, ty), l, font=fb, fill=color)
            ty += lh
        y += bh + 10
    assert y <= cy1 - 10, f"chat overflows the card by {y - (cy1 - 10)} px"
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    profile().save(os.path.join(OUT, "profile-720.png"), "PNG", optimize=True)
    cover().save(os.path.join(OUT, "cover-1640x624.png"), "PNG", optimize=True)
    print("wrote profile-720.png and cover-1640x624.png to", OUT)


if __name__ == "__main__":
    main()
