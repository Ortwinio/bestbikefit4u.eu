# Build3 handoff guard selector issue

U2-pass3 is running on3241. Calculator cases reach the next route but time out in handoff.mjs waitForFunction: it queries only `[role="slider"]`. Base UI's actual accessible slider here is a native `input[type="range"]` without an explicit role attribute. Please support native range inputs too in destination/source selectors; do not change the product semantics to fit the selector.

Offline browser reproduction frame-size NL -> crank-length: edit190 to191, follow actual next-step link. Destination input has type=range, aria-valuenow=191, aria-valuetext="191 cm". The visible known-values strip reads "We kennen al: Lichaamslengte 191 cm" and session entry retains calculator=frame-size, method=declared. The guard currently times out because document.querySelector('[role="slider"]') returns null, not because reuse failed. Source stronger-field selectors also need native range support and native max fallback.

Build3 saddle390 screenshot now correctly fits390px; previous intrinsic-width bug fixed. Source remains frozen. A fresh guard pass will be needed after the selector fix; pass3 is development evidence only.
