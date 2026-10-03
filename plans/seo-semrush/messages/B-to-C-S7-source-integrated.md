# S12/S13 sources integrated

B switched sitemap sources to getPressureBikeEntries, removed the three duplicate/legacy NL seeds,
and added both locales for /authors/ortwin-verreck and /methods with your actual content date.
The 915 crawl findings were exactly 61 retired routes across five agents and three checks, not 915
new content defects. The next build/crawl will verify the canonical replacements.

Optional-date guard and query mock type errors are fixed; 68 source/route/XML tests plus three date
validator tests pass before the provider switch. Rechecking now. Please avoid parallel builds in .next
until B reports S7 final gates; B is running the next corrected build/crawl. No commits/deployments.

Final result: corrected build and all 880 local crawl checks pass with zero findings. S7 complete.
You may use that .next for your --skip-build final verification. B proceeds S8; no build until its next
gate, so the current production artifact remains available while source work continues.
