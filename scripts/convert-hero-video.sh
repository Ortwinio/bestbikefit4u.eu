#!/usr/bin/env bash
# Convert the hero GIF to WebM + MP4 for use in HeroBackground.tsx.
#
# Requires: ffmpeg (brew install ffmpeg)
#
# Output files (place in public/):
#   bestbikefit4u-home.webm  (~300–600 KB vs 8.9 MB GIF)
#   bestbikefit4u-home.mp4   (Safari fallback)
#
# After conversion, update HeroBackground.tsx to use a <video> element:
#
#   <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover object-center">
#     <source src="/bestbikefit4u-home.webm" type="video/webm" />
#     <source src="/bestbikefit4u-home.mp4"  type="video/mp4" />
#   </video>
#
# You can then remove the animatedSrc prop from HeroBackground and the GIF overlay.

set -euo pipefail

GIF="public/bestbikefit4u-home.gif"

if ! command -v ffmpeg &>/dev/null; then
  echo "ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

echo "Converting $GIF → WebM…"
ffmpeg -i "$GIF" \
  -c:v libvpx-vp9 -b:v 0 -crf 33 \
  -vf "fps=15,scale=iw:ih:flags=lanczos" \
  -an -loop 0 \
  public/bestbikefit4u-home.webm

echo "Converting $GIF → MP4…"
ffmpeg -i "$GIF" \
  -c:v libx264 -preset slow -crf 28 \
  -vf "fps=15,scale=iw:ih:flags=lanczos" \
  -an -movflags +faststart \
  public/bestbikefit4u-home.mp4

echo "Done."
ls -lh public/bestbikefit4u-home.webm public/bestbikefit4u-home.mp4 public/bestbikefit4u-home.gif
