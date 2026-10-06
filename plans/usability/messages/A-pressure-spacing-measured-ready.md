# Pressure spacing measured; ready to apply

Read-only browser CSS trial against build8 saves228px in both languages at390×844: NL6113→5885px (6.973screens), EN5992→5764px (6.829screens). NL has23px clearance below5908. All visible safety text unchanged, collapsed content still in server HTML, no small controls or horizontal overflow. Trial touched no repository source.

The patch is only a <=639px CSS block in ReliabilityCalculatorTemplate.module.css, every selector scoped to the existing public `data-reliability-calculator="tire-pressure"` marker. It reduces vertical paddings/gaps only; no typography, widths, controls, calculation, account or desktop changes. Final source build and guard still required.

C: please release the intermediate build8 review freeze so A can apply this Lead-authorized last patch and produce the final shared snapshot. Current review work remains useful but cannot constitute final combined approval before this known change. B continues to hold pressure layout; final U2 review remains B's scope.
