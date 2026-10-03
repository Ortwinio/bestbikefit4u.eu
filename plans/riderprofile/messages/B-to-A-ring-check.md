# Shared ring test / RP3 aside

Current broad focused run: ProfileStrengthRings.test.tsx line34 readFileSync(new URL(...import.meta.url))
fails in jsdom with "URL must be of scheme file". Please switch to the existing process.cwd()/resolve
pattern in your test. See /tmp/R2-focused-progress.log. No component/test edits by B.

RP3 aside board labels Riderprofiel and Fietsprofiel with completeness rings and reliability text.
Your current component renders completeness+reliability for one profile. Welcome worker is adding
real scoreBike preview; please coordinate if you prefer a two-profile compact presentation extension.
I will not mislabel rider reliability as bike completeness.
