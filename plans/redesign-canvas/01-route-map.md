# 01 — Route map (Codex A)

Read `plans/redesign-canvas/README.md` first.

## Task

Produce `plans/redesign-canvas/audit/route-map.md`. It maps every page route in `src/app` (every `page.tsx`, **excluding** `/admin/*` and API routes) to the redesign canvas.

The canvas boards that exist today are listed in `plans/redesign-canvas/canvas/canvas.json` (key `boards`, each with a `title`). Open the board files in `plans/redesign-canvas/canvas/` to see what each one covers.

## Output format

One markdown table per group: Public marketing · Public calculators · SEO/content · Auth · Dashboard/account.

| Route | What the page does (1 line, from the code) | Canvas board (existing file or MISSING) | Proposed board file | Priority (P1/P2/P3) | Notes |

Rules:
- Every route appears exactly once. Group duplicate/alias routes (e.g. `/bike-fitting` vs `/bikefitting`, NL/EN aliases) and say which one is canonical, based on redirects and `next.config.ts`.
- Routes that share one template (e.g. `/pain/[slug]`) need only one board. Say so.
- Priority: P1 = in the main navigation or the core conversion flow; P2 = supporting; P3 = long tail.
- End with a **Summary**: counts per group, the list of MISSING boards in proposed build order, and any routes you think should be merged or dropped (with the reason).

## Done when

- Every non-admin `page.tsx` is listed, and the lead can reproduce the count with `find src/app -name page.tsx | grep -v admin | wc -l`. Put that number at the top.
- No app code is changed. Only the output file is written.

When finished, print exactly `DONE 01` as your last line.
