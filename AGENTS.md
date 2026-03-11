# AGENTS.md

This is a living project guide for AI coding agents working in this repository.
Update this file at the end of each run when behavior, architecture, or workflow changes.

## Project Snapshot

- App: Bucket Budgeting
- Framework: Next.js 16 (App Router)
- Language: TypeScript
- UI: React 19 + Tailwind CSS 4 + shadcn-style UI primitives
- State: Client-side React state with `localStorage` persistence
- PWA: Web app manifest + production-only service worker registration

## Key Files

- `app/page.tsx`: Main budgeting UI and state logic
- `components/budget/categories-panel.tsx`: Categories management panel UI
- `components/budget/transactions-panel.tsx`: Transaction history list panel UI
- `components/budget/types.ts`: Shared budget data model types
- `app/layout.tsx`: Global layout, metadata, fonts, SW registration
- `app/manifest.ts`: PWA manifest metadata
- `public/sw.js`: Service worker script
- `components/ui/*`: Reusable UI primitives (button, card, dialog, input, etc.)
- `components/ui/tabs.tsx`: Reusable tabs primitive for section switching
- `components/pwa/register-sw.tsx`: Production service worker registration

## Runtime Behavior

- Budget state persisted under `localStorage` key: `bucket-budgeting-state-v1`
- Data model:
  - `balance: number`
  - `categories: { id: string; name: string; amount: number }[]`
  - `transactions: { id: string; direction: "in" | "out"; amount: number; description: string; categoryId?: string; categoryName?: string; createdAt: string }[]`
- Currency handling:
  - Values rounded to cents (`roundToCurrency`)
  - User input parsed by `parseMoneyInput` (invalid/negative -> `0`)

## Current Feature Notes

- Overall balance is not directly editable.
- Balance updates happen through dialogs:
  - `Deposit`: adds amount to overall balance
  - `Payment`: subtracts amount from overall balance, optionally subtracts from a selected category
- Deposits and payments are recorded in the transactions history list.
- Categories and transaction history are shown in a tabbed details section.
- `Add Category` still allocates from remaining balance.
- Category amount editing is capped to avoid over-allocation.

## Dev Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Start production build: `npm run start`

## Agent Guardrails

- Prefer editing existing patterns over introducing new architecture.
- Keep numeric operations currency-safe (round to 2 decimals).
- Preserve local persistence compatibility unless explicitly migrating state.
- Use existing UI primitives in `components/ui` before adding new dependencies.
- Validate form inputs and show clear inline errors.

## End-Of-Run Update Checklist

1. Update `Current Feature Notes` if behavior changed.
2. Add a new entry in `Run Log` with date and what changed.
3. Add any new commands, files, or architectural decisions.
4. Mention unresolved risks or follow-up tasks.

## Run Log

- 2026-03-07:
  - Added `Deposit` and `Payment` dialog flows in `app/page.tsx`.
  - Locked direct editing of overall balance (read-only display).
  - Payment can optionally deduct from a selected category with validation.
  - Added this `AGENTS.md` living guide.
- 2026-03-11:
  - Added a shadcn-style tabs primitive in `components/ui/tabs.tsx`.
  - Split budget details UI into `components/budget/categories-panel.tsx` and `components/budget/transactions-panel.tsx`.
  - Added transaction tracking (`in`/`out`) persisted in localStorage and shown in a dedicated Transactions tab.
