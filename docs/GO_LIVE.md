# Go live checklist (end to end test)

## 1. GitHub (`nio_agent`)

Repo: https://github.com/afrogoespro/nio_agent

From your project folder, push code (one time):

```powershell
cd C:\Users\Brandon\Projects\outreach-app
git remote set-url origin https://github.com/afrogoespro/nio_agent.git
git push -u origin main
```

## 2. Vercel env vars (Resend)

In Vercel → Project → Settings → Environment Variables (Production):

| Name | Example |
|------|---------|
| `RESEND_API_KEY` | `re_...` from Resend dashboard |
| `RESEND_FROM_EMAIL` | A verified sender in Resend (e.g. `onboarding@resend.dev` for tests) |

Then **Deployments** → … on latest → **Redeploy** (required after adding keys).

## 3. Connect Vercel to GitHub (recommended)

Vercel → Project → Settings → Git → Connect **afrogoespro/nio_agent**

- Framework: Vite
- Build: `npm run build`
- Output: `dist`

Every `git push` will update the live site.

## 4. What a tester should do (~5 min)

1. Open your Vercel URL
2. **Ok, let's try it**
3. Fill About you + locations
4. Fill Target & why
5. Pick a rep → **Build my plan**
6. Click through plan slides (← →)
7. **Launch** → Connect email → **Send test email**
8. Check inbox for the test message

Copy emails still works without Resend.

## 5. Apollo (optional)

Add `APOLLO_API_KEY` in Vercel or paste key on Launch page.
