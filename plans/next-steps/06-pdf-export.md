# Step 06: PDF Export

## Objective

Implement results PDF export so users can download fit recommendations.

## Tasks

1. Implement server-side PDF generation for a recommendation report.
2. Wire the results page download button to generated PDF output.
3. Include key report sections:
   - Core fit metrics
   - Adjustment order
   - Frame recommendation summary
   - Safety disclaimers
4. Ensure only session owners can generate/download their report.
5. Add regression tests for PDF endpoint authorization and payload validity.

## Deliverable

- Working PDF download from results page
- Authorization checks enforced for PDF report generation

## Completion Checklist

- [x] Results page PDF button is enabled and functional
- [x] PDF content matches current recommendation values
- [x] Unauthorized users cannot access another user's PDF
- [x] Error handling exists for generation failures
