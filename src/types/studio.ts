export type NicheId =
  | 'brand-identity'
  | 'ui-ux'
  | 'books-educational'
  | 'print-packaging'
  | 'game-assets'
  | 'illustration';

export interface NicheTab {
  id: 'all' | NicheId;
  label: string;
}

export interface StudioMetric {
  id: string;
  targetNumber: number;
  suffix: string;
  label: string;
  detail: string;
  bgHex: string;
  offsetClass: string;
}

export interface CaseStudy {
  id: string;
  indexNumber: string;
  sortOrder?: number;
  title: string;
  client: string;
  niche: NicheId;
  nicheLabel: string;
  roleTag: string;
  summary: string;
  challenge: string;
  solution: string;
  outcomeMetric: string;
  outcomeContext: string;
  deliverables: string[];
  accentHex: string;
  heroImage: string;
  galleryImages: string[];
  specs: string[];
}

export interface ServiceDiscipline {
  number: string;
  id: NicheId;
  title: string;
  tagline: string;
  idealFor: string;
  turnaround: string;
  deliverables: string[];
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
  handoffNote: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  organization: string;
  scope: string;
}

export interface ReelVisualItem {
  id: string;
  title: string;
  nicheLabel: string;
  image: string;
  caseStudyId: string;
}

export interface StudioBrandConfig {
  name: string;
  fullName: string;
  domain: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  whatsappUrl: string;
  location: string;
  founderName: string;
  founderRole: string;
  instagramUrl: string;
  linkedinUrl: string;
  logoPositive: string;
  logoNegative: string;
  founderAvatar: string;
  introVideoUrl: string;
}

export interface SiteCopyConfig {
  heroEyebrow: string;
  heroHeadingMain: string;
  heroHeadingHighlight: string;
  heroHeadingHighlightRoll: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroScrollLabel: string;
  videoBadgeLabel: string;
  videoEyebrow: string;
  videoHeadline: string;
  videoCtaLabel: string;
  manifestoText: string;
  workEyebrow: string;
  workHeading: string;
  reelEyebrow: string;
  reelHeading: string;
  reelSubtext: string;
  specialtiesEyebrow: string;
  specialtiesHeading: string;
  specialtiesSubtitle: string;
  aboutEyebrow: string;
  aboutHeading: string;
  aboutBody: string;
  aboutFocusLabel: string;
  aboutFocusText: string;
  processEyebrow: string;
  processHeading: string;
  reviewsEyebrow: string;
  reviewsHeading: string;
  footerEyebrow: string;
  footerCtaPhrase: string;
  footerCtaPhraseRoll: string;
  footerSubtitle: string;
  footerTagline: string;
}

export interface SiteContentBundle {
  brand: StudioBrandConfig;
  copy: SiteCopyConfig;
  metrics: StudioMetric[];
  sectors: string[];
  services: ServiceDiscipline[];
  processSteps: ProcessStep[];
  testimonials: Testimonial[];
  reelGallery: ReelVisualItem[];
}

export interface ProjectBriefForm {
  name: string;
  email: string;
  organization: string;
  niches: NicheId[];
  timeline: string;
  budget: string;
  customBudget: string;
  details: string;
}
