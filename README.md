# Neo

Natural Intelligent Outreach (NIO) — your Neo Rep finds who to email, writes messages, and maps follow-ups. Tell us about you, who to target, get a plan, launch.

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel

```bash
npm run build
npx vercel deploy -y
```

Or connect this repo at [vercel.com](https://vercel.com). Framework: Vite. Output: `dist`.

### Environment variables (Vercel dashboard)

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Send test emails from Launch |
| `RESEND_FROM_EMAIL` | Verified sender in Resend |
| `APOLLO_API_KEY` | Optional server wide Apollo key |

Users can also paste their own Apollo key on the Launch page (stored in session only).

## Flow

1. **Try it** — landing CTA
2. **About you** — business + what makes you different (~1–2 min)
3. **Target & why** — ideal customer + why them
4. **Pick your rep** — one of five agents
5. **Your plan** — leads, emails, follow-ups
6. **Launch** — checklist + copy emails
