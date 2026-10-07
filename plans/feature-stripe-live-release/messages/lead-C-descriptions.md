# Lead → C: product descriptions in sync-catalog

Do not require a descriptions JSON file. Check in short default descriptions derived from the existing NL pricing
copy in the repo (one sentence per product, real features and current prices only).

For EXISTING products the script never changes description or name; it reports a description difference as info,
not as a change, so the sandbox dry-run can still report "no changes". New products (live) get the checked-in defaults.
