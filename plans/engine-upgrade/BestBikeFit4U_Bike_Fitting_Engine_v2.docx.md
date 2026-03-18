# **BestBikeFit4U**

# **Bike Fitting Engine v2**

## *Multi-bike, multi-profile, dynamically validated and feedback-learning architecture*

## *Document purpose: define the next-generation calculation engine, product UX and migration path from the existing formula-driven fit engine.*

## *Prepared for product, design and engineering teams*

## *18 March 2026*

| North star One rider can own multiple bikes, each bike can have multiple riding profiles, each profile can be validated dynamically and improved iteratively from real-world feedback. The system should help riders find the best setup for every bike and every circumstance, with clear millimeter-level outputs and safe adjustment guidance. |
| :---- |

## **At a glance**

| 1\. Rider baseline | 2\. Capacity & symptoms | 3\. Bike translation | 4\. Dynamic validation | 5\. Profile overlays | 6\. Learning & confidence |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Anthropometry and body proportions | Mobility, core, asymmetry and pain | Geometry, contact points and component constraints | Video, angles, cadence, power and contact quality | Mountain, endurance, performance, aero, indoor, technical | Ranges, confidence, feedback loops and recommendation updates |

# **1\. Executive summary**

The existing BestBikeFit4U engine is a strong v1 foundation because it already produces deterministic outputs for saddle height, saddle setback, bar drop, saddle-to-bar reach, saddle tilt, cleat fore-aft, handlebar width and a stack/reach stem-spacer solution. However, it is still centered on a one-pass calculation and does not fully model the reality that one rider can own several bikes, each bike can require multiple setups, and the best fit evolves after real rides and dynamic validation.

Bike Fitting Engine v2 keeps the useful seed logic from v1, but wraps it in a six-layer architecture. The result is a rider-centric system that can calculate a validated base fit, translate it to any number of bikes, generate multiple profiles per bike and improve recommendations over time from actual rider outcomes.

| What changes in practice V1 asks: 'What is the right position for this fit input set?' V2 asks: 'What is the best validated setup for this rider, on this bike, in this riding context, with this history and this feedback?' |
| :---- |

### **Expected outcomes of the new model**

| Outcome | Why it matters |
| ----- | ----- |
| Higher first-fit accuracy | Better seeds, better guardrails and bike-specific translation reduce avoidable setup errors. |
| More useful for real riders | A rider can keep separate setups for road, gravel, MTB, city, TT or travel bikes without losing continuity. |
| Profile-driven value | The same bike can support base, mountain, endurance, performance, aero or indoor profiles. |
| Safer adjustments | Dynamic validation, risk rules and smaller guided step sizes reduce trial-and-error changes. |
| Compounding improvement | Post-ride feedback lets the engine learn which deltas work best for this rider and for similar riders. |
| Commercial upside | The platform becomes subscription-worthy because it is no longer a one-off calculator but a persistent fit system. |

# **2\. Benefits of the six-layer bike fitting engine**

The six-layer model improves both accuracy and product scalability because each layer solves a different class of problem. Instead of forcing one formula set to do everything, the engine separates body proportions, physical capacity, bike translation, dynamic motion, riding context and learning.

### **Benefits by engine**

| Engine | Primary job | Direct rider benefit | Business / platform benefit |
| ----- | ----- | ----- | ----- |
| 1\. Anthropometry & morphology | Create the first fit seed from body dimensions. | More sensible first estimate for frame size, saddle position and cockpit length. | Lower onboarding friction and fewer absurd starting outputs. |
| 2\. Mobility, stability & symptoms | Cap aggressiveness according to what the rider can actually support. | Less neck, back, hand and knee overload; safer first recommendations. | Fewer support requests and a more trustworthy product. |
| 3\. Bike geometry & hardware constraints | Translate the rider model to each real bike and component set. | Advice becomes implementable on the actual bike rather than theoretical. | Unlocks multi-bike subscriptions and component recommendations. |
| 4\. Dynamic validation | Validate and correct the fit from real pedaling mechanics. | Higher precision, especially for saddle height, cockpit and control. | Premium feature with clear perceived value. |
| 5\. Context & profile overlays | Adapt the fit to terrain, event type and intended use. | One bike can have several relevant positions without confusion. | Differentiating feature; strong retention and upgrade path. |
| 6\. Confidence, feedback & learning | Rank confidence, log results and improve the setup over time. | The fit gets better after real rides instead of freezing on day one. | Creates proprietary fit intelligence and long-term defensibility. |

