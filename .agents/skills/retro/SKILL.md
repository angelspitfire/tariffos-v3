---
name: retro
description: >-
  Runs a structured post-bug / post-stabilization Engineering & QA Retrospective to analyze escaped
  defects, diagnose why existing checks/tests missed them, and route preventive defenses across
  4 layers: (1) Static Harness & Property Invariants, (2) Deterministic Playwright UI & Preview
  CI/CD Gates, (3) AI Exploratory/Eval Agents, and (4) Human Domain Sign-off. Use when the user
  invokes /retro, asks for a retro, asks why tests passed while the app was broken, wants to harden
  the check harness (`scripts/check.mjs`, `.oxlintrc.jsonc`), or wants to turn manual bug-hunting
  into automated Playwright/CI checks. Triggers on: "/retro", "hagamos una retro", "retro",
  "por qué pasó check si estaba roto", "endurecer el harness", "qué convertimos a Playwright".
---

# Engineering & QA Retrospective (`retro`)

Turn escaped runtime bugs and manual debugging sessions into permanent, layered defenses — always pushing each check down to the **cheapest, fastest deterministic layer** capable of catching the entire *class* of bug.

## Workflow

### Step 1: Harvest Escaped Defects (Evidence First)
1. Gather concrete defects from the current session, recent fix commits (`git log -n 10 --oneline`, `git show --stat`), failing logs, or browser reports.
2. Inspect the project's existing quality gates before proposing anything:
   - Static harness & linters (e.g., `scripts/check.mjs`, `scripts/lib/*`, `.oxlintrc.jsonc`, `tsconfig.json`).
   - Build & deploy checks (e.g., `scripts/check-deploy.mjs`, `.github/workflows/*`).
   - Unit/integration/E2E suites (`vitest`, `playwright.config.ts`, `scripts/smoke-e2e.mjs`).
3. List every escaped defect with its **user-visible symptom**, **exact root cause**, and **`file:line`**. Never invent hypothetical bugs.

### Step 2: Diagnose the Detection Blind Spot ("Why was `check` green?")
Classify *why* the existing suite missed each defect using these 6 canonical blind spots:
1. **JSDOM Layout & Hit-Testing Blindness:** Unit tests passed in `jsdom`, which ignores responsive CSS (`hidden md:flex`), `z-index` stacking contexts, `pointer-events: none` (e.g., Radix Dialog occluding portaled toasts), scroll overflow, and real browser focus/hit-testing.
2. **Muted Linter / Compiler Warnings:** Rules configured as `"warn"` or invoked with `--quiet` (e.g., `react-hooks/rules-of-hooks`, `jsx-a11y/*`), allowing critical violations to exit `0`.
3. **Example-Based vs. Invariant Testing:** State machines, auth/role gates, or reducers tested on 3–4 happy paths instead of an exhaustive Cartesian product asserting structural invariants (no self-redirect, `<= 1` hop convergence).
4. **Isolated Prop Mocks vs. Integrated State Transitions:** Child views tested with pre-built fixtures while parent/mapper transitions dropped data (e.g., `cifValue === 0` fallback, multi-tool streaming turns overwriting earlier tool outputs).
5. **Anonymous-Only Smoke Tests:** HTTP smoke scripts checking `302/307 -> /login` without testing authenticated role sessions (`super_admin`, `onboarding`, `pending_billing`, `active_member`) or cross-tenant `403` boundaries.
6. **Skipped or Destructive Build Checks:** Production builds (`next build`) avoided during development because they clobber `.next` or mutate `tsconfig.json`.

### Step 3: Route Each Defect Class to the Optimal Layer
Assign every prevention measure to the **lowest layer that can genuinely catch it** (read [layer-routing-cheatsheet.md](./references/layer-routing-cheatsheet.md) for concrete patterns and templates):

| Layer | Target Budget | What Belongs Here | What Does NOT Belong Here |
| :--- | :--- | :--- | :--- |
| **1. Static Harness & Property Invariants** (`pnpm check`) | `< 5s` · `$0` · Every commit | `oxlint`/`tsc` error promotions, repo AST/regex guardrails (banning raw `role="dialog"`, duplicate CSS custom properties), Cartesian state-machine invariant tests, golden multi-tool stream replay tests, isolated `NEXT_DIST_DIR` build checks. | Visual layout, CSS stacking, real network/cookie behavior. |
| **2a. Deterministic Playwright UI** (`pnpm test:e2e`) | `< 45s` · `$0` · Every PR | Real Chromium CSS visibility (`1440×900` + `390×844`), Radix modal + toast `pointer-events` hit-testing, keyboard table navigation, `stopPropagation`, integrated UI flows backed by deterministic `page.route` SSE mocks, global `0 console.error / 0 pageerror / 0 HTTP >= 500` fixture. | Open-ended LLM quality or visual aesthetics judgment. |
| **2b. Preview CI/CD & Post-Deploy Gates** | `< 2m` · `< $0.01` · Pre-merge & Post-deploy | **On Preview (`PR`):** `x-vercel-protection-bypass`, real HTTPS Auth SSR cookies across roles, cross-tenant `403` Storage check, **1 live agent/DB wire turn** + mandatory `if: always()` teardown of `@*.internal` accounts. **On Production:** 100% **read-only** smoke + instant rollback instructions. | Mutating data in production; running 50-item LLM suites on every PR. |
| **3. AI Agent (`browser` + Evals)** | On agent/UI milestones | Ambiguous multi-turn LLM conversations, screenshot visual/UX audits (`/frontend-design`, `/web-design-guidelines`), domain accuracy/cost benchmarks (`eval:classify`). | Deterministic assertions that Playwright can lock down in 200ms. |
| **4. Human / Domain Expert** | Pre-release sign-off | Legal/regulatory validity, messy real-world customer PDFs/scans, real payment/bank reconciliation, cognitive load & UX taste under real operational pressure. | Repetitive regression clicking on every deploy. |

### Step 4: Output Deliverable or Execute (Red → Green)
- **Mode A — Retro & Plan (default when asked to analyze or plan):**
  1. Present a concise **Blind Spot Diagnosis** + **4-Layer Routing Matrix** referencing exact files in the repo.
  2. If requested, persist executable plans in `docs/` and link them in the project's living backlog (`docs/PENDING_BACKLOG.md`).
- **Mode B — Harden Now (when asked to implement):**
  1. **Red:** Introduce or simulate the escaped defect (or run the new guardrail / invariant test / Playwright spec against the unfixed pattern) and confirm it **fails**.
  2. **Green:** Restore/apply the fix and confirm the new check **passes**.
  3. Keep all non-test modules within repository size limits (`<= 200` LOC where enforced) and ensure isolated builds restore any touched config files (`tsconfig.json`, temp build dirs).

### Step 5: Verification Gate
Always finish Mode B by running the repository's full check command (e.g., `pnpm check` and `pnpm test:e2e` if configured) and verifying `git status` is clean of temporary artifacts.
