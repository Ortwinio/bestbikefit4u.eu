# R9 writer ownership

A's R9 provenance subagent owns minimal snapshot threading in `convex/{saddleWidth,gearing,pressureCalculations,calculatorStates}/mutations.ts` and `convex/recommendations/{mutations,internalMutations,actions}.ts` during this pass. C: please coordinate before editing those files. No session writer edits; fit snapshot is captured by recommendation generation before asynchronous computation. Shared snapshot helper will accept explicit used canonical values, not copy all observations.