## **Key strategic advantage**

• The rider account becomes the long-lived asset; bikes, profiles, validations and feedback become layers around it.

• The engine becomes adaptive rather than static: each new fit session refines confidence, not just numbers.

• The product can grow into route-aware and wearable-assisted recommendations without rewriting the core architecture.

# **3\. Core design principles for Engine v2**

1\. One rider, many bikes. Every bike stores its own geometry, hardware and current setup.

2\. One bike, many profiles. Base, mountain, endurance, performance, aero, indoor or technical profiles are separate recommendation objects.

3\. Validation before confidence. A number without validation should be treated as a starting range, not as an absolute truth.

4\. Small safe steps. High-sensitivity variables should move in small increments and in a clear adjustment order.

5\. Feedback compounds value. The system should learn from rider outcomes while staying inside safe guardrails.

6\. Explainability is mandatory. Every output should include why it was chosen, how to measure it and what risk or trade-off it affects.

# **4\. Target object model and data architecture**

The new engine needs persistent entities rather than a single transient input payload. The data model below is designed to work well with a Convex/Next.js stack, but it is generic enough for any document or API layer.

### **Core entities**

| Entity | Purpose | Key fields |
| :---: | ----- | ----- |
| Rider | Permanent identity and rider-level defaults. | riderId, name, experience, comfort-performance bias, units, consent flags |
| RiderAssessment | Body, mobility, symptom and asymmetry measurements. | height, inseam, torso, arm, femur, shoulder width, foot size, flexibility, core, pain map |
| Bike | Actual owned bike and hardware configuration. | bikeId, category, brand, model, frame size, stack, reach, current stem, spacer stack, crank, handlebar, saddle |
| BikeProfile | Use-case specific setup within a bike. | profileId, bikeId, type, terrain, goal, isDefault, current status |
| FitSession | A versioned calculation run. | sessionId, riderId, bikeId, profileId, engineVersion, sourceQuality, output JSON |
| ValidationCapture | Dynamic validation inputs from video or sensors. | angles, cadence, power, hand position, pelvic rock, quality score |
| RideContext | Ride or route characteristics attached to a profile or a session. | terrain, duration, gradient, technicality, event type, indoor ratio |
| FeedbackEntry | Structured post-ride feedback. | comfort, pain map, numbness, handling, climbing confidence, descending confidence, notes |
| Recommendation | A single parameter recommendation with rationale and range. | parameter, target, low, high, confidence, method, implementation note, risk flags |
| ChangeLog | Tracks accepted changes and outcomes over time. | what changed, previous value, new value, acceptedByUser, date, effect scores |

| Relationship model One rider \-\> many bikes. One bike \-\> many profiles. One profile \-\> many fit sessions. One fit session \-\> zero or many validation captures and zero or many feedback entries. Recommendations are versioned so the product can always explain which engine version produced which output. |
| :---- |

# **5\. The bike fitting algorithm**

Engine v2 still uses familiar fit methods as its computational base. LeMond-style saddle height, Holmes-style dynamic knee-angle validation, KOPS as a field sanity check and stack/reach translation remain valid ingredients. The difference is that these methods now sit inside a layered calculation flow rather than acting as the whole system.

| For every output parameter P: P\_final \= clamp(guardrails,                 P\_seed               \+ Δcapacity               \+ Δbike               \+ Δvalidation               \+ Δprofile               \+ Δfeedback) Where: P\_seed       \= anthropometry-based starting point Δcapacity    \= mobility, stability, symptom and asymmetry correction Δbike        \= translation to this frame, cockpit and component set Δvalidation  \= dynamic video/sensor correction Δprofile     \= terrain / goal / use-case overlay Δfeedback    \= small confidence-weighted adaptation from real rides |
| :---- |

The system should store both the target and the confidence envelope. In practice, this means that every key recommendation becomes a range, not just a point estimate.

### **Recommendation object pattern**

| Field | Meaning |
| ----- | ----- |
| target | Preferred value in mm or degrees. |
| rangeLow / rangeHigh | Acceptable working range for self-adjustment. |
| confidence | 0.0–1.0 confidence score based on measurement quality, evidence strength and validation. |
| method | Short explanation of what generated the number. |
| why | Biomechanical or practical reason. |
| feasibility | Whether the value is achievable on the current bike without changing parts. |
| riskFlags | Potential overloads or implementation cautions. |
| changeOrder | Adjustment priority relative to other parameters. |

