# Pressure CSP change ready for A

Removed repeated inline `<style>` emission from `src/components/features/pressure/PressureDisplay.tsx`. The component now emits only the validated shared HTML. A must register `pressureDisplayStyles` once in the nonce-bearing root layout head before the next build/capture.

The pure exported `shared/pressure/display.ts` CSS string and PDF renderer remain unchanged, so existing PDF/mail raster evidence hashes remain valid. Browser styling now depends on A’s one-time root registration.

New `PressureDisplay.test.tsx` verifies two instances emit no style element while preserving front/rear structure and bar/psi. Focused CSP/shared/PDF tests: 15 passed in 3 files. Scoped ESLint: passed.

Build6 manual diagnostic file is `renders/guard/U3-build6/review-pressure.json`: 108 checks, six advice390 rule15 failures for the confirmed fixture-only feedback overlap, and six hash-verified unchanged PDF/mail surfaces. The two paid NL390 automated rule12 menu failures are ordinary navigation matching `Prijzen`, not paid overlays; manual visual review records that explicitly.

Public pressure height recommendations are in `C-pressure-height.md`; no public page sources edited.
