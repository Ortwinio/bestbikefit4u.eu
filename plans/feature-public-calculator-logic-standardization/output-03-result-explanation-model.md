# Result And Explanation Model

## Decision

Public calculators should move from isolated single-point answers toward a standardized result envelope built around:

- likely center
- safe range
- confidence
- visible drivers
- next adjustment guidance

## Standard Result Envelope

```ts
type PublicCalculatorResult<TValue> = {
  recommendedValue: TValue;
  recommendedRange?: {
    min: TValue;
    max: TValue;
  };
  confidence: "high" | "medium" | "lower";
  primaryDrivers: string[];
  secondaryModifiers: string[];
  explanationDrivers: string[];
  firstAdjustment: string;
  nextRideValidation: string[];
  notCovered: string[];
};
```

## Calculator-Specific Output Pattern

### Bike fit

- recommended center:
  - saddle height
  - reach
  - drop
- safe ranges:
  - reach range
  - drop range
- explanation:
  - why the result shifted
  - what to test first

### Saddle height

- recommended start:
  - e.g. `745 mm`
- safe band:
  - e.g. `742–748 mm`
- explanation:
  - category, goal, flexibility, core impact
- next validation:
  - short rides, comfort check, knee extension check

### Frame size

- recommended shortlist:
  - e.g. `56 first, 54 second`
- safe range:
  - e.g. `usually 54–56`
- explanation:
  - what made the shortlist trend larger or smaller
- next validation:
  - compare stack/reach, cockpit constraints

### Crank length

- recommended center:
  - e.g. `170 mm`
- if range is meaningful:
  - e.g. `170–172.5 mm`
- explanation:
  - inseam and category impact
- next validation:
  - confirm saddle-height recheck if crank length changes materially

### Tire pressure

- recommended front/rear starting pressures
- optional range if enough model confidence exists
- explanation:
  - weight, width, surface, setup
- next validation:
  - grip, comfort, casing support, rim protection

## Why Your Result Changed

Each calculator should show a short explanation block:

- “Your result is more conservative because…”
- “Your result trends more aggressive because…”
- “Your range narrowed because confidence is higher…”

### Rules

- Use no more than 3 top drivers in the visible explanation.
- Use plain language, not internal-engine terms.
- Prioritize differences the rider directly selected.

## Not Covered Here

Every calculator should expose a standard “not covered here” block.

### Example: saddle height

- cleat stack
- saddle shape
- crank length changes
- asymmetry

### Example: frame size

- cockpit setup
- stack/reach tradeoffs at full detail
- mobility limitations beyond baseline refinements

## Engineering Implications

- Calculators should return a structured explanation payload, not just raw numbers.
- Result cards should consume one shared result shape even when the visual layout differs.
- “Why this changed” should be generated from standardized driver tags rather than bespoke copy in each page.

## Success Criteria

- Range + center is the default public result pattern where it is more honest than a single number.
- Every calculator explains the top factors that changed the result.
- Every calculator tells the rider what the tool does not cover.
- Result modules are consistent enough that users can predict where to find confidence, drivers, and next-step guidance.

## User Acceptance Tests

1. A rider changes goal from `balanced` to `comfort` on saddle height.
   Expected: the recommended start or range becomes more conservative and the explanation explicitly says why.
2. A rider changes flexibility from `4` to `2` on bike fit.
   Expected: the result explanation highlights flexibility as a result driver.
3. A rider receives a frame-size recommendation.
   Expected: the result is presented as shortlist/range language rather than false precision.
4. A rider receives a crank-length result.
   Expected: the tool also tells them whether saddle height should be rechecked afterward.
