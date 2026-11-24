# Amaanity Studio — Portolio 2.0

Live website: **https://amaanity.com/**, hosted on Hostinger.

## Build

Use Node.js 24.12 or newer (required by the Firebase dependencies):

```sh
npm ci
npm run lint
npm run build
```

The frontend is static: upload the **contents of `dist/`** into `domains/amaanity.com/public_html`. No Node server or Gemini API key is required. The latest upstream update connects the public content and `/admin` CMS to the Firebase project already configured in `firebase-applet-config.json`; the public page falls back to bundled content if the CMS is unavailable. Firebase rules, authorised sign-in domains and admin-account access are managed in Firebase separately. The enquiry form previews the brief and submits JSON to `/api/brief.php` on Hostinger PHP hosting. The endpoint sends to the fixed studio address `amaan@amaanity.com`, validates input, restricts origins and rate-limits submissions. It requires PHP 8.1+ and working PHP mail transport. A successful response means the hosting mail system accepted the message; inbox delivery still depends on mail filtering. Static previews cannot execute this endpoint.

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

## Contact and mobile update

- Public GitHub links replaced with LinkedIn; About includes email, Instagram, LinkedIn, YouTube and WhatsApp.
- Archive uses native horizontal overflow for touch, mouse dragging, arrow buttons and keyboard navigation. Decorative duplicated images/competing translations were removed.
- Initial JS split from Firebase CMS and the admin editor. Mobile uses native vertical scrolling; costly backdrop filters and per-card animated blur were reduced.
- `hafizamaan18@gmail.com` is included in both the frontend admin allowlist and `firestore.rules`. The project owner must publish the updated rules in Firebase for database writes to be authorized. Updating Hostinger alone does not publish Firestore rules.

## Firebase owner setup

1. Sign into https://console.firebase.google.com/ using the account that owns project `juicy-arcade-9bpf3`.
2. In Authentication > Sign-in method, enable Google and choose your support email. In Authentication > Settings > Authorized domains, add `amaanity.com` (without https or a path).
3. This site connects to the existing named Firestore database `ai-studio-amaanitystudio-1c48d484-8409-4e0c-a349-cf1cb06ef97b`, not `(default)`. Preserve its current data. The checked-in `firebase.json` targets only this database.
4. To publish the repository rules, pull this repository, open a terminal in its root, and run:

```sh
npx firebase-tools login --reauth
npx firebase-tools deploy --only firestore:ai-studio-amaanitystudio-1c48d484-8409-4e0c-a349-cf1cb06ef97b --project juicy-arcade-9bpf3
```

During login, choose the project owner account. Review `firestore.rules` before publishing. No service-account key is needed. Only the selected database's rules are deployed; the website remains on Hostinger.

5. Open https://amaanity.com/admin and sign in as `hafizamaan18@gmail.com`. This email is already allowed in both the frontend and the checked-in rules. First authorized sign-in seeds bundled content only when the corresponding documents/collections are missing. Check an edit and reload to verify persistence.

Project UI update: restored the original overlap blur, mobile glass/grain and scrolling effects. Expanded project, brief and showreel panels bypass the background Lenis handler and scroll independently.
