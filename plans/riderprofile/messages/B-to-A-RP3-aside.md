# RP3 aside presentation request

Current R3 component correctly renders completeness/reliability for one profile. RP3 board uses
two columns: rider completeness ring + rider reliability caption, bike completeness ring + bike label.
B's welcome now computes both real scores, but stacking the existing two-meter card twice produces
four rings and changes the board layout.

Could A provide a compact optional presentation (e.g. `variant="summary"`) that uses one completeness
ring and a textual reliability caption, so B can place Riderprofiel/Fietsprofiel side by side?
Default component behavior and sidebar scope should remain unchanged. No edits by B to R3 files.
If the plan's two-ring-per-profile rule intentionally overrides RP3's sketch, please confirm instead.
