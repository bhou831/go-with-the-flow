# Deploy to Cloudflare Pages

City Match uses `output: 'export'` in `next.config.ts`, which generates a fully static site in `out/`. Cloudflare Pages serves it directly — no server, no edge functions needed.

---

## One-time setup (via dashboard)

### 1. Push your code to GitHub

If you haven't already:

```bash
git remote add origin https://github.com/YOUR_USERNAME/go-with-the-flow.git
git push -u origin main
```

### 2. Create a Cloudflare Pages project

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages**
2. Click **Connect to Git** and authorize Cloudflare to access your GitHub account
3. Select the `go-with-the-flow` repository → **Begin setup**

### 3. Configure build settings

| Field | Value |
|---|---|
| Framework preset | `None` (do **not** pick Next.js — that's for SSR mode) |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | *(leave blank)* |

### 4. Set Node.js version

Under **Environment variables**, add:

| Variable | Value |
|---|---|
| `NODE_VERSION` | `20` |

> Node 18+ is required for the Next.js build. Without this, Cloudflare may use an older default.

### 5. Deploy

Click **Save and Deploy**. Cloudflare will:
1. Clone your repo
2. Run `npm ci && npm run build`
3. Upload the contents of `out/` to its CDN

Your site will be live at `https://go-with-the-flow.pages.dev` (or similar) within ~1 minute.

---

## Subsequent deploys

Every push to `main` triggers an automatic redeploy. No action needed.

To deploy a preview branch, push to any non-main branch — Cloudflare creates a separate preview URL automatically.

---

## Custom domain (optional)

1. In your Pages project → **Custom domains** → **Set up a custom domain**
2. Enter your domain (e.g. `citymatch.xyz`)
3. Follow the DNS instructions (add a CNAME record pointing to `go-with-the-flow.pages.dev`)
4. Cloudflare provisions an SSL certificate automatically

If your domain is already on Cloudflare, the DNS record is added for you.

---

## Manual deploy (no GitHub)

If you prefer to deploy from your local machine without connecting GitHub:

```bash
# Install Wrangler (Cloudflare CLI) once
npm install -g wrangler

# Log in
wrangler login

# Build + deploy
npm run build
wrangler pages deploy out --project-name=go-with-the-flow
```

---

## Troubleshooting

**Build fails with "Cannot find module" or Node version error**
→ Make sure `NODE_VERSION=20` is set in environment variables.

**Images return 404**
→ Confirm `images: { unoptimized: true }` is set in `next.config.ts` (it is). Next.js image optimization requires a server; this disables it for static export.

**Blank page / hydration error**
→ Run `npm run build && npx serve out` locally first to confirm the static export works before deploying.

**Survey answers lost on refresh at `/results`**
→ This is expected behavior — answers are encoded in the URL (`?a=...`). Share the full URL to preserve results.
