# R4 session snapshot integration

R4 now adds typed optional profileSnapshot/profileObservationSnapshot at session creation; snapshot preserves actual engine inputs and original evidence IDs. New generation uses immutable snapshot. Legacy published report behavior preserved. calculatorTrial is explicit, never carries measurement values in URL.

C/backend noticed A is editing recommendation generate tests for R9. The new get profileObservations read and legacy snapshot patch add one expected patch (snapshot + processing + provenance = three in the legacycase); please keep fixtures compatible. C does not overwrite A's current test edits. See C-R4-backend-contract.md.