## **5.1 Engine 1 — Anthropometry and morphology**

Create the first rider-level fit seed from body dimensions.

| Variable | How to measure | Why it matters |
| :---: | ----- | ----- |
| height\_mm | Barefoot against wall; book on head; 3 repeats. | Frame range seed, fallback cockpit sizing. |
| inseam\_mm | Cycling inseam with firm book pressure into the crotch. | Primary saddle-height seed and lower-body proportion anchor. |
| torso\_mm | Sternal notch to top edge of inseam book while seated upright. | Cockpit length and stack/reach balance. |
| arm\_mm | Shoulder joint center to wrist crease. | Refines saddle-to-bar reach. |
| femur\_mm | Outer hip prominence to knee center at about 90° knee bend. | Refines saddle setback and crank choice. |
| shoulder\_width\_mm | Acromion to acromion. | Handlebar width seed. |
| foot\_length\_mm | Heel to longest toe on paper or against a ruler. | Shoe and cleat fore-aft logic. |
| sitbone\_width\_mm | Best measured with pressure tool; otherwise low-confidence proxy. | Saddle family selection and pressure management. |

### **Primary seed logic**

• Saddle height seed: inseam × category multiplier, then mild ambition and morphology adjustments.

• Setback seed: inseam baseline plus femur ratio and category profile.

• Reach seed: torso and arm model, with height fallback if needed.

• Handlebar width seed: shoulder-width led by bike category.

### **Benefit of good measurement**

Better first-hit accuracy. Good anthropometry reduces the number of compensations needed later in the process.

### **Attention points**

Use millimeters, ask for three attempts and store the median. If only height and inseam are available, widen the output ranges and lower confidence.

## **5.2 Engine 2 — Mobility, stability, symptoms and asymmetry**

Adjust the rider seed according to what the body can tolerate, support and recover from.

| Variable | How to measure | Why it matters |
| ----- | ----- | ----- |
| hamstring\_mobility\_score | Guided sit-and-reach or straight-leg raise self-test. | Limits aggressive saddle height and bar drop. |
| hip\_flexion\_tolerance | Seated hip-hinge or deep-flexion self-check. | Affects drop, crank length and setback tolerance. |
| ankle\_dorsiflexion\_cm | Knee-to-wall test per side. | Influences cleat position and ankle pattern under load. |
| thoracic\_extension\_score | Wall-slide or thoracic extension self-test. | Important for sustainable trunk angle. |
| core\_stability\_score | Plank-based score plus optional side plank asymmetry. | Caps reach and drop aggressiveness. |
| pain\_map\_current | Guided body map with severity scale. | Activates protective rules for knees, back, hands and perineum. |
| leg\_length\_asymmetry\_flag | Optional self-report or fitter measurement. | Triggers asymmetry review and confidence reduction. |
| numbness\_flags | Hands, feet, perineal pressure yes/no plus severity. | Prioritizes stack, reach, cleat and saddle review. |

### **Adjustment logic**

• Low flexibility and low core stability reduce bar drop, shorten reach and can slightly reduce saddle-height aggression.

• Pain-location rules override purely performance-driven decisions.

• Asymmetry widens ranges and raises the need for validation instead of forcing exact numbers.

### **Benefit of good measurement**

This engine prevents the classic error of recommending a strong race position to a rider who cannot support it for more than a few minutes.

### **Attention points**

Tests must stay simple, safe and repeatable. When in doubt, prefer broader ranges over false precision.

## **5.3 Engine 3 — Bike geometry, contact points and hardware constraints**

Translate the rider model to the real bicycle and determine what is achievable with the current parts.

| Variable | How to measure | Why it matters |
| ----- | ----- | ----- |
| bike\_type | Road, gravel, MTB, city, TT or other controlled value. | Activates category logic and profile options. |
| frame\_stack\_mm / frame\_reach\_mm | Manufacturer geometry database or manual entry. | Base coordinate system for cockpit solving. |
| stem\_length\_mm / stem\_angle\_deg | Current hardware entry. | Primary reach and stack lever. |
| spacer\_stack\_mm | Measure total spacer height below stem. | Practical bar-height adjustment range. |
| bar\_width\_mm / bar\_reach\_mm | Component spec or guided measurement. | Control and cockpit shape. |
| saddle\_model / seatpost\_offset\_mm | Current bike hardware. | Feasibility of setback and saddle-pressure logic. |
| crank\_length\_mm | Read from crank arm. | Influences knee/hip closure and cadence comfort. |
| current contact points | Current saddle height, setback, bar drop and reach. | Lets the app compare current vs recommended and propose deltas. |

