# Hosted email artwork

Regenerate with `node scripts/email-assets/generate.mjs` from the repository root.
The converter uses the existing `sharp` dependency and writes PNGs only to `public/email/`.

- `logo.png`: existing current horizontal logo, `public/brand/logo/logo-horizontaal.svg`.
  Exact 358 × 60 canvas for 179 × 30 display, proportions preserved on a white matte.
- `icon-*.png`: small code-native line icons defined in the converter; 2 px petrol
  strokes and round caps/joins at 24 × 24 logical size, rendered at 48 × 48.
- `measuring-kit.png`: existing house illustration `public/illustrations/06-meetset.webp`.
- `tyre.png`: existing house illustration `public/illustrations/04-bandenspanning.webp`.
- `stack-reach.png`: existing house illustration `public/illustrations/08-stack-en-reach.webp`.

All illustration art comes from the repository's existing in-house pen drawings; no stock
art, third-party downloads or new image generation. Illustrations preserve the full 4:3
composition at 960 × 720, suitable for 480 px display. PNG palettes keep every asset below
the existing 300,000-byte public image budget. The tyre illustration is prepared per the
specification, but no day-14 email is sent/rendered because that feature is out of scope.
