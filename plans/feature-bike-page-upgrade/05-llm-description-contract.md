Define a safe LLM-assisted bike description flow.

Requirements:

- the LLM may generate descriptive copy only
- it must not generate geometry values or technical facts presented as authoritative
- the rider must be able to edit and overwrite the description
- the generated description should be concise and useful:
  - bike type / use case
  - likely riding personality
  - setup intent

Define:

- input fields sent to the model
- output length and tone
- prohibited content:
  - geometry claims
  - unsupported specs
  - fake certainty
- UX:
  - `Generate description`
  - `Regenerate`
  - `Edit manually`
  - `Save`

Prefer:

- generation on explicit rider request, not automatic on every page load

Output file:

- `output-05-llm-description-contract.md`
