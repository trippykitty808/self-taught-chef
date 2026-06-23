# The Self-Taught Chef Program — Web App

This folder is a complete, self-contained web app (a PWA). Open `index.html` in any
browser to use it locally, or put it online with a free link to share with a friend.

It works on phones and laptops, tracks each person's progress on their own device,
embeds every module's slide deck as a PDF, and lets anyone download the PDFs and
PowerPoint files to keep.

---

## Option A — Just try it now (no internet needed)

Double-click `index.html`. It opens in your browser and works.

> Note: when opened directly from your hard drive (a `file://` address), the offline
> "install as an app" feature and some PDF embedding may be limited. To get the full
> experience — and to share it — put it online with Option B.

---

## Option B — Put it online free with GitHub Pages (recommended)

You said you have a GitHub account. This is a one-time setup of about 30–45 minutes,
and it's all done in the browser — no command line required.

1. **Create a new repository**
   - Go to https://github.com/new
   - Repository name: `chef-course` (or anything you like)
   - Set it to **Public**, then click **Create repository**.

2. **Upload these files**
   - On the new repo page, click **uploading an existing file** (or Add file → Upload files).
   - Drag in **everything inside this folder** — `index.html`, `app.css`, `app.js`,
     `data.js`, `manifest.webmanifest`, `sw.js`, the `.nojekyll` file, and the `icons`
     and `assets` folders. Keep the folder structure.
   - Scroll down and click **Commit changes**.

3. **Turn on GitHub Pages**
   - In the repo, go to **Settings → Pages**.
   - Under "Build and deployment", set **Source** to **Deploy from a branch**.
   - Branch: **main**, folder: **/ (root)**. Click **Save**.

4. **Get your link**
   - Wait ~1 minute, then refresh the Settings → Pages screen.
   - Your live link appears, like: `https://YOURUSERNAME.github.io/chef-course/`
   - Send that link to your friend. They can open it and tap **Add to Home Screen**
     to install it like an app.

To update later: go to the repo, click **Add file → Upload files**, drag in the new
versions, and commit. The site refreshes automatically.

---

## Good to know

- **Progress is per-device.** Each person's checkmarks are saved in their own browser.
  You can't see your friend's progress, and progress doesn't sync between someone's
  phone and laptop. (Adding accounts/sync would require a backend — a later upgrade.)
- **The site is public.** Anyone with the link can open it. That's fine for a course,
  but it isn't private.
- **The `.nojekyll` file matters** — leave it in. It tells GitHub Pages to serve all
  files and folders as-is.
- **Other free hosts** work too (Netlify, Vercel, Cloudflare Pages) if you ever prefer
  them — you'd drag this same folder in.

Enjoy, and happy cooking.
