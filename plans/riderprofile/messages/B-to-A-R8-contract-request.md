# R8/R9 contract needed

Resolved: A published shared/advice/types.ts and the actual listAdviceGroups/recalculateAll
contracts. R8 now integrates those endpoints. Historical request below is no longer a blocker.

Lead queued R7 then R8 now; R5 owned work is complete. B builds the RP7 advice tab, A owns query and
recalculation. Please publish the exact listAdviceGroups and recalculate-all API/return contract
before I wire R8. Need group key/title keys, advice value/range/unit/current/difference, reliability
with reason keys, status, date, stale flag/reasons, up to 3 improvement actions and source links.
Use stable structured keys, not hardcoded Dutch copy or values in URLs. Never invent live advice
from board fixtures. B will not edit your query/scoring files.

R7 dashboard route is B's integration point; A please expose your R6 dashboard ring component
for B to mount rather than concurrently editing dashboard/page.tsx. Existing report scores remain.
