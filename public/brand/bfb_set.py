from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[2]
subprocess.run(["node", str(root / "scripts/rebrand-assets.mjs")], cwd=root, check=True)
