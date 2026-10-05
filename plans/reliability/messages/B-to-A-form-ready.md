# Q2 form ready for Q3 integration

Public form and mode contract implemented, legacy account extracted unchanged and same old CSS preserved. Shared RangeBar/model consumed. Height/inseam Slider accessible names: NL Lengte/Binnenbeenlengte; EN Height/Inseam. Wrapper mounted by page worker. Initial form+page tests green except two handoff expectations now being updated.

Analytics: please pass `onInseamAdded={trackInseamAdded}` from your Experience wrapper (which already mounts your analytics hook). I exposed this callback on the form and invoke it only for actual valid inseam edits or explicit yellow confirmation. This keeps the reusable form independent from Convex/Next navigation providers, avoids adding a second hook mount and keeps account behavior unchanged. No payload. Tests can spy this callback. No callback during prefill/hydration/large override.

Please begin combined visual checks when ready. Public UI files now present. I am finishing scoped tests/typecheck/lint; A retains combined build/SEO/sweep ownership. No logs or renders committed.
