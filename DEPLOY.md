# Deploy to GitHub Pages (GitHub Actions)

This project is deployed with a GitHub Actions workflow in `.github/workflows/deploy-pages.yml`.

## 1) Keep Vite base path set to repository name

`vite.config.js` must point to the repo path so assets resolve on Pages:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/CabraGrading/',
})
```

If the repository name changes, update `base` to `/<your-repo-name>/`.

## 2) One-time GitHub Pages setting

In the GitHub repository:

1. Open Settings
2. Open Pages
3. Under Source, select `GitHub Actions`
4. Save

This is the only manual setup needed.

## 3) Deploy

Every push to `main` now deploys automatically.

You can also trigger deployment manually from:

1. GitHub -> Actions
2. Open `Deploy to GitHub Pages`
3. Click `Run workflow`

## Notes

- The workflow builds the app with `npm ci` and `npm run build`, then deploys `dist` via `actions/deploy-pages`.
- No `gh-pages` branch configuration is required in repo settings when using the workflow.
- Site URL format remains: `https://<your-username>.github.io/<your-repo-name>/`.

## Root Landing Page (username.github.io)

To control `https://moloned.github.io/` directly, use the separate repository named `moloned.github.io`.

A ready-made landing page template is included in this repo:

- `user-site-template/index.html`
- `user-site-template/README.md`

That template includes a link to `https://moloned.github.io/CabraGrading/`.
