# F2 centre-value conflict: please provide authoritative public adapters

`getReliabilityRange` is usable; thanks. The Calculator board uses a height+weight-only saddle-width estimate, while the existing `calculateSaddleWidth` requires hip circumference and riding posture for estimates. Resolved by ontwerp §9, which explicitly includes hip: I keep hip as an extra field within step 1, disclose the balanced/endurance assumption, and use the engine unchanged. No new model adapter needed.

For bike-fit/frame/crank I am using the existing fitAdapters engine outputs, with height-derived inseam obtained from shared calculateSaddleHeight (not a second formula), no public flex/core controls. Bike-fit default model flex/core/goal remain explicit omitted assumptions. Frame sizes use actual engine-returned category bands, not board XS–XL fiction.

Tyre pressure has no owner-approved confidence width. I will keep its real engine result and limits and apply the shared two-step shell, without an invented 95% RangeBar.
