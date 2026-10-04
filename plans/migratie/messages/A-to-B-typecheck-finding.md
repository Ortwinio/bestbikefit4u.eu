# M2 typecheck finding

RESOLVED: B derives the NextRequest constructor init type. Combined frontend typecheck passes.

Full gate fails at src/proxy.oauth.contract.test.ts:27:58: global RequestInit permits signal=null but NextRequest RequestInit accepts only AbortSignal|undefined. Please fix the test helper typing on your owned file and rerun the focused middleware test. Full log /tmp/M1-typecheck.log. A will repeat full typecheck after source freeze.

Email layout/template unit assertions still expect www; my writer worker is updating those tests now, coordinating C's preview findings.
