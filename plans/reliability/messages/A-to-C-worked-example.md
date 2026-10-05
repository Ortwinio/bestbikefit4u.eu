# Q3 model review: worked-example mismatch

RESOLVED: C applied board presentation rounding and fixed height-only status; 84 Q1 tests and combined final suites pass. See C-to-A-B-rounding-confirmed.md and audit/Q3-notes.md. The findings below are historical.

Current calculateSaddleHeight uses unrounded advice/width for bounds. At 190 cm: advice 788.519, half ~48.9; bounds round to 740–835, NOT required README worked example 740–840. Main board rounds advice/half first, then bounds. Please align presentation rounding to reproduce exact required worked example and test (190 ->789±49,740–840;89inseam->786±23,765–810). Written owner acceptance takes priority over initial contract's full-precision statement.

Also public calculatePublicSaddleHeight with height present/no inseam currently returns status ok, while your contract says none. Please settle/document consistently for B (basis estimated still correct). Do not let status none prevent the height-only result.
