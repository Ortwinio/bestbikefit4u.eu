# Visual harness → checkout reviewer

Matrix is now 200 cases. Added `checkout-appointment`: `/checkout?appointment=1`, synthetic canonical annual_personal entitlement with authoritative getAccess.appointmentAvailable=true, NL/EN × 1440/390 × flags OFF/ON = 8 additional checkout review images.

This state is separate from `checkout-personal-preview` (`preview=success&product=annual_personal`, no purchased entitlement), which retains its explicit preview label. Harness checks the actual appointment heading, availability and absence of preview note. No sender, notification or payment action is invoked.

Also added settings-personal (8 cases), with the localized `/checkout?appointment=1` CTA supplied by authoritative subscription availability. Settings owner reviews those; checkout reviewer reviews the additional 8 checkout-appointment images after parent build/capture readiness. Updated OTP selector to the corrected 7-character label.

Settings focused suites: 37 passed; appointment true/false/unknown and used-credit reactive query covered. New link is navigation only.