### **Translation logic**

• Convert the rider seed into target saddle and bar coordinates relative to the bottom bracket.

• Solve current bike feasibility using frame stack/reach, stem, spacer, seatpost and handlebar geometry.

• Return both the ideal value and the best achievable value on the current hardware.

### **Benefit of good measurement**

Advice becomes implementable. The rider sees exactly whether the result is achievable with current parts or needs a stem, spacer, handlebar, seatpost or frame change.

### **Attention points**

Frame stack/reach is not the same as contact-point stack/reach. The system must also know the current contact points and component dimensions.

## **5.4 Engine 4 — Dynamic validation and contact-quality engine**

Validate and refine the fit from real pedaling mechanics instead of static assumptions only.

| Variable | How to measure | Why it matters |
| ----- | ----- | ----- |
| knee\_angle\_bdc\_deg | Side video on trainer at representative cadence and load. | Highest-value validator for saddle-height refinement. |
| hip\_angle\_tdc\_deg | Side video. | Important for crank length, setback and drop. |
| trunk\_angle\_deg | Side video, hands in the intended position. | Validates cockpit aggressiveness. |
| pelvic\_rock\_score | Side video; AI or fitter review. | Flags excessive saddle height or poor support. |
| elbow\_angle\_deg | Side video. | Useful for cockpit reach and control. |
| front\_knee\_tracking\_score | Front video. | Supports cleat stance and rotation review. |
| cadence\_rpm / power\_w | Trainer or sensors. | Ensures validation happens under representative load. |
| hand\_position\_mode | Tops, hoods, drops, flat-bar grips or aero pads. | Prevents validating the wrong position. |

### **Validation rules**

• If the knee angle is outside the target band, adjust saddle height in small steps.

• If pelvic rock is visible, reduce saddle-height aggression before chasing more reach or drop.

• If trunk angle is too aggressive for the intended profile, reduce drop or reach before blaming flexibility alone.

• If front-view tracking is unstable, review cleat position and stance before large saddle changes.

### **Benefit of good measurement**

This engine upgrades a 'good estimate' into a fit that reflects how the rider actually pedals.

### **Attention points**

Video quality matters. Use a guided capture flow with camera placement, marker guidance, cadence targets and retake prompts.

## **5.5 Engine 5 — Context, terrain and use-case profile overlays**

Create multiple relevant setups for the same bike by overlaying terrain, goal and ride-intent deltas on a validated base position.

| Variable | How to measure | Why it matters |
| ----- | ----- | ----- |
| profile\_type | Base, mountain, endurance, performance, aero, indoor, technical. | Defines which overlay library applies. |
| riding\_goal | Comfort, balanced, race, granfondo, TT, adventure or commute. | Optimization bias for the recommendation. |
| terrain\_profile | Flat, rolling, mountain, technical or indoor. | Controls stack, reach, setback and stability changes. |
| mountain\_frequency | Never / sometimes / often. | Decides whether mountain profile should be auto-created. |
| climb\_severity\_score | Self-report or route data. | Scales climbing overlay strength. |
| descent\_technicality\_score | Self-report or route data. | Affects control-oriented cockpit changes. |
| ride\_duration\_min | Typical long-ride duration. | Endurance comfort bias. |
| comfort\_performance\_bias | 0–100 user slider. | Tie-breaker when several positions are possible. |

### **Profile overlay logic**

• Base profile \= rider's validated all-round setup.

• Mountain profile \= usually slightly lower saddle aggression, more setback, less drop, slightly shorter reach and more control.

• Endurance profile \= reduced lumbar and hand load, moderate front-end lift and stable cockpit.

• Performance or aero profile \= more drop and more reach only if capacity and validation support it.

• Indoor profile \= often slightly less aggressive because the bike is more static and cooling is worse.

### **Benefit of good measurement**

A rider does not need to destroy one good setup to create another. Profiles preserve context.

### **Attention points**

Profiles must be bike-specific, not only rider-specific. A mountain profile for an endurance road bike is not identical to one for a gravel bike or an XC MTB.

