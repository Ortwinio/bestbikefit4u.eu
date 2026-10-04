import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parents[1]
font = TTFont(root / "public/brand/report/fonts/bricolage-grotesque-800-latin.woff2")
if "fvar" in font:
    axes = {axis.axisTag: axis.defaultValue for axis in font["fvar"].axes}
    axes.update({"wght": 800})
    font = instantiateVariableFont(font, axes)
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
scale = 40 / font["head"].unitsPerEm
cursor = 0
parts = []
for word in ["BikeFit", "Boost"]:
    paths = []
    for letter in word:
        glyph = glyphs[cmap[ord(letter)]]
        pen = SVGPathPen(glyphs)
        glyph.draw(pen)
        paths.append({"path": pen.getCommands(), "offset": round(cursor, 5)})
        cursor += glyph.width * scale - 1.2
    parts.append(paths)
output = {"scale": scale, "width": round(cursor + 1.2, 5), "parts": parts}
(root / "scripts/rebrand-assets-wordmark.json").write_text(json.dumps(output, indent=2) + "\n")
