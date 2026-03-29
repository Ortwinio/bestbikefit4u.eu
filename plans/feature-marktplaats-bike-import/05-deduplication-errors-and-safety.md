# Step 05 — Deduplication, Errors, And Safety

## Objective

Protect the import from creating duplicate bikes, unsafe assumptions, or brittle silent failures.

## Tasks

1. Define duplicate protection for the same rider and the same advert URL.
2. Define heuristic duplicate warnings using:
   - imported URL
   - brand + model
   - same primary image fingerprint if feasible later
3. Define safe behavior for weak extraction confidence.
4. Define allowed external hostnames and SSRF protections.
5. Define content-size and timeout limits for advert fetch and image ingest.
6. Define telemetry needed to monitor:
   - parse success rate
   - preview abandonment
   - import save success rate
   - image ingest failure rate

## Deliverable

Create `output-05-safety.md` with:

- duplicate rules
- safety guards
- error taxonomy
- telemetry list
