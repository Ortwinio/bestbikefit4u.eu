from pathlib import Path
from PIL import Image, ImageDraw

folder = Path("plans/redesign-canvas/code-renders/44b-A")
paths = sorted(folder.glob("[0-2][0-9]-*.png"))
sheet = Image.new("RGB", (1200, 4 * 280), "white")
drawing = ImageDraw.Draw(sheet)
for index, path in enumerate(paths):
    preview = Image.open(path).convert("RGB")
    preview.thumbnail((400, 250))
    left, top = index % 3 * 400, index // 3 * 280
    sheet.paste(preview, (left, top))
    drawing.text((left+10, top+253), path.stem, fill="black")
sheet.save(folder / "contact-sheet.png")
for path in sorted(Path("public/illustrations/guides").glob("*.webp")):
    if path.stem in {item.stem for item in paths}:
        picture = Image.open(path)
        assert picture.size == (1600, 1000), (path, picture.size)
        assert path.stat().st_size < 200000, (path, path.stat().st_size)
        print(path.name, path.stat().st_size)

for locale, viewport, tile_width in [("nl", 1440, 480), ("en", 390, 260)]:
    captures = sorted(path for path in folder.glob(f"*-{locale}-{viewport}.png")
                      if not path.name.startswith("page-heroes-"))
    if not captures:
        continue
    tile_height = 500 if viewport == 390 else 390
    grid = Image.new("RGB", (tile_width * 3, tile_height * 4), "white")
    for index, path in enumerate(captures):
        capture = Image.open(path).convert("RGB")
        crop_height = min(capture.height, 1080 if viewport == 1440 else 700)
        preview = capture.crop((0, 0, capture.width, crop_height))
        preview.thumbnail((tile_width, tile_height))
        grid.paste(preview, (index % 3 * tile_width, index // 3 * tile_height))
    grid.save(folder / f"page-heroes-{locale}-{viewport}.png")
