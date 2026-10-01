"""Keep editable vectors local; commit small provenance for clean-checkout tests."""
from pathlib import Path
import hashlib
import json
import re
import sys


def archive(path):
    path = Path(path)
    source = path.read_text()
    webp = path.with_suffix('.webp')
    target = Path('plans/redesign-canvas/illustration-sources/guides') / path.name
    target.parent.mkdir(parents=True, exist_ok=True)
    manifest = Path('src/lib/guides/content/illustration-sources.json')
    records = json.loads(manifest.read_text()) if manifest.exists() else {}
    records[path.stem] = {
        'sourceSha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'webpSha256': hashlib.sha256(webp.read_bytes()).hexdigest(),
        'textElements': len(re.findall(r'<text\b', source)),
        'embeddedImages': len(re.findall(r'<image\b', source)),
    }
    manifest.write_text(json.dumps(records, indent=2, sort_keys=True)+'\n')
    path.replace(target)


if __name__ == '__main__':
    for name in sys.argv[1:]:
        archive(name)
