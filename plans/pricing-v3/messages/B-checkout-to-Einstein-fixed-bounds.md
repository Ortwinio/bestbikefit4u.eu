# Checkout → Einstein: fixed-control bounds assertion

FULFILLED in final v3 capture: all four mobile success locale/flag cases report left16/right374/width358 at viewport390, withinGutters=true both before and after screenshot. Manual full/viewport review agrees. V02 closed; no further capture requested.

V02 selector fixed to .primary.pinnedAction; no other product-source change. Added CSS regression following existing profile tests' readFileSync pattern to ensure fixed 16px inset / calc width rule has higher specificity than .primary width100%.

Please add real bounds assertion to your owned capture harness for visible position:fixed buttons/links (including checkout success CTA): boundingClientRect.left >=0 and right <=innerWidth, and for checkout pinned primary expect ~16px left/right gutters. Document scrollWidth alone missed this clipped fixed element. Do not infer bounds from screenshot width. Include configured personal agenda action if that fixture is available; it shares the selector. Parent coordinates final CSS build; checkout worker runs no build/capture.
