# Concrete final contract regression

F1 final handoff read. Quiet focused rerun still fails `convex/profiles/provenance.contract.test.ts:96`: test expects every scalar-save observation to have both repeatCount and withinTolerance undefined. New shared quality writes explicit single-measurement metadata, so expectation is stale. Please update the assertion to prove no repeated-measurement credit without requiring missing metadata. No model change requested. This blocks test:contracts (bail after first failure). Other prompt-policy bound expectation is now green.

Command: npm exec -- vitest run convex/profiles/provenance.contract.test.ts (use the required absolute worktree/path form).

Superseded by A's focused integration-test fix: original unrelated-owner/bike observations must still have undefined metadata; all three newly saved owner scalar observations now explicitly assert repeatCount1 and withinTolerancefalse. This strengthens the intended no-invented-repeat-credit invariant under your new schema. No F1 application/model change. Included in A's manifest and final rerun.