## **5.6 Engine 6 — Confidence, feedback and learning**

Convert sessions into compounding fit quality by recording outcomes and using small safe updates over time.

| Variable | How to measure | Why it matters |
| ----- | ----- | ----- |
| measurement\_quality\_score | Auto-calculated from repeatability and source type. | Controls confidence in outputs. |
| source\_type | Manual, database, photo, video, wearable or fitter-entered. | Affects trust weighting. |
| implementation\_status | Did the rider actually make the change? | Prevents learning from unimplemented advice. |
| post\_ride\_comfort\_score | Simple 1–10 check-in after a ride. | High-level success signal. |
| post\_ride\_pain\_map | Same body map as intake, after the ride. | Critical directional signal for future adjustments. |
| handling\_score | Climbing, descending and low-speed control self-ratings. | Useful for mountain and technical profiles. |
| performance\_feel\_score | Power transfer, cadence freedom and fatigue rating. | Separates comfort-only gains from all-round gains. |
| note\_tags | Free text plus structured tags such as knee, back, hands, numbness, saddle pressure. | Adds explainable adaptation cues. |

### **Learning logic**

• Only learn from rides where the app knows which setup was actually ridden.

• Use confidence-weighted micro-adjustments rather than large automatic jumps.

• High-sensitivity variables move in smaller steps than low-sensitivity variables.

• The model should learn both rider-specific preferences and cross-rider patterns, but only inside explicit guardrails.

### **Benefit of good measurement**

The fit improves with use. The system stops acting like a static calculator and starts acting like a coaching product.

### **Attention points**

No silent auto-change should go live without user acceptance. The app can suggest a refinement, but the rider remains in control.

## **5.7 How key outputs are produced**

### **Parameter generation logic**

| Output | Seed source | Validation / feedback logic |
| ----- | ----- | ----- |
| Saddle height | Inseam, category multiplier, ambition, morphology. | Validate primarily with dynamic knee angle and pelvic stability; feedback step size ±2 mm. |
| Saddle setback | Inseam baseline plus femur ratio, bike type and profile intent. | Validate with hip comfort, pedaling feel and field KOPS sanity check; feedback step size ±3 mm. |
| Saddle tilt | Base by category and pressure history. | Refine from perineal pressure, hand pressure and pelvic stability; feedback step size ±0.5°. |
| Bar drop / front-end height | Seed from category and capacity limits. | Validate with trunk angle, hand pressure, neck load and ride duration; feedback step size ±5 mm. |
| Saddle-to-bar reach | Torso \+ arm seed, bike type, current geometry. | Validate with elbow angle, control and fatigue; feedback step size ±5 mm. |
| Stem / spacer recommendation | Translation of bar target to actual hardware options. | Update only if fit target cannot be reached with existing configuration. |
| Crank length | Inseam band plus hip closure and bike type. | Mostly a slower-changing recommendation, not a frequent adaptive parameter. |
| Cleat fore-aft and rotation | Foot dimensions, symptoms and bike type. | Validate with foot numbness, calf/Achilles load and front-view tracking. |

| Pseudo-flow for a single bike profile 1\. Load rider assessment and bike data 2\. Compute rider seed outputs 3\. Apply capacity and symptom corrections 4\. Translate outputs to bike coordinates and hardware feasibility 5\. Apply selected profile overlay (base, mountain, endurance, etc.) 6\. If dynamic validation exists, correct the outputs and update ranges 7\. Publish recommendations with target, range, confidence and implementation steps 8\. After the ride, collect feedback and generate a small next-step suggestion |
| :---- |

## **5.8 Multi-bike and multi-profile model**

The rider record is global, but recommendations must be bike-specific and profile-specific. This distinction is the heart of Engine v2.

### **How the engine should think**

| Object | Examples | Why it matters |
| :---: | ----- | ----- |
| Rider | Same rider account across all setups. | Keeps one body model, one symptom history and one learning history. |
| Bike | Aeroad, Endurace, Gravel bike, XC MTB, City bike. | Each bike has different geometry, hardware and feasible contact points. |
| Profile | Base, mountain, endurance, performance, aero, indoor. | Each profile changes optimization goals without overwriting the base setup. |
| Session | January fit, video re-check, pre-holiday mountain tune-up. | Versioning allows transparent improvement over time. |

