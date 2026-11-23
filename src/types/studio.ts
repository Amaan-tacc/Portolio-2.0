export type NicheId =
  | 'brand-identity'
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
