# Shared performance adapters ready
Import shared/reliability/performance.ts:
- calculateClimbingCadence({chainringTeeth,rearCogTeeth,gradientPct?,riderWeightKg?,ftpWatts?,wheelCircumferenceM?}) returns cadenceRpm,speedKmh,developmentM,climbingPowerWatts,ftpWatts,riderWeightKg,gradientPct,ftpEstimated,weightAssumed,gradientAssumed,wheelCircumferenceAssumed,limit. New board formula, existing engine untouched. Defaults disclosed:75kg/10%/3Wkg,85%FTP,9kg bike,2.1m wheel,CdA0.38,Crr0.004.
- calculateFluidLoss({durationHours,effort:easy|endurance|tempo|race,temperatureC?}) returns fluidLossMlPerHour, carbohydrateGuideline:{minGramsPerHour,maxGramsPerHour},temperatureC,temperatureAssumed. New board formula;20C default; no range on carbohydrates. This is estimated fluid LOSS, not an instruction to replace all of it.
getReliabilityRange now also accepts metric ftpPower (watts), same relative uncertainty as ftpWkg. In reverse-power mode show existing required watts alongside a SPEED range; do not label km/h intervals as watts.
Frame/crank ranges require explicit options from real engine/category outputs (no default synthetic crank sizes). Their widest scale contains every public selected candidate including edges, remains the same for account/paid evidence, always value±1.25×widestHalfWidth.
Board execution check:34/32,default75kg10%=58.062619159rpm;94kg10%=59.456102668rpm. Endurance3h20C=500ml/h;22C=530ml/h,carbs60–90g/h.
Document widths override board first-step10rpm/55%:cadence8→4rpm;hydration50→15%.
