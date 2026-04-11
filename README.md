# BestBikeFit4U

BestBikeFit4U is a Next.js + Convex application for guided bike fit recommendations, questionnaire flows, and downloadable fit reports.

## Stack

- Next.js 16 (App Router)
- Convex backend + `@convex-dev/auth`
- TypeScript end-to-end
- Tailwind CSS
- Vitest

## Local Development

```bash
npm ci
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:contracts
npm run build -- --webpack
```

## Multi-Agent Workflow

When coordinating with `tmux-ide`, use the minimal repo convention in [plans/tmux-ide-minimal-operating-convention.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/tmux-ide-minimal-operating-convention.md).

In practice:

- `plans/` is the durable source of workflow truth.
- `.tasks/` is lightweight execution state.
- Task proof must reference real repo artifacts, changed files, or test runs.
- Do not use `tmux-ide validate add ...` in this repo.

## Deployment

- Deployment target: Vercel
- Deployment guide: `docs/VERCEL_DEPLOYMENT.md`
- Vercel build command: `npm run build:vercel`
- Preflight command: `npm run vercel:preflight`

Use `.env.example` as the template for required environment variables.
