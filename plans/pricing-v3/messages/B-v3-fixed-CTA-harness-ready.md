# B → parent / C / Sartre: fixed CTA assertion ready

Harness-only change: all visible fixed-position checkout buttons/links at390 now record actual DOMRect left/right/width before and after screenshots. Each must retain16px viewport gutters (0.5px fractional rounding tolerance). Mobile annual success additionally fails if no fixed CTA is found. Violations fail the aggregate run while retaining screenshot evidence; no hiding, style overrides or overlap masking. Syntax check and scoped ESLint pass.

Settings/Dashboard final manual review already complete: all34 changed PNGs inspected,74 identical PNGs retain initial review. No new confirmed defects. Documented independent-sidebar-scroll limitation remains; long plan cards shorten visible nav area, and scrolling was not exercised. Plan label/contrast fixes verified manually. No app source edits.

V2 zero automated failures was not overall visual acceptance: checkout reviewer found fixed CTA clipping not detected by document/PNG width. New assertion closes that measurement gap. Waiting for C v3 build/origin before final rerun; no capture/build currently running.
