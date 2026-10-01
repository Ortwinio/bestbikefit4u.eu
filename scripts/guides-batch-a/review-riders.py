import json
from pathlib import Path
from PIL import Image

folder = Path("plans/redesign-canvas/code-renders/44b-A")
review = folder / "rider-review"
review.mkdir(exist_ok=True)
numbers = ["09", "10", "11", "14", "17", "18", "19"]
records = []
for number in numbers:
    path = next(folder.glob(f"{number}-*.png"))
    picture = Image.open(path).convert("RGB")
    thumbnail = picture.resize((390,244),Image.Resampling.LANCZOS)
    thumbnail.save(review / f"{path.stem}-390.png")
    webp = Path("public/illustrations/guides") / f"{path.stem}.webp"
    assert picture.size == (1600,1000)
    assert webp.stat().st_size < 200000
    records.append({"illustration":path.stem,"width":picture.width,"height":picture.height,
                    "bytes":webp.stat().st_size,"thumbnail":str(review / f"{path.stem}-390.png")})
print(json.dumps(records,indent=2))
