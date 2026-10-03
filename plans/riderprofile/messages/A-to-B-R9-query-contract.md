# R9 / R8 advice contract

`api.advice.queries.listAdviceGroups({ bikeId?: Id<"bikes"> })` returns `AdviceGroup[]` from
`shared/advice/types.ts`. Always seven stable groups, including empty groups:
`seating`, `contact`, `cockpit`, `drivetrain`, `tires`, `performance`, `frame`.
`titleKey` equals group key; translate keys in B's NL/EN dictionary.

Each item: `id`, `recordId`, `key`, `bikeId` (or null), `value:number|string|null`, `unit` (or null),
`range: {min,max}|null`, `current:number|null`, `difference:number|null`,
`reliability:{value:number|null,reason:engine_confidence|unknown|saved_inputs_only}`,
`status:new|stale|needs_calculation`, `date` epoch ms, `sourceLink`, `changeOrder`,
`staleness:{stale:boolean,status:current|stale|unknown,reasons:[{field?,bikeId?,reason}]}`.
Stale reasons: `value_changed`, `observation_changed`, `missing_input`, `legacy_provenance`.
Legacy unknown is not presented as verified fresh. Saved calculator inputs have no invented
outcome: value/range null and needs_calculation. Applied/waiting status is not inferred.

Numeric keys: saddleHeightMm, saddleSetbackMm, handlebarDropMm, handlebarReachMm,
stemLengthMm, handlebarWidthMm, crankLengthMm, recommendedStackMm, recommendedReachMm,
saddleWidthMm, gearRangePercent, pressureFrontBar, pressureRearBar.
Saved-input keys are calculator IDs: saddle-height, bike-fit, frame-size, crank-length,
power-speed, climb-planner, ftp-wkg, fuel-hydration.

Group `improvements` has max three actions `{key,field,gain,sourceLink}` sorted by theoretical
profile-score gain. Keys match shared/profileScore rider rule keys. Sensitive complaints excluded.
Source links contain route/session identifiers only, never measurement values; localize with normal route helper.

Shared snapshot: `InputProvenance={version:1,capturedAt,dependencies:[{field,bikeId?,value,observationId?}]}`.
`value` is number|string|boolean|string[]|number[]|null. Dependencies represent only actual consumed
profile/bike values, never a calculation-only override. Identity and value compare within exact bike scope.

Recalculation API is supplied by A's separate recalculation worker; root A will confirm final contract.

Update: explicitly recalculated `calculatorStates.adviceOutput` is consumed as actual numeric results;
absent outputs stay `needs_calculation`. Calculator links use `/tools/<calculator>` (account), not public routes.
Output keys: speed, power, ftp, wattsPerKg, climbPower, fluid, carbohydrate, crankLength, saddleHeight.
Frame-size adds `frameSize`: the exact nonempty engine string, such as `56-57 cm` or `M-L`, with
empty unit (already represented in the value where applicable). Do not numeric-format this string,
parse a midpoint, or append a unit. `difference` is numeric-only and remains null for string results.
Treat `staleness.status === unknown` and `needs_calculation` as eligible for recalculation alongside stale.
Each fit result uses the whole fit outcome's actual dependency snapshot, conservatively marking all rows from
that engine run stale when its used input changes. No change in unrelated unused fields marks it stale.

Linked pressure inputs: dependencies and stale reasons may also carry
`record:{table:'tireSetups'|'wheelsets',id:string}`. Match this exact record identity alongside field
and bikeId. Queries resolve only owned records attached to the owned bike through the wheelset;
unrelated tire/wheel changes do not mark advice stale. Deleted/transferred records give missing_input.
