# Lead handoff — instructions for the next Claude lead/watcher

Last updated: 2026-09-30, evening. Replaces the 2026-09-29 note.

You are the **project lead** for the bestbikefit4u.eu redesign. You do not write most of the code yourself:
you specify work on the Sfora board, dispatch it to four Codex agents in tmux, watch them, answer their
approval prompts, review every result against its brief and the design canvas, commit accepted work,
push previews and keep the board current. Ortwin (the user) makes the product and release decisions.

## 1. Rules (non-negotiable)

1. **Production = the `main` branch.** Never merge or push to `main`, and never promote a Vercel
   deployment to production, without Ortwin's explicit go-ahead *for that release*. Previews are fine.
2. **Credentials.** Never read, print or pass on keys or tokens: not `/me/api-key` in the Sfora shell,
   not `.env*`, not `vercel env pull`, not `VERCEL_OIDC_TOKEN`. `vercel env ls` (names only) is fine.
3. **No invented data.** Values in the product, report and dashboard come from real payloads/engines.
   Missing data is hidden or shown as an empty state, never filled with example values. Unverified
   claims stay off the site (see `src/app/(public)/page.tsx` TODO).
4. **Ownership.** Each agent edits only its own files (table below). If a fix is needed in another
   agent's files, route it to that owner or hand over ownership explicitly in the brief.
5. **Frozen files:** `src/i18n/messages/nl.ts` and `en.ts`. New copy goes in
   `src/i18n/{calculators,marketing,account}/*`.
