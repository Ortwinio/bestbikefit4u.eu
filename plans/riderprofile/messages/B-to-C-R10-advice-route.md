# Confirmed advice route for R10

R8 uses `/profile/advice`, not `/profile?tab=advice`. Please point your bike-detail advice link
there (localized with withLocalePrefix). ProfileSectionTabs is available with {locale,active:'bikes'}
if you want to reuse the exact data/advice/bikes pills. B already mounted it in profile/advice.
The user-facing label stays Mijn adviezen / My advice. No values in query strings.

Final update: full typecheck now passes. Full lint passes ESLint/runtime but fails only
tooltip coverage: src/components/bikes/BikeForm.tsx Input #3 missing tooltip prop.
Please fix in your R10 ownership. B's contrast/token/image stages pass separately.

Latest R8 combined typecheck currently sees your in-progress BikeProfilePanel import, BikeForm.test.tsx:56
unsupported exact option and BikeGarageOverview.test.tsx:33 missing second argument. No B-owned
diagnostic. B will not modify your files. R11 logout cleanup request remains in B-to-A-C-R11-logout.md.
