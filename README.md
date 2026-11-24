# Amaanity Studio — Portolio 2.0

Live website: **https://amaanity.com/**, hosted on Hostinger.

## Build

Use Node.js 24.12 or newer (required by the Firebase dependencies):

```sh
npm ci
npm run lint
npm run build
```

The frontend is static: upload the **contents of `dist/`** into `domains/amaanity.com/public_html`. No Node server or Gemini API key is required. The latest upstream update connects the public content and `/admin` CMS to the Firebase project already configured in `firebase-applet-config.json`; the public page falls back to bundled content if the CMS is unavailable. Firebase rules, authorised sign-in domains and admin-account access are managed in Firebase separately. The enquiry form prepares an email brief; the visitor sends it through their email application.

Include the generated `.htaccess`, `robots.txt`, `sitemap.xml` and `404.html`. The routing file serves `/admin`, preserves HTTPS/non-www redirects and redirects the previous portfolio's contact, about, work, services and project URLs to the corresponding new sections. DNS, domain verification and email hosting are managed separately and were retained.

`public/assets/aistudio/Creative_Lab_-_Uncode_68899072.html` is an unused design reference and is excluded from the production deployment package. Runtime images, including other assets in that directory, are included.

After uploading, extract into the web root, move the archive outside `public_html`, and clear Hostinger's cache. GitHub pushes do not automatically deploy to Hostinger.

## Deployment verification — 24 November 2026

- Production build and TypeScript check passed.
- All directly referenced artwork paths exist.
- Desktop, 390px mobile, theme switching, project viewer and enquiry-modal checks completed.
- Live homepage and main bundled assets were checked against the production build.
- Old portfolio routes returned 301 redirects to the new sections.
- The previous production site was backed up as a separate rollback ZIP before replacement.

The esbuild dependency was aligned with Vite 8's supported peer range. Device light/dark preference and the existing confirmed business/contact structured data were retained during deployment.