| Example One rider can own a race bike, a gravel bike and an MTB. The race bike can hold Base, Mountain and Performance profiles. The gravel bike can hold Base, Endurance and Technical profiles. The MTB can hold Base and Technical Mountain profiles. Every profile keeps its own targets, confidence and change history. |
| :---- |

## **5.9 Dynamic validation and feedback learning loop**

The improvement mechanism should be simple enough to control and strong enough to learn. The safest approach is a guided recommendation loop rather than a hidden auto-optimization loop.

### **Suggested feedback schema after a ride**

| Question | Scale / format | Used for |
| ----- | ----- | ----- |
| Overall comfort | 1–10 | Global success score and confidence trend. |
| Knee discomfort | None / front / back / medial / lateral \+ severity | Saddle-height and setback refinement. |
| Lower-back discomfort | 1–10 | Drop and reach refinement. |
| Hand numbness or pressure | 1–10 | Stack, reach, hood angle and pressure triage. |
| Saddle pressure / numbness | 1–10 | Tilt, saddle family and setback review. |
| Climbing confidence | 1–10 | Mountain overlay refinement. |
| Descending control | 1–10 | Control-oriented cockpit tuning. |
| Power transfer / pedaling freedom | 1–10 | Performance bias and crank / cockpit review. |
| Free note \+ tags | Text \+ structured tags | Explainable model refinement and support view. |

### **Safe default adaptation rules**

| Signal | Suggested next step | Max step per cycle |
| ----- | ----- | ----- |
| Posterior knee discomfort and open knee angle | Lower saddle height slightly. | 2 mm |
| Anterior knee discomfort and closed knee angle | Raise saddle height slightly or increase setback if appropriate. | 2 mm or 3 mm setback |
| Hand pressure / neck strain | Reduce drop first, then shorten reach if needed. | 5 mm |
| Perineal pressure | Review saddle tilt and setback before large height changes. | 0.5° or 3 mm |
| Poor climbing traction or seated climbing feel | Increase setback slightly and reduce front-end aggression if profile is mountain focused. | 3 mm setback / 5 mm drop |
| Poor technical control | Shorten reach or raise stack slightly in the relevant profile. | 5 mm |
| No complaints and better feel | Increase confidence and keep the current recommendation stable. | 0 mm |

# **6\. UX for BestBikeFit4U**

The UX should make a complex engine feel simple, progressive and trustworthy. The interface must support both quick-start users and precision-focused users without turning the app into a technical maze.

## **6.1 UX principles**

1\. Progressive precision: start with the minimum inputs and unlock more accuracy through optional steps.

2\. Bike-first organization: riders should see their bikes and profiles immediately after onboarding, not just one anonymous fit result.

3\. Measure where it matters: ask for advanced measurements only when they materially improve the recommendation.

4\. Always compare current vs recommended: riders need clear deltas and change order, not isolated targets.

5\. Show confidence visually: high-confidence values can feel more prescriptive; low-confidence values should look like working ranges.

6\. Close the loop: every ridden profile should invite a short, structured post-ride check-in.

## **6.2 Proposed product flow**

### **Core screens and interactions**

| Screen | Primary job | Must-have UX elements |
| ----- | ----- | ----- |
| Welcome / onboarding | Capture the rider goal and preferred path. | Quick Fit vs Guided Fit choice; promise of multi-bike, multi-profile setup. |
| Rider baseline | Collect required measurements and experience. | One measurement per screen, micro-illustration, retake button, unrealistic-input warnings. |
| Mobility & symptoms | Collect capacity constraints and current issues. | Short tests, sliders, left/right toggles, 'skip for now' option. |
| Bike library | Add and manage all owned bikes. | Bike cards, brand/model/size autofill, geometry lookup, 'import current setup' CTA. |
| Bike setup capture | Measure the current bike accurately. | Guided measurement overlays and clear reference points. |
| Profile manager | Create Base, Mountain, Endurance, Performance, Indoor or custom profiles. | Profile chips, compare profiles, duplicate profile action. |
| Validation capture | Record side/front pedaling videos. | Camera placement overlay, cadence target, quality check, retake prompt. |
| Results | Present target outputs and change order. | Current vs target deltas, confidence badge, implementation notes, risk alerts. |
| Ride feedback | Capture outcomes after a ride. | Fast 30-second check-in, pain map, comfort, control and performance sliders. |
| History & learning | Show how the fit improved over time. | Version history, accepted changes, feedback trend, confidence trend. |

## **6.3 Bike and profile organization**

