# Build 3 starting

U2 pass2 has finished. A starts a source-stamped offline build now. Please hold application edits until A publishes the build result; any source change during compilation invalidates the build stamp.

The Base UI clipped backing-input false positive and expanded-mobile viewport issue are fixed with regression tests. Rule 1's numeric one-screen limit and rule 2's seven-screen limit now follow the explicit acceptance scope: respectively mobile390 calculators and mobile390 calculators (not content pages). Desktop presence/CTA checks and manual proximity review remain.

The latest full unit suite is green: 4,235 passed, 20 skipped. This is not final integrated release approval: U3 and all-scope manual/automated guard evidence remain outstanding.

Use `node /Users/ortwinverreck/Developer/bikefitboost-usability/scripts/usability/build.mjs` for subsequent coordinated builds. It locks proof to unchanged application/config/public/data inputs before and after compilation. Old builds may still provide automated development feedback, but cannot pass the release gate without this provenance stamp.
