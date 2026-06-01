# Simple Outreach App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a landing → wizard → AI-generated email playbook SPA where guests see results in-session and signed-in users can save plans.

**Architecture:** Vite + React SPA with view state (`landing` | `wizard` | `results`). Vercel serverless `/api/generate` calls OpenAI with structured JSON output. Supabase handles auth + persisted `plans`. Guest data lives in `sessionStorage`.

**Tech Stack:** Vite, React 18, TypeScript, React Router (optional `/try` route), Vercel Functions, OpenAI API, Supabase (Auth + Postgres), Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-06-01-outreach-app-design.md`

---

## File structure

```
outreach-app/
├── index.html
├── package.json
├── vite.config.ts
├── vercel.json
├── .env.example
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/plan.ts
│   ├── lib/
│   │   ├── agents.ts
│   │   ├── session.ts
│   │   └── supabase.ts
│   ├── components/
│   │   ├── Landing.tsx
│   │   ├── Wizard.tsx
│   │   ├── AgentPicker.tsx
│   │   ├── LoadingState.tsx
│   │   ├── IcpCard.tsx
│   │   ├── EmailBlock.tsx
│   │   ├── Playbook.tsx
│   │   ├── CopyButton.tsx
│   │   ├── SaveBar.tsx
│   │   └── AuthModal.tsx
│   └── pages/
│       └── Dashboard.tsx          # /dashboard — saved plans (auth only)
├── api/
│   ├── generate.ts
│   └── save-plan.ts
└── tests/
    ├── agents.test.ts
    ├── session.test.ts
    └── Wizard.test.tsx
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `.env.example`, `.gitignore`

- [ ] **Step 1: Initialize Vite React TS**

```bash
cd C:\Users\Brandon\Projects\outreach-app
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom @supabase/supabase-js
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Add Vitest to `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
```

- [ ] **Step 3: Add `tests/setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: `.env.example`**

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 5: Verify dev server**

Run: `npm run dev`  
Expected: app at `http://localhost:5173`

---

### Task 2: Types and agents

**Files:**
- Create: `src/types/plan.ts`, `src/lib/agents.ts`
- Test: `tests/agents.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/agents.test.ts
import { describe, it, expect } from 'vitest'
import { AGENTS, getAgent } from '../src/lib/agents'

describe('agents', () => {
  it('has five agents', () => {
    expect(AGENTS).toHaveLength(5)
  })
  it('returns agent by id', () => {
    expect(getAgent('warm')?.name).toBe('Warm & helpful')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run tests/agents.test.ts`  
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```ts
// src/types/plan.ts
export type AgentId = 'warm' | 'punchy' | 'formal' | 'curious' | 'urgent'

export interface IcpExample {
  name: string
  title: string
  companyType: string
  whyFit: string[]
}

export interface EmailMessage {
  subject: string
  body: string
}

export interface DripEmail extends EmailMessage {
  dayLabel: string
}

export interface OutreachPlan {
  icpExample: IcpExample
  sampleEmail: EmailMessage
  icpTraits: string[]
  findLeadsTips: string[]
  drip: DripEmail[]
}

export interface WizardInput {
  business: string
  idealCustomer: string
  agentId: AgentId
}
```

```ts
// src/lib/agents.ts
import type { AgentId } from '../types/plan'

export interface Agent {
  id: AgentId
  name: string
  tagline: string
  sampleSubject: string
}

export const AGENTS: Agent[] = [
  { id: 'warm', name: 'Warm & helpful', tagline: 'Sounds like a friend who wants to help', sampleSubject: 'Quick idea for {{company}}' },
  { id: 'punchy', name: 'Short & punchy', tagline: 'Few words, straight to the point', sampleSubject: 'Worth 2 minutes?' },
  { id: 'formal', name: 'Professional & formal', tagline: 'Polished and businesslike', sampleSubject: 'Introduction — partnership inquiry' },
  { id: 'curious', name: 'Curious question-asker', tagline: 'Opens with a question, not a pitch', sampleSubject: 'How do you handle {{problem}}?' },
  { id: 'urgent', name: 'Urgent & direct', tagline: 'Clear reason to reply soon', sampleSubject: 'Slot this week — {{offer}}' },
]

export function getAgent(id: AgentId): Agent | undefined {
  return AGENTS.find((a) => a.id === id)
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run tests/agents.test.ts`

