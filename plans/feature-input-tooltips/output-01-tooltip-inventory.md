# Output 01: Tooltip Inventory

## Date

2026-02-15

## Coverage Summary

- Total concrete fields inventoried: **37**
- Control types covered: `input`, `select`, `textarea`, shared `Input`/`Select` usages
- Scope baseline:
  - Auth flow
  - Dashboard/measurement/bikes/questionnaire/results flows
  - Public contact + calculator pages

Notes:
- `StepFlexibility` and `StepCoreStability` use button-choice controls, not input/select/textarea.
- `src/components/ui/Input.tsx` and `src/components/ui/Select.tsx` are control primitives and are not counted as concrete end-user fields.

## Tooltip Content Matrix

| # | File | Field Key | Control | Label/Prompt | Tooltip Draft | Unit/Format Guidance | Validation Hint | Priority |
|---|------|-----------|---------|--------------|---------------|----------------------|-----------------|----------|
| 1 | `src/app/(auth)/login/page.tsx` | `email` | `Input(email)` | Email address | Use the email linked to your BikeFit account. We send a one-time login code. | Valid email format (`name@domain.com`) | Required | Required clarification |
| 2 | `src/app/(auth)/login/page.tsx` | `code` | `Input(text)` | Verification Code | Enter the 7-character code from your email exactly as shown. | Uppercase alphanumeric code | Required, max 7 chars | Required clarification |
| 3 | `src/components/measurements/StepBodyMeasurements.tsx` | `heightCm` | `Input(number)` | Height (cm) | Total standing height used for frame-size and reach calculations. | Centimeters (`cm`) | Required, expected 130-210 cm | Required clarification |
| 4 | `src/components/measurements/StepBodyMeasurements.tsx` | `inseamCm` | `Input(number)` | Inseam (cm) | Floor-to-crotch distance with a book; primary driver for saddle height. | Centimeters (`cm`) | Required, expected 55-105 cm and < height | Required clarification |
| 5 | `src/components/measurements/StepAdvancedMeasurements.tsx` | `torsoLengthCm` | `Input(number)` | Torso Length (cm) | Hip-bone to shoulder distance to improve reach accuracy. | Centimeters (`cm`) | Optional; typical adult range ~45-75 cm | Helpful enhancement |
| 6 | `src/components/measurements/StepAdvancedMeasurements.tsx` | `armLengthCm` | `Input(number)` | Arm Length (cm) | Shoulder to wrist distance used with torso length for cockpit reach. | Centimeters (`cm`) | Optional; typical range ~45-75 cm | Helpful enhancement |
| 7 | `src/components/measurements/StepAdvancedMeasurements.tsx` | `shoulderWidthCm` | `Input(number)` | Shoulder Width (cm) | Acromion-to-acromion width used for handlebar width guidance. | Centimeters (`cm`) | Optional; enter bone-to-bone width | Helpful enhancement |
| 8 | `src/components/measurements/StepAdvancedMeasurements.tsx` | `femurLengthCm` | `Input(number)` | Femur Length (cm) | Hip-joint to knee-center distance to improve setback confidence. | Centimeters (`cm`) | Optional; numeric positive value | Helpful enhancement |
| 9 | `src/components/bikes/BikeForm.tsx` | `name` | `Input(text)` | Bike Name | A recognizable bike name to identify this setup in future sessions. | Free text | Required, non-empty | Required clarification |
| 10 | `src/components/bikes/BikeForm.tsx` | `bikeType` | `Select` | Bike Type | Choose the discipline that best matches this bike’s intended use. | One of supported categories | Required | Required clarification |
| 11 | `src/components/bikes/BikeForm.tsx` | `stackMm` | `Input(number)` | Stack (mm) | Vertical frame reference from bottom bracket to head tube top-center. | Millimeters (`mm`) | Optional; positive number | Helpful enhancement |
| 12 | `src/components/bikes/BikeForm.tsx` | `reachMm` | `Input(number)` | Reach (mm) | Horizontal frame reference from bottom bracket to head tube top-center. | Millimeters (`mm`) | Optional; positive number | Helpful enhancement |
| 13 | `src/components/bikes/BikeForm.tsx` | `seatTubeAngle` | `Input(number)` | Seat Tube Angle (deg) | Seat tube angle helps align saddle setback with frame geometry. | Degrees (`deg`) | Optional; typical road range ~72-75 | Helpful enhancement |
| 14 | `src/components/bikes/BikeForm.tsx` | `headTubeAngle` | `Input(number)` | Head Tube Angle (deg) | Head tube angle informs handling style and cockpit assumptions. | Degrees (`deg`) | Optional; typical range ~69-74 | Helpful enhancement |
| 15 | `src/components/bikes/BikeForm.tsx` | `frameSize` | `Input(text)` | Frame Size | Manufacturer size label (for example 54, M, 56cm). | Brand-specific size text | Optional | Helpful enhancement |
| 16 | `src/components/bikes/BikeForm.tsx` | `saddleHeightMm` | `Input(number)` | Saddle Height (mm) | Current saddle height to compare with recommended values. | Millimeters (`mm`) | Optional; positive number | Helpful enhancement |
| 17 | `src/components/bikes/BikeForm.tsx` | `saddleSetbackMm` | `Input(number)` | Saddle Setback (mm) | Horizontal saddle position behind bottom bracket for comparison. | Millimeters (`mm`) | Optional; numeric value | Helpful enhancement |
| 18 | `src/components/bikes/BikeForm.tsx` | `stemLengthMm` | `Input(number)` | Stem Length (mm) | Current stem length used for reach interpretation. | Millimeters (`mm`) | Optional; positive number | Helpful enhancement |
| 19 | `src/components/bikes/BikeForm.tsx` | `stemAngle` | `Input(number)` | Stem Angle (deg) | Current stem pitch; affects bar height and drop. | Degrees (`deg`) | Optional; can be negative/positive | Helpful enhancement |
| 20 | `src/components/bikes/BikeForm.tsx` | `handlebarWidthMm` | `Input(number)` | Handlebar Width (mm) | Center-to-center handlebar width for control and comfort fit checks. | Millimeters (`mm`) | Optional; positive number | Helpful enhancement |
| 21 | `src/components/bikes/BikeForm.tsx` | `crankLengthMm` | `Input(number)` | Crank Length (mm) | Current crank size used against inseam-based recommendation. | Millimeters (`mm`) | Optional; typical 165-177.5 mm | Helpful enhancement |
| 22 | `src/components/questionnaire/questions/NumericQuestion.tsx` | `questionNumericValue` | `input(number)` | Dynamic numeric question | Enter a numeric response only; use range guidance shown below field. | Number + optional unit suffix | Enforce `min`/`max` when provided | Required clarification |
| 23 | `src/components/questionnaire/questions/TextQuestion.tsx` | `questionTextValue` | `textarea` | Dynamic text question | Provide concise context that helps personalize recommendations. | Free text up to max length | Max length default 500 chars | Helpful enhancement |
| 24 | `src/app/(dashboard)/fit/[sessionId]/results/page.tsx` | `recipientEmail` | `Input(email)` | Email address | Destination email for sending your fit report summary. | Valid email format | Required before send | Required clarification |
| 25 | `src/app/(public)/contact/page.tsx` | `name` | `input(text)` | Name | Your name so support can address your message properly. | Free text | Optional in UI today; should be validated as non-empty when wired | Helpful enhancement |
| 26 | `src/app/(public)/contact/page.tsx` | `email` | `input(email)` | Email | Contact email for follow-up on your request. | Valid email format | Should be valid email when form is wired | Required clarification |
| 27 | `src/app/(public)/contact/page.tsx` | `message` | `textarea` | Message | Describe your question, context, and goal so support can help quickly. | Free text paragraph | Encourage at least 1-2 sentences | Helpful enhancement |
| 28 | `src/app/(public)/calculators/saddle-height/page.tsx` | `inseamCm` | `input(number)` | Inseam (cm) | Inseam drives base saddle-height calculation and adjustment band. | Centimeters (`cm`) | Required; 55-105 cm | Required clarification |
| 29 | `src/app/(public)/calculators/saddle-height/page.tsx` | `category` | `select` | Bike Category | Select bike category because each has different fit multipliers. | Enumerated options | Required to avoid wrong multiplier | Required clarification |
| 30 | `src/app/(public)/calculators/saddle-height/page.tsx` | `ambition` | `select` | Riding Goal | Riding goal controls comfort vs aggressive position offsets. | Enumerated options | Required for meaningful result | Required clarification |
| 31 | `src/app/(public)/calculators/saddle-height/page.tsx` | `flexibility` | `input(number)` | Flexibility (1-5) | Self-score flexibility; lower scores reduce aggressiveness in fit output. | Integer scale 1-5 | Clamp/validate 1-5 | Required clarification |
| 32 | `src/app/(public)/calculators/saddle-height/page.tsx` | `core` | `input(number)` | Core Stability (1-5) | Self-score core stability; affects drop/reach tolerance assumptions. | Integer scale 1-5 | Clamp/validate 1-5 | Required clarification |
| 33 | `src/app/(public)/calculators/frame-size/page.tsx` | `heightCm` | `input(number)` | Height (cm) | Height contributes to quick frame-size estimation band. | Centimeters (`cm`) | Required; 130-210 cm | Required clarification |
| 34 | `src/app/(public)/calculators/frame-size/page.tsx` | `inseamCm` | `input(number)` | Inseam (cm) | Inseam improves frame-size and saddle-baseline estimate accuracy. | Centimeters (`cm`) | Required; 55-105 cm and < height | Required clarification |
| 35 | `src/app/(public)/calculators/frame-size/page.tsx` | `category` | `select` | Bike Category | Category determines whether output is road/gravel cm sizes or MTB/city bands. | Enumerated options | Required for sizing rules | Required clarification |
| 36 | `src/app/(public)/calculators/crank-length/page.tsx` | `inseamCm` | `input(number)` | Inseam (cm) | Inseam determines crank-length bracket lookup. | Centimeters (`cm`) | Required; 55-105 cm | Required clarification |
| 37 | `src/app/(public)/calculators/crank-length/page.tsx` | `category` | `select` | Bike Category | Category applies MTB-specific crank adjustment logic. | Enumerated options | Required for category-specific output | Required clarification |

## Next-Step Inputs For Step 02

- Add tooltip prop support in:
  - `src/components/ui/Input.tsx`
  - `src/components/ui/Select.tsx`
- Define a tooltip wrapper strategy for native controls in:
  - `src/app/(public)/contact/page.tsx`
  - `src/app/(public)/calculators/*`
  - `src/components/questionnaire/questions/NumericQuestion.tsx`
  - `src/components/questionnaire/questions/TextQuestion.tsx`