The home screen should not show only one generic fit. It should show rider context at the top, then bike cards underneath, each with profile chips.

### **Recommended bike card content**

| Element | Reason |
| ----- | ----- |
| Bike name \+ type | Helps riders identify the right bike immediately. |
| Current status | Shows whether the current setup matches a validated profile. |
| Profile chips | Base, Mountain, Endurance, Performance, Indoor and any custom profile. |
| Confidence summary | Quickly shows which profile is most mature and which still needs validation. |
| Next action | Example: Add current bike measurements, record validation video or review feedback suggestion. |

## **6.4 Result screen design**

### **Result screen sections**

| Section | What it should show |
| ----- | ----- |
| Summary card | Profile name, target use case, overall confidence, top three changes. |
| Detailed geometry table | Saddle height, setback, tilt, drop, reach, crank, cleat and handlebar values with ranges. |
| Current vs recommended | Absolute values and deltas so riders know what must change. |
| Implementation order | What to adjust first and what to leave until the bike has been ridden. |
| Risk and caution box | Likely overloads, hardware limits and parts needed if the target is not reachable. |
| Why this works | Plain-language biomechanical explanation so the fit feels trustworthy. |
| Validate / ride / feedback actions | Buttons to record video, mark changes complete and submit ride feedback. |

| Important UX rule Never ask the rider to change too many sensitive variables at once. The result screen should explicitly stage the order of change: usually cleats first, then saddle height, then setback, then tilt, then bar height and reach, then component swaps. |
| :---- |

## **6.5 Post-ride feedback UX**

The feedback experience must be fast enough that riders actually use it. A 30-second guided check-in is more valuable than a complex survey no one completes.

• Show the check-in only for profiles marked as ridden.

• Pre-fill the profile name, bike name and the changes that were actually made.

• Use a pain map plus five or six key sliders; keep free text optional.

• Return one suggested refinement, not five competing suggestions.

# **7\. Migration from the existing engine to Engine v2**

The existing calculation engine should not be thrown away. It should become the seed layer and compatibility layer for Engine v2. This keeps continuity for current users, reduces implementation risk and protects already-developed logic.

### **What to keep from v1 and what to add in v2**

| V1 capability to retain | How it is used in v2 | New capability added |
| ----- | ----- | ----- |
| Category-based saddle-height logic | Acts as the starting seed before validation and feedback. | Confidence ranges and validation updates. |
| Setback, bar drop and reach formulas | Remain deterministic fallback outputs when data is limited. | Bike-specific and profile-specific overlays. |
| Saddle tilt, cleat and handlebar width rules | Remain part of the recommendation object. | Symptom-driven prioritization and learning. |
| Stack/reach solver | Becomes the translation engine for each bike. | Hardware feasibility and component recommendation layer. |
| Current vs target comparison | Still shown in results. | History, versioning and change tracking. |

## **7.1 Migration strategy**

1\. Preserve all historical outputs. Every old fit should be stored as a legacy recommendation snapshot.

2\. Introduce the new data model before changing the front-end experience.

3\. Run v1 and v2 in parallel for a calibration phase.

4\. Backfill legacy users into rider \-\> bike \-\> base profile structures.

5\. Release multi-bike and multi-profile UX before enabling feedback-driven refinement.

6\. Turn on dynamic validation and learning with feature flags and careful QA.

## **7.2 Legacy-to-v2 data mapping**

### **Suggested mapping**

| Legacy field / concept | V2 destination | Migration note |
| ----- | ----- | ----- |
| Single fit input payload | RiderAssessment \+ Bike \+ Base BikeProfile | If a bike name is missing, create 'Imported Bike 1' and let the user rename it later. |
| Bike category | Bike.type | Used to pre-populate supported profile options. |
| Ambition / goal | BikeProfile.goal | Create a Base profile first; derive other profiles later. |
| Current saddle / bar measurements | Bike current setup snapshot | Used immediately for compare view and delta recommendations. |
| Frame stack / reach / stem / spacers | Bike hardware configuration | Feeds the bike translation layer directly. |
| Legacy outputs | Imported Recommendation set | Store with source='legacy\_v1' for transparency and rollback. |

## **7.3 Rollout phases**

### **Recommended rollout plan**

