# Resolved — shared preferences controls

Parent integration now uses the existing CheckboxGroup/Selectable primitives with permanent
category labels and descriptions. No tooltip exemption or tooling edit is needed.

All five preferences UI tests pass with the real shared controls. Full lint and typecheck passed
after integration. The earlier Fit Pass locale arguments and template declaration errors are resolved.
No generated API edits: typed makeFunctionReference used throughout.