---

### Task 3: Session storage helper

**Files:**
- Create: `src/lib/session.ts`
- Test: `tests/session.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { savePlanToSession, loadPlanFromSession, clearPlanSession } from '../src/lib/session'
import type { OutreachPlan, WizardInput } from '../src/types/plan'

const mockPlan = { icpExample: { name: 'A', title: 'B', companyType: 'C', whyFit: ['x'] }, sampleEmail: { subject: 's', body: 'b' }, icpTraits: [], findLeadsTips: [], drip: [] } satisfies OutreachPlan
const mockInput = { business: 'biz', idealCustomer: 'icp', agentId: 'warm' as const }

describe('session', () => {
  beforeEach(() => sessionStorage.clear())
  it('round-trips plan and input', () => {
    savePlanToSession(mockPlan, mockInput)
    expect(loadPlanFromSession()?.plan.icpExample.name).toBe('A')
    clearPlanSession()
    expect(loadPlanFromSession()).toBeNull()
  })
})
```

- [ ] **Step 2: Implement `src/lib/session.ts`**

```ts
import type { OutreachPlan, WizardInput } from '../types/plan'

const KEY = 'outreach-plan'

interface Stored {
  plan: OutreachPlan
  input: WizardInput
}

export function savePlanToSession(plan: OutreachPlan, input: WizardInput): void {
  sessionStorage.setItem(KEY, JSON.stringify({ plan, input }))
}

export function loadPlanFromSession(): Stored | null {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Stored
  } catch {
    return null
  }
}

export function clearPlanSession(): void {
  sessionStorage.removeItem(KEY)
}
```

- [ ] **Step 3: Run tests — PASS**

---

### Task 4: Global styles (fifth-grader simple)

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: CSS variables + layout**

```css
:root {
  --bg: #fafaf9;
  --text: #1c1917;
  --muted: #57534e;
  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --card: #ffffff;
  --radius: 12px;
  --font: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --max-w: 42rem;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--font);
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
}

.container {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 1.5rem;
}

h1 { font-size: 2rem; line-height: 1.2; margin: 0 0 1rem; }
button.primary {
  font-size: 1.125rem;
  padding: 0.875rem 1.5rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  min-height: 44px;
}
button.primary:hover { background: var(--accent-hover); }
```

---

### Task 5: Landing page

**Files:**
- Create: `src/components/Landing.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: `Landing.tsx`**

Props: `onTry: () => void`

Content per spec: headline, 3 bullets, primary button “Yes, let me try it”, optional “See how it works” anchor to `#how-it-works` section with 3 steps.

- [ ] **Step 2: Wire `App.tsx` view state**

```tsx
type View = 'landing' | 'wizard' | 'results'
// useState<View>('landing')
// landing -> setView('wizard') on CTA
```

- [ ] **Step 3: Manual check**

Run `npm run dev`, click CTA → wizard visible.

---

### Task 6: Wizard (steps 1–3)

**Files:**
- Create: `src/components/Wizard.tsx`, `src/components/AgentPicker.tsx`
- Test: `tests/Wizard.test.tsx`

- [ ] **Step 1: Test — cannot submit empty**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Wizard } from '../src/components/Wizard'

