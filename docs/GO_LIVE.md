# Go live checklist (end to end test)

## 1. GitHub (`nio_agent`)

Repo: https://github.com/afrogoespro/nio_agent

From your project folder, push code (one time):

```powershell
cd C:\Users\Brandon\Projects\outreach-app
git remote set-url origin https://github.com/afrogoespro/nio_agent.git
git push -u origin main
```

## 2. Live URL (use this one)

**Production:** https://outreach-app-mu.vercel.app

Older test URLs (`nio`, `nio-fresh`, preview links) may be outdated or password protected. Bookmark the URL above.

After deploy, hard refresh: `Ctrl + Shift + R`.

## 3. Vercel env vars (Resend + Apollo)

In Vercel → **outreach-app** project → Settings → Environment Variables → check **Production**:

| Name | Required for |
|------|----------------|
| `RESEND_API_KEY` | Test email on Launch |
| `RESEND_FROM_EMAIL` | Test email sender |
| `APOLLO_API_KEY` | **Real leads** on your plan (without this you get the example person) |

Then **Deployments** → … on latest → **Redeploy** (required after adding or changing keys).

Check: open `https://outreach-app-mu.vercel.app/api/integration-status` — should show `"apolloServer": true`.

## 4. Connect Vercel to GitHub (recommended)

Vercel → Project → Settings → Git → Connect **afrogoespro/nio_agent**

- Framework: Vite
- Build: `npm run build`
- Output: `dist`

Every `git push` will update the live site.

## 5. What a tester should do (~5 min)

1. Open your Vercel URL
2. **Ok, let's try it**
3. Fill About you + locations
4. Fill Target & why
5. Pick a rep → **Build my plan**
6. Click through plan slides (← →)
7. **Launch** → Connect email → **Send test email**
8. Check inbox for the test message

Copy emails still works without Resend.

## 6. Apollo troubleshooting

If the lead card says **Example** or you see **Jordan Lee**:

1. Confirm `APOLLO_API_KEY` is set for **Production** (not only Preview).
2. Redeploy after saving the key.
3. On the live site: **Start over** → build a new plan.
4. Read the yellow alert on the plan page for the exact reason.
