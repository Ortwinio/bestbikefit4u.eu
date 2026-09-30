"""Verify rendered bilingual reports and rasterize their actual PDF pages.

Run with a Python environment containing PyMuPDF after render.mjs.
"""

import hashlib
import json
import re
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = ROOT / "plans/redesign-canvas/code-renders"
AUDIT = ROOT / "plans/redesign-canvas/audit/26-pdf.json"
FAMILIES = ("BricolageGrotesque", "Figtree", "DMMono")


def verify(locale, fixture="baseline"):
    prefix = "26-full" if fixture == "full" else "26"
    path = OUTPUT / f"{prefix}-report-{locale}.pdf"
    result = {
        "locale": locale,
        "fixture": fixture,
        "file": str(path.relative_to(ROOT)),
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "errors": [],
        "pages": [],
        "fonts": [],
    }
    with fitz.open(path) as document:
        result["pageCount"] = len(document)
        if len(document) != 6:
            result["errors"].append(f"Expected 6 pages, found {len(document)}")
        fonts = {}
        for number, page in enumerate(document, 1):
            # Chromium's CSS px conversion can differ from nominal A4 by < 1 point.
            a4 = abs(page.rect.width - 595.276) < 1 and abs(page.rect.height - 841.89) < 1
            footer = page.get_text(clip=fitz.Rect(0, page.rect.height - 65, page.rect.width, page.rect.height))
            footer_ok = bool(re.search(rf"\b{number}\s*/\s*6\b", footer))
            image = OUTPUT / f"{prefix}-pdf-{locale}-{number}.png"
            page.get_pixmap(matrix=fitz.Matrix(4 / 3, 4 / 3), alpha=False).save(image)
            result["pages"].append({
                "number": number,
                "widthPt": page.rect.width,
                "heightPt": page.rect.height,
                "a4": a4,
                "footer": footer.strip(),
                "footerCorrect": footer_ok,
                "render": str(image.relative_to(ROOT)),
            })
            if not a4:
                result["errors"].append(f"Page {number} is not portrait A4")
            if not footer_ok:
                result["errors"].append(f"Page {number} lacks its N / 6 footer")
            text = page.get_text()
            if locale == "nl" and number == 2:
                if "Core stability" in text or "Rompstabiliteit" not in text:
                    result["errors"].append("Dutch base-data score label is not localized")
            if locale == "nl" and number == 5:
                if "Saddle height of" in text or "Confirm long-ride comfort" in text:
                    result["errors"].append("Dutch fit notes leak English engine/fixture copy")
            for xref, extension, kind, name, *_ in page.get_fonts(full=True):
                if xref in fonts:
                    continue
                embedded = bool(document.extract_font(xref)[3]) if xref else False
                fonts[xref] = {"xref": xref, "name": name, "type": kind, "embedded": embedded}
                if kind == "Type3" or not name or not embedded:
                    result["errors"].append(f"Invalid font {xref}: {name!r}, {kind}, embedded={embedded}")
        result["fonts"] = list(fonts.values())
        for family in FAMILIES:
            if not any(family in font["name"] and font["embedded"] for font in fonts.values()):
                result["errors"].append(f"Missing named embedded family: {family}")
    result["passed"] = not result["errors"]
    return result


def main():
    results = []
    for locale in ("nl", "en"):
        for fixture in ("baseline", "full"):
            try:
                results.append(verify(locale, fixture))
            except Exception as error:
                results.append({"locale": locale, "fixture": fixture, "passed": False, "errors": [str(error)]})
    AUDIT.parent.mkdir(parents=True, exist_ok=True)
    AUDIT.write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n")
    for result in results:
        print(result["locale"], result["fixture"], "PASS" if result["passed"] else "FAIL", result["errors"])
    raise SystemExit(0 if all(result["passed"] for result in results) else 1)


if __name__ == "__main__":
    main()
