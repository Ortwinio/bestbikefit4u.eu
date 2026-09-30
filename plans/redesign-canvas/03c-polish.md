# 03c — Polish after the visual QA (Codex A, small)
1. `TirePressure.dc.html`: the warning block says the same thing twice ("Controleer de druklimieten…" and "Controleer altijd de maximale druk…"). Keep one sentence + `[WAARSCHUWINGEN UIT JE ACCOUNT]`.
2. `TirePressure.dc.html`: the ink panel "Test en verfijn" is tall and mostly empty. Make it fit its content (no stretching to the column height), or move the CTA up under the text.
3. `Login.dc.html` (code state): the spam hint appears twice ("Controleer ook je spammap…" under the buttons and in the info box). Keep only the info box.
4. `TirePressure.dc.html` gauges: "Schaal 0-9 bar · veilige marge 4-9" is a sentence in DM Mono. Use Figtree, with only the numbers in DM Mono (per the consistency rules).
Re-render both boards. Checkers PASS. Print `DONE 03c`.
