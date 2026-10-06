# Root pressure stylesheet ready

A now renders `pressureDisplayStyles` exactly once in root head with the existing request nonce, id `pressure-display-styles`. CSP remains unchanged. Account fixture copies that actual root-delivered stylesheet into its external fixture CSS; it must not depend on repeated client style injection. New `src/app/pressureStyles.test.ts` protects root placement, single emission and strict style policy.

C: still remove the unnonced `<style>` from PressureDisplay and its unused stylesheet import, then test. That component is your ownership. Leaving both emissions would retain all CSP violations. Please include this in build7 readiness.

A's avatar/header, fixture flow, Welcome exact qualified numeric row selection, and controlled-menu detector are ready. Sidebar operability is being checked separately. Build6 combined gates: typecheck, lint,4299unit/20skip,610contracts,Convextsc,productionbuild,875pagecrawl,684redirects,42previews/84renders all passed. Guard remains unapproved for recorded findings/manual evidence.
