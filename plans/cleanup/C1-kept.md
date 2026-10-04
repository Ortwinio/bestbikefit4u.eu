# C1 kept dependencies

Final verification: every pre-existing retained inventory file exists; 15 focused checks cover guide identities, six rendered PDF boards, route inventory, audit JSON inputs, baseline materials and output creation contracts. All combined gates pass; see [A-combined-gates.md](A-combined-gates.md). Six Git-ignored output markers are optional on a fresh checkout because retained writers create those directories recursively. No test depends on versioning rendered images or missing archive files.

Required inputs and operational outputs are retained in place; no script/test paths are migrated. Output directories receive README markers where useful. Existing ignored local reader inputs are preserved. No baseline/production job was run.

## Exact retained files at deletion inventory

| Path | Reason |
| --- | --- |
| `plans/README.md` | Owner-required folder convention |
| `plans/rebrand/canvas/bikefitboost-merkblad.md` | Brand documentation dependency |
| `plans/rebrand/canvas/project/mail/N14Dag14.dc.html` | Email asset documentation dependency |
| `plans/redesign-canvas/audit/44a-guides-audit.json` | Guide review input |
| `plans/redesign-canvas/audit/47-optimized.json` | Image comparison input |
| `plans/redesign-canvas/audit/route-map.md` | Sweep route test input |
| `plans/redesign-canvas/canvas/FitRapport1.dc.html` | Dynamic PDF board input |
| `plans/redesign-canvas/canvas/FitRapport2.dc.html` | Dynamic PDF board input |
| `plans/redesign-canvas/canvas/FitRapport3.dc.html` | Dynamic PDF board input |
| `plans/redesign-canvas/canvas/FitRapport4.dc.html` | Dynamic PDF board input |
| `plans/redesign-canvas/canvas/FitRapport5.dc.html` | Dynamic PDF board input |
| `plans/redesign-canvas/canvas/FitRapport6.dc.html` | Dynamic PDF board input |
| `plans/redesign-canvas/final-sweep/40a-nl/cases.jsonl` | NL reanalysis input |
| `plans/redesign-canvas/final-sweep/40a-nl/report.json` | NL reanalysis input |
| `plans/redesign-canvas/guides-import/bike-fit-for-beginners-and-returning-riders.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/bike-fit-for-foot-pain-hot-foot-and-numb-toes.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/bike-fit-for-hand-numbness-and-wrist-pain.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/bike-fit-for-neck-and-shoulder-pain.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/bike-fit-for-riders-with-a-shorter-torso.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/bike-fit-for-riders-with-limited-flexibility.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/bike-fit-for-tall-riders.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/bike-fitting-for-knee-pain.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/bike-fitting-for-lower-back-pain.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/bike-size-and-geometry.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/carbs-per-hour-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/cleat-position-basics-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/climb-time-and-event-pacing-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/crank-length-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/cycling-fueling-basics.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/cycling-shoe-fit-width-and-last-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/endurance-bike-fit-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/fit-science.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/foot-measurement-guide-for-cyclists.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/frame-size-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/ftp-explained.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/gravel-bike-fit-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/handlebar-drop-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/handlebar-width-and-hood-position-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/how-to-compare-two-bikes-for-fit.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/hydration-and-sweat-rate-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/indoor-trainer-bike-fit-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/insoles-arch-support-and-footbeds-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/mountain-bike-fit-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/nutrition-and-hydration.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/pain-and-discomfort.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/power-ftp-pacing.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/power-to-speed-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/reach-and-stem-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/ride-types.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/rider-profiles.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/road-bike-fit-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/road-vs-endurance-vs-race-geometry.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/saddle-fore-aft-and-tilt-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/saddle-height-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/setup-parameters.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/shoe-foot-cleat-fit.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/sodium-and-electrolytes-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/stance-width-q-factor-and-pedal-spacer-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/triathlon-bike-fit-guide.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/when-online-bike-fit-has-limits.json` | Dynamic guide fixture/import input |
| `plans/redesign-canvas/guides-import/wkg-and-power-zones-guide.json` | Dynamic guide fixture/import input |
| `plans/riderprofile-baseline/R0-owner.md` | 18 October baseline operational materials |
| `plans/riderprofile-baseline/README.md` | 18 October baseline operational materials |
| `plans/riderprofile-baseline/audit/.gitignore` | 18 October baseline operational materials |
| `plans/riderprofile-baseline/audit/R0-notes.md` | 18 October baseline operational materials |
| `plans/riderprofile-baseline/audit/files-R0.txt` | 18 October baseline operational materials |
| `plans/riderprofile-baseline/audit/verify-events.mjs` | 18 October baseline operational materials |
| `plans/seo-semrush/audit/S9-internal-links.json` | SEO discovery input |
| `plans/tmux-ide-minimal-operating-convention.md` | Live policy linked by root README |

## Protected trees

- `plans/cleanup/**`: current task, audits and tests (including files created during cleanup).
- `plans/migratie/**`: all live manual migration runbooks, source evidence and existing ignored previews.
- `plans/riderprofile-baseline/**`: six operational files for the 18 October baseline and report; no production execution.

## Output directory contracts

- `plans/seo-crawl-fixes/audit/`: preserve directory; writer-generated reports can be recreated.
- `plans/riderprofile-baseline/`: preserve directory; writer-generated reports can be recreated.
- `plans/migratie/audit/`: preserve directory; writer-generated reports can be recreated.
- `plans/rebrand/renders/`: preserve directory; writer-generated reports can be recreated.
- `plans/rebrand/renders/emails/`: preserve directory; writer-generated reports can be recreated.
- `plans/rebrand/audit/`: preserve directory; writer-generated reports can be recreated.
- `plans/seo-semrush/audit/`: preserve directory; writer-generated reports can be recreated.
- `plans/seo-semrush/renders/`: preserve directory; writer-generated reports can be recreated.
- `plans/redesign-canvas/guides-import/`: preserve directory; writer-generated reports can be recreated.
- `plans/redesign-canvas/illustration-sources/originals/`: preserve directory; writer-generated reports can be recreated.
- `plans/redesign-canvas/illustration-sources/guides/`: preserve directory; writer-generated reports can be recreated.
- `plans/redesign-canvas/audit/`: preserve directory; writer-generated reports can be recreated.
- `plans/redesign-canvas/code-renders/`: preserve directory; writer-generated reports can be recreated.
- `plans/redesign-canvas/final-sweep/`: preserve directory; writer-generated reports can be recreated.

## Known pre-existing missing optional inputs

Ignored illustration originals, eight optional marketing board PNGs and S10 before/after summaries were already absent in this checkout. Their dynamic contracts remain documented; C1 does not manufacture or delete those absent inputs. The required current guide import set is 48 JSON files; six FitRapport boards and route/SEO/image audit inputs remain.

## Documentary links

C3 repaired root README's tmux link to a portable repository-relative URL. Its convention file, the brand merkblad and the N14 email board remain at their documented paths. Output markers were added without changing writers, and the existing baseline README records the planned 18 October reminder without claiming scheduler configuration.

The live tmux convention remains linked from the root README; brand merkblad and N14 email board remain at their documented paths. Other superseded historical plan prose is removed per the owner's exact authorization. plans/README.md now explains the current folder convention and compatibility islands.
