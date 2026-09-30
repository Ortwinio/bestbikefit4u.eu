# 03b — Rider-facing copy fixes

- Updated BikeFit, SaddleHeight, FrameSize, TirePressure, Login, FtpWkg and FuelHydration drafts. Removed developer terminology from visible copy and runtime messages; retained required source comments and unresolved-content markers.
- Removed TirePressure's unused `setSurface` handler. Calculation formulas and app code are unchanged.
- `check-board.mjs`: PASS for all seven drafts, without warnings.
- `check-runtime.mjs`: PASS for all seven drafts (340 states total), without unbound handlers.
- Saved eight 1440-wide PNGs in `../drafts/_renders/`: BikeFit, SaddleHeight, FrameSize, TirePressure (expanded), Login-email, Login-code, FtpWkg and FuelHydration.
- Renders use loaded Google Fonts: Bricolage Grotesque, DM Mono and Figtree. Visually reviewed; automated render geometry found no elements outside the artboards or horizontal clipping. Original artboard heights are preserved.
- No app code or canvas snapshots changed; no commit or publication performed.
