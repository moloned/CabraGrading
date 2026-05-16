# Deploy to GitHub Pages

This project is a client-side React + Vite app, so it can be deployed to GitHub Pages.

## 1) Configure Vite base path

Update `vite.config.js` so the app resolves assets under your repository path:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/CabraGrading/',
})
```

If your repository name is different, replace `/CabraGrading/` with `/<your-repo-name>/`.

## 2) Add deploy dependency

Install `gh-pages` as a dev dependency:

```bash
npm install --save-dev gh-pages
```

## 3) Add deploy script

In `package.json`, add this script:

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

Keep your existing scripts and only add `deploy`.

## 4) Deploy

Run:

```bash
npm run deploy
```

This publishes the built `dist` folder to the `gh-pages` branch.

## 5) Enable GitHub Pages

In your GitHub repository:

1. Open Settings
2. Open Pages
3. Set Source to "Deploy from a branch"
4. Select branch `gh-pages` and folder `/ (root)`
5. Save

Your site URL will be:

`https://<your-username>.github.io/<your-repo-name>/`

## Notes

- Because this app is static, no server is required.
- Live syllabus fetching from the public Google Sheet gviz endpoint should continue to work on GitHub Pages.
- After changing the app, run `npm run deploy` again to publish updates.
