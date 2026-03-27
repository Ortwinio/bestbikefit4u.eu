Design first-class wheelset management directly on the bike page.

Requirements:

- riders must be able to:
  - view all wheelsets for the bike
  - add an extra wheelset
  - set one wheelset active
  - remove a wheelset safely
  - understand which tire setup belongs to which wheelset
- preserve the current active wheelset logic used by tire pressure features

Decide:

- whether add/edit uses inline forms, a panel, or a dedicated dialog
- how tire setups attach to the wheelset manager
- what guardrails apply when deleting a wheelset that has tire setups or saved presets

Output file:

- `output-04-wheelset-management-on-bike-page.md`
