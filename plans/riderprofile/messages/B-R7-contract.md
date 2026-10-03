# R7 prompt contract

Parent B owns schema and convex/profiles/prompts.ts (reexports through profiles queries/mutations).
No client-provided login marker: use authenticated Convex session ID (fallback user.lastLoginAt only
for local fake-auth fixtures). Server atomically reserves at most one card/24h and two slots/login.

`profiles.queries.nextPrompts({})` returns `{cardId:string|null,shownAt:number|null,hiddenUntil:number|null,
questions:PromptQuestion[]}`. No query writes. `profiles.mutations.openPromptCard({})` reserves a card
idempotently and returns the same view; mounting may call it once. `dismissPromptCard({cardId})`
hides all prompts seven days. `skipProfilePrompt({cardId,key})` hides that exact field/bike for 14 days;
three skips means profile-only. No replacement slot after answer/skip during the same login.

Question: `{key,field,bikeId?,bikeName?,value:number|string|null,unit,kind:"measured"|"estimated"|"declared",
range?:[number,number],options?:string[],effects:string[],gain:number,completenessGain:number,
effort:"quick"|"measure",stale:boolean,status:"pending"|"answered"|"skipped"}`.
No board defaults are saved; empty numerical input until entered, or explicit stale-value confirmation.

`answerProfilePrompt({cardId,key,value:number|string,expectedCurrentValue:number|string|null,
method:"single_measurement"|"self_assessment"|"self_report"|"ftp_test"})`
returns `{status:"saved",field}` or `{status:"conflict",field,currentValue,incomingValue}`.
Existing provenance helper supplies owner-scoped history. No claims that outcomes were recalculated;
success says which future calculations use the saved data. Actual ring scores update via live query.

Additional answer arg: measurePoint?:"bb_center_to_saddle_top", required for saddle height and rejected
for every other field. Only an actual measured saddle value gets measuredAt/point metadata; estimates
clear older measurement metadata. FTP ftp_test records derived/twentyMinute, not measured.
Dismiss retries return null without extending the original hide date. Pending slots are rechecked
against eligibility on query/answer; raising completeness above 90 hides remaining non-stale slots.

`recordPromptInterest({calculator})` stores only an allowlisted calculator key/time in
profilePromptActivity, for genuine advice views. No values/URLs are accepted. Recent = 30 days.

Tables: profilePrompts for per-field/bike skip metadata; profilePromptCards for server-selected
question slots, session marker, shownAt and optional hiddenUntil. Neither stores measurement values.
Question values always come from the latest profile/bike. Candidate planning excludes complaints,
injuries, age and other sensitive fields; >90% completeness offers only genuinely stale confirmations.
Recent relevance uses account calculator state usage within 30 days (documented interpretation).

A owns the dashboard ring hero component. B owns mounting/integration and the RP4 prompt card.
C owns bike routes; B writes only selected actual bike answers via authenticated prompt mutation.
