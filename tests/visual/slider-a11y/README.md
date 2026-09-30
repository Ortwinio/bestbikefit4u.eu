# Slider accessibility regression

Run against a running frontend or the isolated final-sweep production server:

```sh
SLIDER_TEST_ORIGIN=http://127.0.0.1:4331 node tests/visual/slider-a11y/check.mjs
```

Checks NL/EN home, bike fit and public pressure at 1440/390. Axe checks allowed ARIA attributes;
native input and actual thumb hit areas must be at least 44px, while the visible circle stays 30px.
Keyboard ArrowRight must update the value. Dragging from outside the visible circle but inside its
larger hit area must also update it. No submissions or persistent data writes occur.

`SLIDER_TEST_OUTPUT` overrides the JSON output (default `/private/tmp/bbf25c-slider-browser.json`).
The sweep itself remains the authority for whole-page contrast, overflow and other target sizes.
