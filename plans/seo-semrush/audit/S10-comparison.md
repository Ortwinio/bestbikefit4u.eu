# S10 before / after

Three simulated-mobile lab runs per template on local production builds. The after build contains combined S10 image changes and S11 answer sections; it does not isolate either change. Medians below; run-to-run variation is not evidence of causation.

| Route | Metric | Before | After | Delta | After budget |
| --- | --- | ---: | ---: | ---: | --- |
| /en | largest-contentful-paint | 5328.265 | 5468.359 | 140.094 | FAIL |
| /en | cumulative-layout-shift | 0 | 0 | 0 | PASS |
| /en | total-blocking-time | 45 | 48.5 | 3.5 | PASS |
| /en/calculators/saddle-height | largest-contentful-paint | 5774.86 | 5292.737 | -482.123 | FAIL |
| /en/calculators/saddle-height | cumulative-layout-shift | 0 | 0 | 0 | PASS |
| /en/calculators/saddle-height | total-blocking-time | 87.19 | 32 | -55.19 | PASS |
| /en/guides/how-to-compare-two-bikes-for-fit | largest-contentful-paint | 4994.364 | 5486.032 | 491.668 | FAIL |
| /en/guides/how-to-compare-two-bikes-for-fit | cumulative-layout-shift | 0 | 0 | 0 | PASS |
| /en/guides/how-to-compare-two-bikes-for-fit | total-blocking-time | 31.5 | 50 | 18.5 | PASS |
| /en/pain/knee-pain-cycling | largest-contentful-paint | 5546.565 | 5042.009 | -504.556 | FAIL |
| /en/pain/knee-pain-cycling | cumulative-layout-shift | 0 | 0 | 0 | PASS |
| /en/pain/knee-pain-cycling | total-blocking-time | 42 | 41 | -1 | PASS |
| /en/pricing | largest-contentful-paint | 5471.197 | 5470.238 | -0.959 | FAIL |
| /en/pricing | cumulative-layout-shift | 0 | 0 | 0 | PASS |
| /en/pricing | total-blocking-time | 42.5 | 41 | -1.5 | PASS |
| /en/login | largest-contentful-paint | 5451.874 | 5518.779 | 66.904 | FAIL |
| /en/login | cumulative-layout-shift | 0 | 0 | 0 | PASS |
| /en/login | total-blocking-time | 29.5 | 28 | -1.5 | PASS |
