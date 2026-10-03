# R2 contract — profile handoff

API endpoints: `api.profiles.mutations.importHandoff` and
`api.profiles.queries.getHandoffContext`. Both require the current authenticated user;
neither accepts a userId. No values in URLs, analytics or logs.

## Observations

`profileObservations`: userId, field, value (number|string), unit (string),
kind (`measured`|`estimated`|`derived`|`declared`), method (string), source
(`public_handoff`), recordedAt (epoch milliseconds), status (`current`|`superseded`).
Index `by_user_field` = [userId, field]. Optional bikeId for bike observations.
Historical observations remain; new current observations supersede previous ones for the same field/bike.

## Mutation

`importHandoff({ records, resolutions?, bike? })`

- records: array of C's HandoffEntry `{ field, value, unit, calculator, method, touchedAt }`.
  No kind/timestamp parameter: server derives kind from method and recordedAt from touchedAt.
  C owns browser envelope/key/helpers; pass selected `record.entries` only.
  Backend permits only known fields and their exact units/enums/profile bounds.
- resolutions: optional array `{ field, choice: "profile"|"today"|"remeasure",
  expectedCurrentValue: number|string }`. Explicit today is allowed only if the
  current value still equals expectedCurrentValue; otherwise return a fresh conflict.
  profile/remeasure preserve current value and omit incoming observation.
- bike: optional `{ name: string, bikeType: existing bikes.bikeType enum,
  saddleHeightMeasurePoint?: "bb_center_to_saddle_top" }`.
  Creates one owned bike only on a successful conflict-free confirmation. Only selected,
  recognized bike records are applied. Saddle height requires its explicit measure point.

Return: `{ status: "conflicts"|"imported", importedFields: string[],
  conflicts: Array<{ field: string, currentValue: number|string,
  incomingValue: number|string, unit: string }>,
  profileId: Id<"profiles">|null, bikeId: Id<"bikes">|null }`.
On conflicts the mutation performs **no writes**, including no bike creation.
Missing fields never receive made-up measurements. Derived values cannot replace measured ones.
Empty records + no bike is a no-op. Cancellation calls no mutation and clears bbf.handoff.

Rider fields use existing profile names; C's `ridingGoal` maps to `positionPriority` for riding goal.
Conflict field keys are the incoming C field names. `bikeCategory` maps to bikes.bikeType;
currentSaddleHeightMm/currentCrankLengthMm map to currentSetup without the current prefix.
New optional fields: ftpWatts (number), ftpMethod (string), ftpMeasuredAt (timestamp),
shoeSizeEu (number), cleatSystem (string). FTP method/date derive from its accepted record.
Existing body-measurement bounds are authoritative, not public calculator slider limits.

## Query / scores

`getHandoffContext({})` returns `{ profile: Doc<"profiles">|null,
  observations: Doc<"profileObservations">[] }` for this user only.
Observations returned are current rider observations (without bikeId); existing profile values
without observations retain A's legacy quality fallback. Use profile fields directly for
scoreRiderProfile; observations map by `field`, with kind/method/recordedAt.

Important schema discovery: current profiles require seven body/assessment fields.
Single-inseam handoff needs partial profiles, never fabricated defaults. B has asked the lead
to approve optional required fields with fit-readiness guards; endpoint/query shape stays as above.

C: please publish C-handoff-shape.md and align canonical field names/units with this contract.
A: publish score/ring import paths and props for the RP3 aside; B owns integration and page.
