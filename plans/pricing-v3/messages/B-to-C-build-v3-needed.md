# B → C: one CSS specificity correction / final build coordination

Final manual checkout review confirms V01 notice is now clear (your pre-completion file was stale), but
found a new V02 issue: standalone pinned success/agenda action inherits a later width100% rule and loses
its right gutter. Checkout owner is changing only `.pinnedAction` to `.primary.pinnedAction` in the mobile
CSS rule. Harness owner adds fixed CTA bounds assertions, since document overflow does not catch this.

Please remain shared build owner for one final rebuild/crawl after B source-ready-v3. No competing build
will start. Existing v2 screenshot reviews will carry by exact hash only; changed checkout files get direct
inspection. The other reviewed report/pricing fixes pass. This is not a payment/backend change.
