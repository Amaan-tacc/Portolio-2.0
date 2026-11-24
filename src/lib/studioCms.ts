import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  CASE_STUDIES,
  DEFAULT_SITE_CONTENT,
  NICHE_TABS,
} from '../data/studioData';
import {
  CaseStudy,
  NicheId,
  SiteContentBundle,
} from '../types/studio';
import {
  ADMIN_EMAILS,
  db,
  handleFirestoreError,
  OperationType,
} from './firebase';

const VALID_NICHES: NicheId[] = [
  'brand-identity',
  'ui-ux',
  'books-educational',
  'print-packaging',
  'game-assets',
  'illustration',
];

export function sanitizeId(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  return cleaned || `project-${Date.now()}`;
}

export function sanitizeUrlOrAsset(raw: string, fallback = ''): string {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('/')) return trimmed.slice(0, 1000);
  if (trimmed.startsWith('data:image/')) {
    return trimmed.length <= 120000 ? trimmed : fallback;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed.slice(0, 2000);
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export function getNicheLabelForId(niche: NicheId): string {
  const map: Record<NicheId, string> = {
    'brand-identity': 'Brand Identity',
    'ui-ux': 'UI/UX Design',
    'books-educational': 'Books & Educational',
    'print-packaging': 'Print & Packaging',
    'game-assets': 'Game Art & Assets',
    illustration: 'Illustration',
  };
  return map[niche] ?? NICHE_TABS.find((t) => t.id === niche)?.label ?? 'Design';
}

export function normalizeProjectPayload(project: CaseStudy) {
  const id = sanitizeId(project.id || project.title);
  const niche: NicheId = VALID_NICHES.includes(project.niche)
    ? project.niche
    : 'brand-identity';
  const heroImage = sanitizeUrlOrAsset(
    project.heroImage,
    '/assets/amaanity/work/westvue.webp'
  );
  const rawGallery = (project.galleryImages || [])
    .map((url) => sanitizeUrlOrAsset(url))
    .filter(Boolean)
    .slice(0, 12);
  const galleryImages = rawGallery.length > 0 ? rawGallery : [heroImage];
  const rawDeliverables = (project.deliverables || [])
    .map((d) => d.trim().slice(0, 140))
    .filter(Boolean)
    .slice(0, 12);
  const deliverables =
    rawDeliverables.length > 0 ? rawDeliverables : ['Production files'];
  const rawSpecs = (project.specs || [])
    .map((s) => s.trim().slice(0, 48))
    .filter(Boolean)
    .slice(0, 10);
  const specs = rawSpecs.length > 0 ? rawSpecs : [getNicheLabelForId(niche)];
  const accentHex = /^#[0-9a-fA-F]{3,8}$/.test(project.accentHex.trim())
    ? project.accentHex.trim()
    : '#F8B033';

  return {
    id,
    indexNumber: (project.indexNumber || '01').trim().slice(0, 16) || '01',
    sortOrder: Math.max(0, Math.min(10000, Number(project.sortOrder ?? 99) || 0)),
    title: (project.title || 'Untitled Project').trim().slice(0, 160),
    client: (project.client || 'Studio Client').trim().slice(0, 160),
    niche,
    nicheLabel:
      (project.nicheLabel || getNicheLabelForId(niche)).trim().slice(0, 80) ||
      getNicheLabelForId(niche),
    roleTag: (project.roleTag || 'Design Direction').trim().slice(0, 120),
    summary: (project.summary || 'Custom design engagement.').trim().slice(0, 600),
    challenge: (project.challenge || 'Defined client design challenge.').trim().slice(0, 1200),
    solution: (project.solution || 'Delivered cohesive visual system.').trim().slice(0, 1200),
    outcomeMetric: (project.outcomeMetric || 'Shipped on schedule').trim().slice(0, 200),
    outcomeContext: (project.outcomeContext || 'Production-ready source files.').trim().slice(0, 400),
    deliverables,
    accentHex,
    heroImage,
    galleryImages,
    specs,
  };
}

export function normalizeSiteContentBundle(
  input: Partial<SiteContentBundle>
): SiteContentBundle {
  return {
    brand: {
      ...DEFAULT_SITE_CONTENT.brand,
      ...(input.brand || {}),
      introVideoUrl: sanitizeUrlOrAsset(input.brand?.introVideoUrl || '', ''),
      logoPositive: sanitizeUrlOrAsset(
        input.brand?.logoPositive || '',
        DEFAULT_SITE_CONTENT.brand.logoPositive
      ),
      logoNegative: sanitizeUrlOrAsset(
        input.brand?.logoNegative || '',
        DEFAULT_SITE_CONTENT.brand.logoNegative
      ),
      founderAvatar: sanitizeUrlOrAsset(
        input.brand?.founderAvatar || '',
        DEFAULT_SITE_CONTENT.brand.founderAvatar
      ),
      instagramUrl: sanitizeUrlOrAsset(
        input.brand?.instagramUrl || '',
        DEFAULT_SITE_CONTENT.brand.instagramUrl
      ),
      linkedinUrl: sanitizeUrlOrAsset(
        input.brand?.linkedinUrl || '',
        DEFAULT_SITE_CONTENT.brand.linkedinUrl
      ),
    },
    copy: {
      ...DEFAULT_SITE_CONTENT.copy,
      ...(input.copy || {}),
    },
    metrics:
      Array.isArray(input.metrics) && input.metrics.length > 0
        ? input.metrics.slice(0, 8)
        : DEFAULT_SITE_CONTENT.metrics,
    sectors:
      Array.isArray(input.sectors) && input.sectors.length > 0
        ? input.sectors.map((s) => String(s).trim()).filter(Boolean).slice(0, 24)
        : DEFAULT_SITE_CONTENT.sectors,
    services:
      Array.isArray(input.services) && input.services.length > 0
        ? input.services.slice(0, 12)
        : DEFAULT_SITE_CONTENT.services,
    processSteps:
      Array.isArray(input.processSteps) && input.processSteps.length > 0
        ? input.processSteps.slice(0, 8)
        : DEFAULT_SITE_CONTENT.processSteps,
    testimonials: Array.isArray(input.testimonials)
      ? input.testimonials.slice(0, 12)
      : DEFAULT_SITE_CONTENT.testimonials,
    reelGallery: Array.isArray(input.reelGallery)
      ? input.reelGallery.slice(0, 20)
      : DEFAULT_SITE_CONTENT.reelGallery,
  };
}

export async function checkIsAdminUser(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  const email = (user.email || '').toLowerCase();
  if (ADMIN_EMAILS.includes(email)) return true;

  const adminDocPath = `admins/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists() && snap.data()?.role === 'admin';
  } catch {
    return false;
  }
}

export function subscribeToSiteContent(
  onUpdate: (content: SiteContentBundle, existsInDb: boolean) => void
): () => void {
  const path = 'site_content/main';
  return onSnapshot(
    doc(db, 'site_content', 'main'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<SiteContentBundle>;
        onUpdate(normalizeSiteContentBundle(data), true);
      } else {
        onUpdate(DEFAULT_SITE_CONTENT, false);
      }
    },
    (error) => {
      console.warn(`Site content listener fallback (${path}):`, error.message);
      onUpdate(DEFAULT_SITE_CONTENT, false);
    }
  );
}

export function subscribeToProjects(
  onUpdate: (projects: CaseStudy[], existsInDb: boolean) => void
): () => void {
  const q = query(collection(db, 'projects'), orderBy('sortOrder', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(CASE_STUDIES, false);
        return;
      }
      const items = snapshot.docs.map((d) => {
        const data = d.data() as CaseStudy;
        return {
          ...data,
          id: d.id,
        };
      });
      items.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
      onUpdate(items, true);
    },
    (error) => {
      console.warn('Projects listener fallback:', error.message);
      onUpdate(CASE_STUDIES, false);
    }
  );
}

export async function saveSiteContent(
  bundle: SiteContentBundle,
  uid: string
): Promise<void> {
  const path = 'site_content/main';
  const normalized = normalizeSiteContentBundle(bundle);
  try {
    await setDoc(doc(db, 'site_content', 'main'), {
      ...normalized,
      updatedBy: sanitizeId(uid),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveProject(project: CaseStudy): Promise<CaseStudy> {
  const normalized = normalizeProjectPayload(project);
  const path = `projects/${normalized.id}`;
  try {
    await setDoc(doc(db, 'projects', normalized.id), {
      ...normalized,
      updatedAt: serverTimestamp(),
    });
    return normalized;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  const safeId = sanitizeId(projectId);
  const path = `projects/${safeId}`;
  try {
    await deleteDoc(doc(db, 'projects', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedDefaultsToFirestore(uid: string): Promise<void> {
  const existingProjects = await getDocs(collection(db, 'projects')).catch(() => null);
  const existingSiteDoc = await getDoc(doc(db, 'site_content', 'main')).catch(() => null);

  if (!existingSiteDoc || !existingSiteDoc.exists()) {
    await saveSiteContent(DEFAULT_SITE_CONTENT, uid);
  }

  if (!existingProjects || existingProjects.empty) {
    await Promise.all(CASE_STUDIES.map((study) => saveProject(study)));
  }
}

export async function forceRestoreAllDefaults(uid: string): Promise<void> {
  await saveSiteContent(DEFAULT_SITE_CONTENT, uid);
  const currentDocs = await getDocs(collection(db, 'projects')).catch((err) =>
    handleFirestoreError(err, OperationType.LIST, 'projects')
  );
  const defaultIds = new Set(CASE_STUDIES.map((s) => s.id));
  await Promise.all([
    ...currentDocs.docs
      .filter((d) => !defaultIds.has(d.id))
      .map((d) => deleteProject(d.id)),
    ...CASE_STUDIES.map((study) => saveProject(study)),
  ]);
}

export async function compressImageFileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxDim = 920;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.max(1, Math.round(bitmap.width * scale));
  const targetH = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  for (const quality of [0.82, 0.7, 0.56, 0.42]) {
    const dataUrl = canvas.toDataURL('image/webp', quality);
    if (dataUrl.length <= 115000) {
      return dataUrl;
    }
  }
  const fallbackUrl = canvas.toDataURL('image/jpeg', 0.45);
  if (fallbackUrl.length > 118000) {
    throw new Error('Image is still too large after compression. Please use a hosted URL or smaller image.');
  }
  return fallbackUrl;
}