| Phase | Scope | Exit criteria |
| ----- | ----- | ----- |
| Phase 0 — Schema and compatibility | Add rider, bike, profile, session and feedback entities. Keep v1 UI intact. | Data model live without breaking existing flows. |
| Phase 1 — Shadow engine | Run v2 in parallel in the background and compare outputs to v1. | Acceptable delta ranges and no critical regression bugs. |
| Phase 2 — Bike library \+ profile UX | Expose multiple bikes and profiles to users while still using stable calculation paths. | Users can store and switch bikes and profiles successfully. |
| Phase 3 — Dynamic validation beta | Enable guided video validation for selected users or staff-assisted cohorts. | Good capture quality and sensible correction behavior. |
| Phase 4 — Feedback learning beta | Launch ride check-ins and one-step refinement suggestions. | Positive usage rate and no unsafe auto-suggestions. |
| Phase 5 — Default v2 rollout | Make Engine v2 the default engine; keep legacy snapshot access. | User satisfaction, retention and support metrics hold or improve. |

## **7.4 API and service implications**

| Suggested service surface POST   /riders POST   /rider-assessments POST   /bikes POST   /bikes/{bikeId}/profiles POST   /fit-sessions/calculate POST   /validation-captures POST   /feedback GET    /bikes/{bikeId}/profiles/{profileId}/recommendations POST   /legacy/migrate-fit GET    /fit-history |
| :---- |

## **7.5 Success metrics**

### **Metrics to monitor**

| Metric | Why it matters |
| ----- | ----- |
| Percentage of users with more than one bike stored | Validates the core multi-bike value proposition. |
| Percentage of bikes with more than one profile | Shows whether profile UX is clear and useful. |
| Video validation completion rate | Measures adoption of dynamic validation. |
| Feedback completion rate after ridden profiles | Measures whether the learning loop is viable. |
| Comfort and control improvement after first refinement | Direct evidence that the engine gets better over time. |
| Support tickets related to confusing recommendations | Proxy for output clarity and safety. |
| Conversion to premium or advanced fit workflows | Commercial proof of value. |

# **8\. Recommended implementation approach**

The safest and fastest route is to keep the current numeric engine as the deterministic seed generator, then wrap it in the six new layers one by one. This avoids a risky rewrite and lets the product show user value early.

1\. Refactor the current formulas into a reusable Seed Engine module.

2\. Build the persistent rider, bike, profile and session schema.

3\. Add the bike library and profile manager to the UI.

4\. Introduce confidence ranges and current-vs-target deltas.

5\. Add dynamic validation capture and correction rules.

6\. Launch post-ride feedback and conservative refinement suggestions.

7\. Use shadow mode, analytics and manual QA to calibrate the learning engine before automating anything wider.

| Recommended product position BestBikeFit4U should not present itself as a one-off calculator. It should present itself as an adaptive bike fitting system that helps riders set up every bike for every riding context and refine that setup over time. |
| :---- |

# **Appendix A — Example recommendation payload**

| {   "riderId": "r\_102",   "bikeId": "b\_204",   "profileId": "p\_mountain",   "engineVersion": "v2.0.0",   "recommendations": \[     {       "parameter": "saddleHeightMm",       "target": 739,       "rangeLow": 737,       "rangeHigh": 742,       "confidence": 0.84,       "method": "seed \+ validation \+ mountain overlay",       "why": "better knee extension and less posterior chain overload",       "feasibility": "directly achievable",       "riskFlags": \["re-check pelvic stability after 2 rides"\],       "changeOrder": 2     },     {       "parameter": "barDropMm",       "target": 52,       "rangeLow": 50,       "rangeHigh": 58,       "confidence": 0.78,       "method": "capacity cap \+ mountain overlay",       "why": "better breathing and descending control",       "feasibility": "requires \+10 mm spacers",       "riskFlags": \["check steering feel on next ride"\],       "changeOrder": 5     }   \] } |
| :---- |

# **Appendix B — Default profile family per bike type**

| Bike type | Profiles to create by default |
| :---: | ----- |
| Road | Base, Mountain, Endurance, Performance |
| Gravel | Base, Endurance, Mountain, Technical |
| MTB | Base, Technical Mountain, Endurance Trail |
| City / Commute | Base, Comfort, Loaded Commute |
| TT / Tri | Base, Race, Long-course |

## **Closing note**

Engine v2 is not simply a bigger formula sheet. It is a product architecture that turns bike fitting into a persistent, explainable and improving service. That is the right foundation if the goal is to help riders cycle comfortably, confidently and safely on every bike and in every condition.