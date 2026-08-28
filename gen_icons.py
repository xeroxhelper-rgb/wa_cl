from PIL import Image, ImageDraw

INK = (18, 21, 26, 255)      # #12151A
ACCENT = (255, 90, 42, 255)  # #FF5A2A
WHITE = (255, 255, 255, 255)

def rounded_bg(size, radius_ratio=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = int(size * radius_ratio)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=INK)
    return img, draw

def draw_corner_frame(draw, size):
    margin = size * 0.24
    bracket = size * 0.16
    stroke = max(int(size * 0.045), 3)
    pts = [
        # top-left
        [(margin, margin + bracket), (margin, margin), (margin + bracket, margin)],
        # top-right
        [(size - margin - bracket, margin), (size - margin, margin), (size - margin, margin + bracket)],
        # bottom-left
        [(margin, size - margin - bracket), (margin, size - margin), (margin + bracket, size - margin)],
        # bottom-right
        [(size - margin - bracket, size - margin), (size - margin, size - margin), (size - margin, size - margin - bracket)],
    ]
    for path in pts:
        draw.line(path, fill=WHITE, width=stroke, joint="curve")
        # round the caps
        for (x, y) in [path[0], path[-1]]:
            r = stroke / 2
            draw.ellipse([x - r, y - r, x + r, y + r], fill=WHITE)

def draw_accent_dot(img, size):
    d = ImageDraw.Draw(img)
    r = size * 0.085
    cx, cy = size * 0.5, size * 0.5
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=ACCENT)

def make_icon(size, path):
    img, draw = rounded_bg(size)
    draw_corner_frame(draw, size)
    draw_accent_dot(img, size)
    img.save(path, "PNG")

make_icon(192, "icons/icon-192.png")
make_icon(512, "icons/icon-512.png")
print("done")
