"""Facebook Page assets for Botticus: profile picture and cover photo.

Deterministic (PIL), same brand values as make_botticus_images.py. Re-run after a brand change.

    python tools/make_facebook_assets.py

Writes to OneDrive\\Desktop\\Botticus\\facebook\\: profile-500.png (square, the B mark) and
cover-1640x624.png (desktop cover; Facebook crops the sides on phones, so the text stays in the
middle 1200 px).
"""
import os
from PIL import Image, ImageDraw, ImageFont

FONTS = r"C:\Windows\Fonts"
OUT = r"C:\Users\OpenC\OneDrive\Desktop\Botticus\facebook"
INK = (21, 18, 28)
INK_SOFT = (33, 28, 45)
GOLD = (232, 163, 61)
WHITE = (255, 255, 255)
MUTED = (178, 172, 196)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def gradient(w, h, top, bottom):
    img = Image.new("RGB", (w, h), top)
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        d.line([(0, y), (w, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return img


def mark(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size, size], radius=int(size * 0.22), fill=INK)
    f = font("georgiab.ttf", int(size * 0.62))
    box = d.textbbox((0, 0), "B", font=f)
    d.text(((size - (box[2] - box[0])) / 2 - box[0], (size - (box[3] - box[1])) / 2 - box[1]), "B", font=f, fill=GOLD)
    return img


def profile():
    # Facebook shows it in a circle; keep the B centred and the corners dark.
    img = Image.new("RGB", (500, 500), INK)
    m = mark(500)
    img.paste(m, (0, 0), m)
    return img


def cover():
    # Facebook's current Page layout centres the round profile picture over the bottom-middle of the
    # cover (and crops the sides on phones). Everything important sits in the top half, left of
    # centre, and the bottom-middle stays empty.
    w, h = 1640, 624
    img = gradient(w, h, INK, INK_SOFT)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w, 6], fill=GOLD)
    x = 150
    m = mark(84)
    img.paste(m, (x, 58), m)
    d.text((x + 104, 58), "BOTTICUS", font=font("segoeuib.ttf", 44), fill=WHITE)
    d.text((x + 106, 110), "Your life. Your business. Your Bot.", font=font("segoeui.ttf", 26), fill=MUTED)
    head = font("georgiab.ttf", 62)
    d.text((x, 190), "Message your Bot.", font=head, fill=WHITE)
    d.text((x, 268), "Watch it get done.", font=head, fill=GOLD)
    d.text((x + 2, 352), "Tailored AI agents for business owners and their families.", font=font("segoeui.ttf", 26), fill=MUTED)
    tail = "Columbus, Ohio  ·  botticus.com"
    f = font("segoeui.ttf", 26)
    tw = d.textlength(tail, font=f)
    d.text((w - 150 - tw, 548), tail, font=f, fill=MUTED)
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    profile().save(os.path.join(OUT, "profile-500.png"), "PNG", optimize=True)
    cover().save(os.path.join(OUT, "cover-1640x624.png"), "PNG", optimize=True)
    print("wrote profile-500.png and cover-1640x624.png to", OUT)


if __name__ == "__main__":
    main()
