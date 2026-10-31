"""Generate the Botticus share card and favicons.

Rendered deterministically rather than with an image model: the card carries exact
brand text, and a diffusion model garbles lettering. Re-run after a brand change.

    python tools/make_botticus_images.py

Writes img/og-card.png (1200x630), img/favicon-32/180/192/512.png and favicon.ico.
Brand values mirror css/style.css; the mark matches the Facebook profile picture.
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


def rounded_mark(size, radius_ratio=0.22, bubble_ratio=0.86):
    """The brand mark: ink rounded square carrying a gold chat bubble with an ink 'B'.
    Same drawing as the Facebook profile picture (tools/make_facebook_assets.py)."""
    scale = 4  # supersample so the curves and serif edges stay clean
    s = size * scale
    tile = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * radius_ratio), fill=INK)
    # Bubble body, slightly above centre so the tail has room.
    b = int(s * bubble_ratio)
    pad = int(s * 0.14 * bubble_ratio)
    off = (s - b) // 2
    x0, y0 = off + pad, off + pad - int(s * 0.02)
    x1, y1 = off + b - pad, off + b - pad - int(b * 0.06)
    d.rounded_rectangle([x0, y0, x1, y1], radius=int(b * 0.20), fill=GOLD)
    d.polygon([(x0 + int(b * 0.06), y1 - int(b * 0.16)), (x0 - int(b * 0.02), y1 + int(b * 0.10)), (x0 + int(b * 0.26), y1 - int(b * 0.01))], fill=GOLD)
    f = font("georgiab.ttf", int(b * 0.50))
    box = d.textbbox((0, 0), "B", font=f)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2 - int(b * 0.01)
    d.text((cx - (box[2] - box[0]) / 2 - box[0], cy - (box[3] - box[1]) / 2 - box[1]), "B", font=f, fill=INK)
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
    d.text((210, 150), "Your life. Your business. Your Bot.", font=font("segoeui.ttf", 26), fill=MUTED)

    headline = font("georgiab.ttf", 68)
    d.text((80, 250), "Your own AI employee.", font=headline, fill=WHITE)
    d.text((80, 332), "Tailored to your life.", font=headline, fill=GOLD)

    sub = font("segoeui.ttf", 28)
    d.text((80, 442), "Inbox, orders, invoices, school portals, appointments. Around the clock.", font=sub, fill=MUTED)

    d.rectangle([80, 520, 80 + 92, 524], fill=GOLD)
    d.text((80, 548), "botticus.com", font=font("segoeuib.ttf", 30), fill=WHITE)
    return img


def main():
    os.makedirs(IMG, exist_ok=True)
    card = og_card()
    card.save(os.path.join(IMG, "og-card.png"), "PNG", optimize=True)
    for size, name in ((32, "favicon-32.png"), (180, "favicon-180.png"), (192, "favicon-192.png"), (512, "favicon-512.png")):
        rounded_mark(size).save(os.path.join(IMG, name), "PNG", optimize=True)
    # favicon.ico at the site root: what browsers, Google and bookmark bars ask for first.
    # Pillow builds every ICO frame by downsizing the base image, so start from the largest.
    rounded_mark(256).convert("RGBA").save(os.path.join(os.path.dirname(IMG), "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("wrote og-card.png (1200x630), favicon-32/180/192/512.png to", IMG, "and favicon.ico to the site root")


if __name__ == "__main__":
    main()
