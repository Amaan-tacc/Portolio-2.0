# Amaanity Studio — Portolio 2.0

Live website: **https://amaanity.com/**, hosted on Hostinger.

## Build

Use Node.js 22.21 or newer:

```sh
npm ci
npm run lint
npm run build
```

The site is static: upload the **contents of `dist/`** into `domains/amaanity.com/public_html`. No Gemini API key, Node server, database or paid build service is required for the current application. The enquiry form prepares an email brief; the visitor sends it through their email application.

Include the generated `.htaccess`, `robots.txt`, `sitemap.xml` and `404.html`. The routing file preserves HTTPS/non-www redirects and redirects the previous portfolio's contact, about, work, services and project URLs to the corresponding new sections. DNS, domain verification and email hosting are managed separately and were retained.

`public/assets/aistudio/` contains an unused design reference, not a runtime dependency; it is excluded from the production deployment package. All referenced Amaanity artwork is included.

After uploading, extract into the web root, move the archive outside `public_html`, and clear Hostinger's cache. GitHub pushes do not automatically deploy to Hostinger.

## Deployment verification — 24 November 2026

- Production build and TypeScript check passed.
- All 36 directly referenced artwork paths exist.
- Desktop, 390px mobile, theme switching, project viewer and enquiry-modal checks completed.
- Live homepage and main bundled assets were checked against the production build.
- Old portfolio routes returned 301 redirects to the new sections.
- The previous production site was backed up as a separate rollback ZIP before replacement.

The esbuild dependency was aligned with Vite 8's supported peer range. Device light/dark preference and the existing confirmed business/contact structured data were retained during deployment.
