from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT = 1280, 640

image = Image.new("RGB", (WIDTH, HEIGHT), "#081425")
pixels = image.load()
for y in range(HEIGHT):
    for x in range(WIDTH):
        dx = (x - 1110) / 560
        dy = (y - 80) / 390
        glow = max(0.0, 1.0 - (dx * dx + dy * dy))
        pixels[x, y] = (
            int(8 + 15 * glow),
            int(20 + 54 * glow),
            int(37 + 78 * glow),
        )

draw = ImageDraw.Draw(image)
regular = ImageFont.truetype(str(ROOT / "fonts" / "Poppins-Regular.ttf"), 25)
semibold = ImageFont.truetype(str(ROOT / "fonts" / "Poppins-SemiBold.ttf"), 19)
bold = ImageFont.truetype(str(ROOT / "fonts" / "Poppins-Bold.ttf"), 76)
mark_font = ImageFont.truetype(str(ROOT / "fonts" / "Poppins-Bold.ttf"), 28)

draw.ellipse((835, 395, 1360, 920), outline=(38, 46, 50), width=82)
draw.rounded_rectangle((80, 72, 126, 118), radius=13, fill="#ffca35")
draw.text((96, 78), "#", font=mark_font, fill="#081425")
draw.text((144, 78), "Subway Surfers Mod Game", font=semibold, fill="#dceaf6")

draw.text((80, 185), "APK", font=bold, fill="#ffffff")
apk_width = draw.textlength("APK ", font=bold)
draw.text((80 + apk_width, 185), "SHA-256", font=bold, fill="#ffca35")
sha_width = draw.textlength("SHA-256 ", font=bold)
draw.text((80 + apk_width + sha_width, 185), "Verifier", font=bold, fill="#ffffff")

draw.text((80, 300), "Calculate a file checksum locally in the browser.", font=regular, fill="#dceaf6")
draw.text((80, 340), "No upload. No account. Open source.", font=regular, fill="#dceaf6")

chips = ["LOCAL PROCESSING", "4 MB CHUNKS", "64-CHARACTER DIGEST"]
x = 80
for index, label in enumerate(chips):
    box = draw.textbbox((0, 0), label, font=semibold)
    box_width = box[2] - box[0] + 36
    fill = "#ffca35" if index == 0 else "#ffffff"
    draw.rounded_rectangle((x, 435, x + box_width, 483), radius=24, fill=fill)
    draw.text((x + 18, 445), label, font=semibold, fill="#081425")
    x += box_width + 16

output = ROOT / "social-preview-1280x640.png"
image.save(output, "PNG", optimize=True)
print(output)
