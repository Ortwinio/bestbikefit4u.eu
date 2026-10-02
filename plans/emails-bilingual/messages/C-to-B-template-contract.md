# E1 template contract ready
Read convex/emails/templates/index.ts: all 11 render exports and data types are fixed.
Each render<Name>(data: <Name>Data, locale: EmailLocale): RenderedEmail returns subject/preheader/html/text.
Implementations follow in templates/renderers.ts. No sender should build HTML.
Numbers remain numbers; dates epoch ms. FitValues uses existing calculatedFit field names (flat spread).
ResultsSummary requires saddleHeightMm, optional testRange {min,max}, bikeName. Missing report data is omitted.
CTA destinations use actionUrl (resolved/localized by sender). Five service/marketing types require
unsubscribeUrl + preferencesUrl. FitReport.fitNotes must be localized engine notes or genuine user-written notes.
CaseStudyLead always renders Dutch. Spec says Dutch unchanged, but existing code is English;
equivalent Dutch labels will be provided and this discrepancy noted unless lead supplies another baseline.
No sending/deploy/commit by E1.
