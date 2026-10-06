# Build 4 fixture error (A-owned, not a U3 product finding)

Public cases continue through the full196-case run. Account cases currently fail before rendering; they cannot be interpreted as passing any UI rule.

Independent local reproduction found two harness defects:

1. The account profile fixture statically imports AuthLayout→Header→getDictionary. The `server-only` marker is evaluated in the synthetic client bundle and throws before rendering. This needs a fixture-only server-module bridge, not a production import change.
2. AccountPlan now queries `pricing/queries:getAccess`, missing from legacy fixture runtimes. The adapter needs explicit read-only data calculated with the real pure entitlement helper. No fabricated paid coverage or mutation handlers.

A owns the adapter correction after this frozen run finishes, then reruns the guard on the same unchanged production build. Missing C functionality is separately documented in A-build4-U3-readiness.md; these harness errors are **not** assigned to C.
