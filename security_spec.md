# Security Specification — Amaanity Studio CMS

## 1. Data Invariants
1. **Public Read / Admin-Only Write Separation**: Public visitors can read portfolio projects (`/projects/{projectId}`) and the main studio CMS document (`/site_content/main`), while all creates, updates, and deletes require a verified Firebase Admin (`email_verified == true` and bootstrapped studio email or `/admins/{uid}`).
2. **Strict Schema & Key Whitelisting**: Every document write must satisfy `keys().hasAll(...)` and `keys().hasOnly(...)` on create, and `diff().affectedKeys().hasOnly(...)` on update so arbitrary shadow fields (`isAdmin`, `role`, `ghost`) are always rejected.
3. **Boundary Limits & ID Hygiene**: Document IDs must match `^[a-zA-Z0-9_-]+$` (`<= 128` chars), every string enforces explicit `.size()` bounds, and every array (`deliverables`, `galleryImages`, `specs`, `metrics`, `sectors`, `services`, `processSteps`, `testimonials`, `reelGallery`) is strictly size-capped and index-type-checked.
4. **Temporal & Identity Integrity**: All `updatedAt` and `createdAt` fields must equal `request.time`, `updatedBy` must equal `request.auth.uid`, and project `id` is immutable on update.
5. **Admin Isolation**: Non-admin users cannot list `/admins`, `/site_content`, or escalate privileges by writing `/admins/{uid}`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. Unauthenticated create on `/projects/p1` -> `PERMISSION_DENIED`.
2. Signed-in non-admin user updating `/site_content/main` -> `PERMISSION_DENIED`.
3. Spoofed admin email with `email_verified: false` attempting project write -> `PERMISSION_DENIED`.
4. Shadow field injection (`{ ...validProject, isVerified: true }`) -> `PERMISSION_DENIED`.
5. Oversized project ID (`"a".repeat(200)`) or path-breaking characters (`"../evil"`) -> `PERMISSION_DENIED`.
6. Client-forged `updatedAt` timestamp (`new Date(0)`) instead of server timestamp -> `PERMISSION_DENIED`.
7. Identity spoofing (`updatedBy: "other-uid"`) on `/site_content/main` -> `PERMISSION_DENIED`.
8. Invalid niche category enum (`niche: "crypto-scam"`) on `/projects` -> `PERMISSION_DENIED`.
9. Unbounded array injection (`specs` length > 10 or non-string first element) -> `PERMISSION_DENIED`.
10. Immutable `id` mutation during project update -> `PERMISSION_DENIED`.
11. Self-promotion attempt by non-admin writing `/admins/{ownUid}` -> `PERMISSION_DENIED`.
12. Wrong document ID on `/site_content/rogue` or listing `/admins` -> `PERMISSION_DENIED`.
