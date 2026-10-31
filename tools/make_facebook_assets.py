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
    w, h = 1640, 624
    img = gradient(w, h, INK, INK_SOFT)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w, 6], fill=GOLD)
    m = mark(120)
    img.paste(m, (260, 150), m)
    d.text((400, 150), "BOTTICUS", font=font("segoeuib.ttf", 54), fill=WHITE)
    d.text((402, 218), "Your life. Your business. Your Bot.", font=font("segoeui.ttf", 30), fill=MUTED)
    head = font("georgiab.ttf", 64)
    d.text((260, 320), "Message your Bot.", font=head, fill=WHITE)
    d.text((260, 400), "Watch it get done.", font=head, fill=GOLD)
    d.text((262, 505), "Tailored AI agents for business owners and their families  ·  Columbus, Ohio  ·  botticus.com", font=font("segoeui.ttf", 26), fill=MUTED)
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    profile().save(os.path.join(OUT, "profile-500.png"), "PNG", optimize=True)
    cover().save(os.path.join(OUT, "cover-1640x624.png"), "PNG", optimize=True)
    print("wrote profile-500.png and cover-1640x624.png to", OUT)


if __name__ == "__main__":
    main()