6. **Styling:** semantic Tailwind tokens; CSS modules are tokens-only (`npm run lint:css-modules`).
   Brand rules: `plans/redesign-canvas/reference/brand.md` (ink #0F2420, lime #CFF26A, petrol #0A7263,
   paper #F5F8F3; Bricolage Grotesque / Figtree / DM Mono for every number).
7. **Stop means stop.** If Ortwin rejects a tool call or says stop/wait, do nothing until he says continue.
   Background events (monitor, task notifications) are never his approval.
8. **Do not kill processes you did not start** unless you verified (ps/lsof) they are an agent's own
   temporary servers and the agent asked. Leave dev servers on :3000–:3002 alone.

## 2. Settings and start command

- Allow rules live in **`~/.claude/settings.json`** (user level, so they apply from any folder):
  tmux binary, the Sfora helper, `npx sfora-cli|vercel|vitest|tsc|eslint`, `npm run`, `git`, `node`,
  `python3`, `ps`, `lsof`, `sips`, reads under the project and `/private/tmp/claude-501`.
  `permissions.additionalDirectories` includes `~/Developer/bestbikefit4u`. Backup of the previous file:
  `~/.claude/settings.json.bak-2026-09-30`.
- `blockReadsOutsideWorkingDirectories` is on. Work from `~/Developer/bestbikefit4u` (or add it with `/add-dir`).
- Fewest prompts: Ortwin can start Claude with `claude --dangerously-skip-permissions --continue`
  (two normal hyphens; typing it in the chat does nothing). You cannot enable it yourself; do not try
  to work around the permission system.
- Codex agents ask their own approvals. They stop asking only when restarted with `codex --full-auto`
  (resume a conversation with `codex resume <id>`). Only restart them between tasks.

## 3. The agents (tmux)

tmux binary (bundled with tmux-ide): `T=/opt/homebrew/lib/node_modules/tmux-ide/packages/daemon/dist/native/tmux/darwin-arm64/tmux`
and always call it as `$T -L default …`. Session `tmux-ide-local-b5efb5983fe470785399`, window `workspace`.
Check panes with `$T -L default list-panes -a -F '#{pane_id} #{pane_title} #{pane_current_command}'`.

| Pane | Agent | Owns |
|---|---|---|
| %3 | Codex A | `src/components/layout/*` (Header, Footer, mobile menu, LanguageSwitch), marketing pages, `src/i18n/marketing` |
| %4 | Codex B | account shell, `/dashboard`, `/profile`, `/fit`, `src/components/dashboard`, `src/i18n/account` |
| %7 | Codex C | `src/components/ui/*`, `src/components/prototyper-ui/*`, `globals.css`, calculators, `src/lib/reports/*` + PDF route |
| %6 | Codex D | bikes pages and `src/components/features/bikes`, science pages, the QA sweep harness `tests/visual/final-sweep/*`. Also reads the Sfora room "Claud - Redesign". |

**Send a task** (clear the composer first; long text is fine):

```sh
$T -L default send-keys -t %4 C-u
$T -L default send-keys -t %4 -l "Lead: task 30 ... print DONE 30."
$T -L default send-keys -t %4 Enter
```

Use `Tab` instead of `Enter` to queue a message behind the running turn. Check that it started
(`capture-pane … | tail`, look for "Working"). Stale queued messages fire later: queue a correction if needed.

**Every brief contains:** task id, source (brief file / canvas board / sweep finding with file:line),
owned files, what not to touch, acceptance (tests, `npm run lint`, typecheck, a sweep with
`--filter=...`, screenshots in `code-renders/<id>-*`), `audit/<id>-notes.md`, `audit/files-<id>.txt`
(no PNG/PDF), "no commit", "use subagents where useful", and "print DONE <id>".

**Approval prompts.** Look before you press anything:
`$T -L default capture-pane -p -J -t %6 -S -60 | grep -A14 'Would you like'`.
Approve with `y` (or `p` = always, for harmless repeat commands such as the sweep) only when the command
is local QA/build/test work in the agent's own scope. Subagent prompts can show up in another agent's
pane ("o to open thread"). Never press keys blindly; a stray `y`/Enter lands in the composer (clear with `C-u`).

**Watcher.** Re-arm this Monitor after every restart and on each 30-minute expiry:

```sh
T=/opt/homebrew/lib/node_modules/tmux-ide/packages/daemon/dist/native/tmux/darwin-arm64/tmux
declare -A lastdone seen reported nm
nm[%3]="Codex A"; nm[%4]="Codex B"; nm[%7]="Codex C"; nm[%6]="Codex D"
getd(){ $T -L default capture-pane -p -J -t $1 -S -300 2>/dev/null | grep -vE 'Lead here|Lead note|Lead review|Lead:|Lead,|[Pp]rint DONE|DONE [0-9.a-z]+ with|confirmation of|before checking' | grep -oE '(^|[[:space:].•])DONE [0-9]+(\.[0-9]+)?[a-z0-9]*(\.[0-9]+)?([[:space:]]|$|—)' | tail -1 | grep -oE 'DONE [0-9]+(\.[0-9]+)?[a-z0-9]*(\.[0-9]+)?'; }
for p in %3 %4 %7 %6; do lastdone[$p]=$(getd $p); seen[$p]=0; reported[$p]=0; done
while true; do
  for p in %3 %4 %7 %6; do
    d=$(getd $p)
    if [ -n "$d" ] && [ "$d" != "${lastdone[$p]}" ]; then echo "${nm[$p]} ($p): $d"; lastdone[$p]=$d; fi
    if $T -L default capture-pane -p -J -t $p 2>/dev/null | grep -v '^\s*$' | tail -4 | grep -q 'Press enter to confirm'; then
      seen[$p]=$(( ${seen[$p]} + 1 ))
      if [ ${seen[$p]} -ge 2 ] && [ "${reported[$p]}" = 0 ]; then echo "${nm[$p]} ($p): approval prompt (waiting)"; reported[$p]=1; fi
    else seen[$p]=0; reported[$p]=0; fi
  done
  sleep 20
done
```

A "DONE" event can be a false positive (an agent quoting a DONE). Always read the pane before acting.

## 4. Sfora (board and chat)

Project `bestbikefit4u-eu` (org personio), board columns `01-triage`, `02-todo`, `03-in-progress`, `04-done`.
Create your own helper in your scratchpad (paths change per session):

```sh
cat > "$SCRATCH/sf" <<'EOF'
#!/bin/sh
# usage: sf "cmd1" "cmd2" ...  — runs commands in the sfora shell
cd "$(dirname "$0")"
{ for c in "$@"; do printf '%s\n' "$c"; done; echo exit; } | NODE_NO_WARNINGS=1 npx -y sfora-cli 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | tail -n +4
EOF
chmod +x "$SCRATCH/sf"
```

(The previous helper still exists at
`/private/tmp/claude-501/-Users-ortwinverreck--tmux-ide-runtime-compiled-tui/5dcd63b2-a42d-4bc4-927e-3d2c3422bb55/scratchpad/sf`
and is in the allow list.) Then add a `Bash(<your path>/sf *)` allow rule to `~/.claude/settings.json`.

- List: `sf "ls /projects/bestbikefit4u-eu/board/02-todo"`; read: `sf "cat <card path>"`.
- Append a note: `sf "cat X | sed -e '\$a Note text.' | put X"`.
- Move a card: `sf "cat X | sed -e 's/^column: .*/column: Done/' | put X"` (also `In progress`, `To do`).
- New card: write a markdown file and run `npx sfora-cli task file.md --project bestbikefit4u-eu --column "To do"`.
- New doc: `npx sfora-cli doc file.md --project bestbikefit4u-eu`.
- Chat: `npx sfora-cli chat "Claud - Redesign" -n 20 < /dev/null` (read), `-m "text"` (send).
- **Pitfalls:** en dashes, `\/` and fancy quotes in sed notes fail silently; use plain ASCII and check
  the "Wrote" line. `put` resolves local files relative to the shell's `/`, so pipe instead.
  **Card comments are not readable with the CLI (v0.16):** if Ortwin says he left feedback in
  comments, ask him to paste it or put it in the card text.

## 5. Review → commit → push → deploy

1. On "DONE <id>": read `audit/<id>-notes.md` and `files-<id>.txt`, `git diff` the files.
2. Compare screenshots with the canvas board. Renders live in `plans/redesign-canvas/code-renders/`
   (git-ignored). To view: combine board + render side by side with `python3` (PIL) into your
   scratchpad and Read the result.
3. Check: data from real sources, NL has no English leaks, numbers in DM Mono, 44px targets, light/dark.
4. Run the focused tests yourself; for bigger batches `npx tsc --noEmit -p .`, `npm run lint`,
   `npx vitest run --maxWorkers=4`.
5. Commit only the agent's list:
   `grep -vE '\.(png|pdf)$' files-<id>.txt > list; git add --pathspec-from-file=list; git commit -m "... (<id>)"`
   ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Screenshots are git-ignored.
6. Or send a review round (`<id>.1`) with numbered, concrete fixes.
7. **Push for a preview.** The local branch history contains large screenshot blobs, so push a
   squashed commit on top of the last pushed one:
   ```sh
   P=$(git rev-parse origin/redesign/canvas)
   C=$(git commit-tree HEAD^{tree} -p $P -m "Redesign: <summary>")
   git push origin ${C}:refs/heads/redesign/canvas && git tag -f redesign-canvas-pushed $C
   ```
   Vercel builds a preview automatically (`npx vercel ls bestbikefit4u-eu`). Deployment protection:
   test with `npx vercel curl "<full URL>" -- -s -o /dev/null -w '%{http_code}'`.
8. **Production** only after Ortwin's go-ahead: follow `docs/RELEASE_READINESS_CHECKLIST.md`, then merge
   `redesign/canvas` into `main` as one squash commit (PR), and verify the production deployment.

Whole-app QA: `node tests/visual/final-sweep/sweep.mjs [--filter=/a,/b] --output=... --label=...`
(NL/EN × 1440/390, axe, touch targets; serves the local preview over HTTPS). Note: `--filter=/` matches all routes.

## 6. State at handoff (2026-09-30)

- Design: 72 boards in the canvas https://claude.ai/artifact/87PNyNszcNRjBZBX9ZT3oX (incl. FitRapport1–6
  and the updated Dashboard). Snapshot in `plans/redesign-canvas/canvas/`.
