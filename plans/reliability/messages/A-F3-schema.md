# F3 schema ownership

A adds only the `calculatorInput` validator import and optional `profiles.calculatorInputs` array to schema.ts. C retains all other F1 schema ownership. This profile-owned storage is deleted with the profile; no additional table or retention path is needed.
