# Contributing to react-calendar-time

Thanks for taking the time to contribute. This guide covers how to set up the project, make changes, and open a pull request.

By participating, you agree to keep interactions respectful and constructive.

## Prerequisites

- Node.js `>= 18` (CI runs on Node 22)
- npm (the repo uses `package-lock.json`)

## Setup

```bash
git clone https://github.com/Bhardwaj-Raghav/react-calendar-time.git
cd react-calendar-time
npm install
```

## Development scripts

```bash
npm run dev           # interactive playground (localhost:5173)
npm test              # unit tests (Vitest)
npm run test:watch    # tests in watch mode
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint
npm run build         # build library (tsup) + compiled CSS
npm run storybook     # Storybook (localhost:6006)
npm run website       # Astro docs site (localhost:5174)
npm run website:build # static build of the docs site → site-dist/
```

## Project layout

- `src/` — component source
  - `DateTime.tsx`, `DateTimeInput.tsx`, `DateTimeRange.tsx` — public components
  - `hooks/`, `utils/`, `calendar.ts`, `types.ts` — supporting logic and types
  - `index.ts` — public entry point and exports
  - `styles/datepicker.scss` — component styles
- `tests/` — Vitest + Testing Library tests
- `playground/` — local dev sandbox (`npm run dev`)
- `website/` — Astro docs and landing site

## Making changes

1. Fork the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/short-description
   ```
2. Make your change. Keep the public API in `src/index.ts` and `src/types.ts` in sync.
3. Add or update tests in `tests/` for any behavior change.
4. Run the full check suite locally before pushing:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

These are the same steps CI runs, so a clean local run should mean a green PR.

## Tests

- Framework: [Vitest](https://vitest.dev/) with [Testing Library](https://testing-library.com/) and `jsdom`.
- Put tests next to the feature area in `tests/` (see `DateTime.test.tsx`, `DateTimeRange.test.tsx`, `calendar.test.ts`).
- Prefer testing user-facing behavior (keyboard navigation, selection, accessibility) over implementation details.

## Coding conventions

- TypeScript throughout; avoid `any` and keep exported types accurate.
- Match the existing formatting (Prettier + ESLint). Run `npm run lint` before committing.
- Accessibility matters here: preserve dialog semantics, focus management, and keyboard support when touching component behavior.
- Theming is driven by CSS variables (`--ctp-*`). Add new variables rather than hardcoding colors.

## Commit and PR guidelines

- Write clear, imperative commit messages (e.g. `Add week-start prop to range picker`).
- Keep PRs focused; unrelated changes are easier to review as separate PRs.
- In the PR description, explain what changed and why, and link any related issues.
- Update the README or docs site when you change the public API or add features.

## Reporting bugs and requesting features

Open an issue at [github.com/Bhardwaj-Raghav/react-calendar-time/issues](https://github.com/Bhardwaj-Raghav/react-calendar-time/issues). For bugs, include:

- What you expected and what happened
- A minimal reproduction (code snippet or sandbox)
- Versions of `react-calendar-time`, `react`, and your browser

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