- Code complete on `redesign/canvas`: all pages, 6-page PDF report (26, 26.1), dashboard aligned with the
  report (27, 27.1), sweep fixes 25a–25f, tap targets 29a/29b, HTTPS harness 29d. Last local commit `cd1c850`.
- Final full sweep: 280/280 cases without failures. Release gates pass on `cd1c850`: test:contracts,
  lint, typecheck, test:unit (1,291 passed), test:e2e:communication, build:vercel.
- Preview: this handoff commit is pushed as a squash on top of `4f37555`; see `npx vercel ls bestbikefit4u-eu`
  for the URL. The previous preview (`4f37555`) passed the smoke test (public pages 200, account pages
  redirect to login).
- Frontend-only release: no `convex/` or `shared/` changes versus `main`; `main` is an ancestor.

**Board:** Done includes 33 (sweep fixes), 36 (claims dropped), 37 (PDF), 38 (dashboard).
Open:
- **35 Production release** (In progress, priority): waiting for Ortwin's manual checks on the preview
  (magic-code login, report e-mail, sender `BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`)
  and his go-ahead for the squash merge to `main`.
- **32 Engine contracts** (To do, not blocking): Ortwin to pick a source for fuel values and a W/kg level
  table. Until then the tools show no doses and no ranking; slider ranges are `PROPOSED_RANGES`.
- **27 Build and QA board by board**: close it when the release is out.
