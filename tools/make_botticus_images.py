"""Generate the Botticus share card and favicons.

Rendered deterministically rather than with an image model: the card carries exact
brand text, and a diffusion model garbles lettering. Re-run after a brand change.

    python tools/make_botticus_images.py

Writes img/og-card.png (1200x630), img/favicon-32.png, img/favicon-180.png
(apple-touch-icon). Brand values mirror css/style.css.
"""
from PIL import Image, ImageDraw, ImageFont
import os

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(os.path.dirname(HERE), "img")
FONTS = r"C:\Windows\Fonts"

INK = (21, 18, 28)          # --ink   #15121c
INK_SOFT = (33, 28, 45)
GOLD = (232, 163, 61)       # --gold  #e8a33d
WHITE = (255, 255, 255)
MUTED = (178, 172, 196)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def vertical_gradient(w, h, top, bottom):
    img = Image.new("RGB", (w, h), top)
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        row = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for x in range(w):
            px[x, y] = row
    return img


def rounded_mark(size, radius_ratio=0.25):
    """The square gold-on-ink 'B' used as the avatar and favicon."""
    scale = 4  # supersample so the rounded corners and serif edges stay clean
    s = size * scale
    tile = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * radius_ratio), fill=INK)
    f = font("georgiab.ttf", int(s * 0.62))
    box = d.textbbox((0, 0), "B", font=f)
    d.text(((s - (box[2] - box[0])) / 2 - box[0], (s - (box[3] - box[1])) / 2 - box[1]),
           "B", font=f, fill=GOLD)
    return tile.resize((size, size), Image.LANCZOS)


def og_card():
    w, h = 1200, 630
    img = vertical_gradient(w, h, INK, INK_SOFT)
    d = ImageDraw.Draw(img)

    # Gold rule along the top edge, echoing the site's accent.
    d.rectangle([0, 0, w, 8], fill=GOLD)

    mark = rounded_mark(104)
    img.paste(mark, (80, 86), mark)

    d.text((208, 100), "BOTTICUS", font=font("segoeuib.ttf", 40), fill=WHITE)
    d.text((210, 150), "Your business. Your bot.", font=font("segoeui.ttf", 26), fill=MUTED)

    headline = font("georgiab.ttf", 68)
    d.text((80, 250), "Message your business.", font=headline, fill=WHITE)
    d.text((80, 332), "Watch it get done.", font=headline, fill=GOLD)

    sub = font("segoeui.ttf", 28)
    d.text((80, 442), "Your own AI agent, trained on how your business actually runs.", font=sub, fill=MUTED)

    d.rectangle([80, 520, 80 + 92, 524], fill=GOLD)
    d.text((80, 548), "botticus.com", font=font("segoeuib.ttf", 30), fill=WHITE)
    return img


def main():
    os.makedirs(IMG, exist_ok=True)
    card = og_card()
    card.save(os.path.join(IMG, "og-card.png"), "PNG", optimize=True)
    for size, name in ((32, "favicon-32.png"), (180, "favicon-180.png")):
        rounded_mark(size).save(os.path.join(IMG, name), "PNG", optimize=True)
    print("wrote og-card.png (1200x630), favicon-32.png, favicon-180.png to", IMG)


if __name__ == "__main__":
    main()