describe('Wizard', () => {
  it('disables generate until fields and agent filled', () => {
    const onComplete = vi.fn()
    render(<Wizard onComplete={onComplete} />)
    expect(screen.getByRole('button', { name: /make my plan/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Implement wizard as 3 visible steps in one column**

- Step indicators: “1. Your business” / “2. Your customer” / “3. Your style”
- `AgentPicker` uses `role="radiogroup"` and cards with `role="radio"`
- Submit button label: **“Make my plan”**
- `onComplete(input: WizardInput)` called only when valid

- [ ] **Step 3: Run test — PASS**

---

### Task 7: Generate API

**Files:**
- Create: `api/generate.ts`, `vercel.json`

- [ ] **Step 1: `vercel.json`**

```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }]
}
```

- [ ] **Step 2: Implement handler**

Use OpenAI `gpt-4o-mini` (or latest small model) with `response_format: { type: 'json_object' }`.

System prompt summary:
- You are an outreach coach for small businesses
- Input: business, ideal customer, agent tone
- Output JSON matching `OutreachPlan` schema
- ICP example is fictional; never claim you scraped real people
- Agent tone rules per `agentId`
- Drip days: Day 1, Day 4, Day 8

Validate response with Zod schema before returning.

```bash
npm install zod openai
```

- [ ] **Step 3: Local test with curl** (requires `OPENAI_API_KEY` in `.env`)

```bash
curl -X POST http://localhost:5173/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"business\":\"dog walking\",\"idealCustomer\":\"busy professionals in Austin\",\"agentId\":\"warm\"}"
```

For local Vercel: `npx vercel dev` or proxy in `vite.config.ts` during dev:

```ts
server: {
  proxy: { '/api': 'http://localhost:3000' },
},
```

- [ ] **Step 4: Client fetch in wizard completion**

`src/lib/api.ts`:

```ts
export async function generatePlan(input: WizardInput): Promise<OutreachPlan> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Generate failed')
  return res.json()
}
```

---

### Task 8: Loading + results UI

**Files:**
- Create: `LoadingState.tsx`, `IcpCard.tsx`, `EmailBlock.tsx`, `CopyButton.tsx`, `Playbook.tsx`

- [ ] **Step 1: `LoadingState`**

Rotating messages every 3s, `aria-live="polite"`.

- [ ] **Step 2: `IcpCard`**

Shows example person + disclaimer text per spec.

- [ ] **Step 3: `EmailBlock` + `CopyButton`**

Uses `navigator.clipboard.writeText`, toast “Copied!”

- [ ] **Step 4: `Playbook`**

Sections: preview (ICP + sample), traits, find tips, drip list, Copy all.

- [ ] **Step 5: `App.tsx` results flow**

On wizard complete → `setView('loading')` → `generatePlan` → `savePlanToSession` → `setView('results')`.

On error → show retry, keep wizard input in parent state.

- [ ] **Step 6: `beforeunload` warning**

If `loadPlanFromSession()` and not authenticated, warn user.

---

### Task 9: Save bar + Supabase auth

**Files:**
- Create: `src/lib/supabase.ts`, `src/components/SaveBar.tsx`, `src/components/AuthModal.tsx`, `api/save-plan.ts`

- [ ] **Step 1: Supabase client (browser)**

```ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 2: SQL migration (run in Supabase dashboard)**

```sql
create table plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  business text not null,
  ideal_customer text not null,
  agent_id text not null,
  plan_json jsonb not null,
  created_at timestamptz default now()
);
alter table plans enable row level security;
create policy "own plans" on plans for all using (auth.uid() = user_id);
```

- [ ] **Step 3: `AuthModal`**

Email/password sign up + sign in tabs; Google OAuth button if provider enabled.

- [ ] **Step 4: `SaveBar`**

Sticky bottom: “Sign up to save this plan” → opens modal → on success calls `save-plan` API with JWT.

- [ ] **Step 5: `api/save-plan.ts`**

Verify Supabase JWT, insert row into `plans`.

---

### Task 10: Dashboard (saved plans)

**Files:**
- Create: `src/pages/Dashboard.tsx`
- Modify: `src/App.tsx` — add route `/dashboard`

- [ ] **Step 1: Protected route**

Redirect to landing if no session.

- [ ] **Step 2: List plans**

Query `plans` ordered by `created_at desc`, click opens read-only playbook view.

---

### Task 11: Deploy

- [ ] **Step 1: Push to GitHub**

- [ ] **Step 2: Import to Vercel, set env vars**

- [ ] **Step 3: Smoke test production**

Landing → try → complete wizard < 5 min, copy works, signup saves plan.

---

## Testing checklist (manual)

- [ ] Landing CTA enters wizard
- [ ] Cannot proceed without both text fields + agent
- [ ] Preview shows ICP disclaimer
- [ ] All copy buttons work
- [ ] Refresh loses plan (guest) — warning shown
- [ ] Signup restores plan to DB and `/dashboard` lists it
- [ ] Mobile width 375px readable without horizontal scroll

## Estimated build time

~6–8 hours for MVP with Supabase + Vercel configured.
