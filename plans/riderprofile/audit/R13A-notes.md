# R13A — sourced estimate boundary

Only rider worktree. No commit, deploy, persisted observation or UI default.
Two disjoint A subagents researched FTP and flexibility; root owns shared contract and gates.

## Research decision

No verified reference reviewed supports either requested conversion from the available inputs.
Both functions therefore implement the explicitly requested `[PLACEHOLDER — bron?]` fallback.
It is developer-only: unavailable results contain no value/quality and must never be rendered,
persisted, used as calculator defaults or awarded completeness credit. This is not a numerical
estimate delivery. A valid model and its applicable population are still needed before enabling one.

### FTP

- Task 30's existing Allen/Coggan W/kg table, published by
  [Garmin](https://www8.garmin.com/manuals-apac/webhelp/fenix7series/EN-SG/GUID-6C0F3C49-1E05-4AE5-8EC0-367A47C07DAB-4498.html),
  classifies known FTP. Selecting an arbitrary fitness category would fabricate an individual estimate.
- [Coggan, Creating Your Power Profile](https://www.trainingpeaks.com/blog/power-profiling/)
  requires best-effort power and explicitly does not supply age-specific adjustments. No age factor,
  average percentile or conversion from demographic characteristics was invented or copied into a model.
- [McGrath et al., 2022](https://intjexersci.com/ijes/vol15/iss4/16) predicts FTP using exercise-test
  measurements, including power at 4 mmol/L blood lactate and maximal power, not demographics alone.

### Flexibility

- [Soucie et al., 2011](https://pubmed.ncbi.nlm.nih.gov/21070485/) and the
  [CDC primary joint-ROM dataset](https://archive.cdc.gov/www_cdc_gov/ncbddd/jointrom/index.html)
  provide age/sex population references for passive joint angles. They do not validate conversion
  to this app's five reaching categories. Copying angle tables would not supply that missing mapping.
- Consequently no invented category cutoffs, age bands or assumed average flexibility are shipped.

Sources, applicability and limitations are cited in sourcesFtp.ts and sourcesFlexibility.ts;
checked 3 October 2026. No unsupported reference table is presented as sourced prediction data.

## Contract

Pure estimateFtp/estimateFlexibility receive B's optional sex/birthDate and explicit evaluation time.
FTP also receives weight; existing target values always prevent replacement, even when other inputs
are invalid. No guessing sex, using legacy age as birth date, or overwriting measured/declared data.
Missing, invalid and abstained inputs have explicit unavailable reasons. Supported future output is
typed as derived with quality exactly 0.3, sources and bilingual `Geschat uit ...` / `Estimated from ...`
label keys. Scoring tests confirm current derived quality remains 0.3; score weights stay unchanged.
B notified not to promise unavailable estimates in rider-facing field reasons. No UI mount by A.

## Gates

- 142 focused tests pass: estimate modules, contract, existing profile scoring and advice reliability.
- Full npm run typecheck and npm run lint pass (/tmp/R13A-types.log, /tmp/R13A-lint.log).
- No renders: pure shared functions and unmounted dictionary labels only.
