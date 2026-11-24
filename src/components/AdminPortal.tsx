import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  ArrowLeft,
  Check,
  Edit3,
  ExternalLink,
  FolderKanban,
  Globe,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Lock,
  LogOut,
  Moon,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  UserCheck,
  X,
} from 'lucide-react';
import {
  DEFAULT_SITE_CONTENT,
  NICHE_TABS,
  STUDIO_ASSET_LIBRARY,
} from '../data/studioData';
import { auth, googleProvider } from '../lib/firebase';
import {
  checkIsAdminUser,
  compressImageFileToDataUrl,
  deleteProject,
  forceRestoreAllDefaults,
  getNicheLabelForId,
  saveProject,
  saveSiteContent,
  sanitizeId,
  seedDefaultsToFirestore,
} from '../lib/studioCms';
import {
  CaseStudy,
  NicheId,
  ReelVisualItem,
  SiteContentBundle,
  Testimonial,
} from '../types/studio';

interface AdminPortalProps {
  isDark: boolean;
  onToggleDark: () => void;
  siteContent: SiteContentBundle;
  projects: CaseStudy[];
  onNavigateHome: () => void;
}

type AdminTab = 'projects' | 'hero' | 'metrics' | 'services' | 'about' | 'brand';

const ACCENT_PRESETS = ['#F8B033', '#429AD4', '#AED9E0', '#FFCBB0', '#DEAAFF', '#1C1D1E'];

const EMPTY_PROJECT = (niche: NicheId, nextIndex: number): CaseStudy => ({
  id: `project-${Date.now()}`,
  indexNumber: String(nextIndex).padStart(2, '0'),
  sortOrder: nextIndex,
  title: '',
  client: '',
  niche,
  nicheLabel: getNicheLabelForId(niche),
  roleTag: '',
  summary: '',
  challenge: '',
  solution: '',
  outcomeMetric: '',
  outcomeContext: '',
  deliverables: ['Source files', 'Production handoff'],
  accentHex: niche === 'ui-ux' ? '#429AD4' : '#F8B033',
  heroImage: STUDIO_ASSET_LIBRARY[0].url,
  galleryImages: [STUDIO_ASSET_LIBRARY[0].url],
  specs: [getNicheLabelForId(niche), 'Production Ready'],
});

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isDark,
  onToggleDark,
  siteContent,
  projects,
  onNavigateHome,
}) => {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [categoryFilter, setCategoryFilter] = useState<'all' | NicheId>('all');

  const [draftContent, setDraftContent] = useState<SiteContentBundle>(siteContent);
  const [dirtyContent, setDirtyContent] = useState(false);
  const [savingContent, setSavingContent] = useState(false);

  const [editingProject, setEditingProject] = useState<CaseStudy | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmRestoreDefaults, setConfirmRestoreDefaults] = useState(false);

  const [assetPickerTarget, setAssetPickerTarget] = useState<null | ((url: string) => void)>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const seededOnceRef = useRef(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    window.setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 3600);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const allowed = await checkIsAdminUser(nextUser);
        setIsAdmin(allowed);
        if (allowed && !seededOnceRef.current) {
          seededOnceRef.current = true;
          try {
            await seedDefaultsToFirestore(nextUser.uid);
          } catch (err) {
            console.warn('Auto-seed skipped or deferred:', err);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!dirtyContent) {
      setDraftContent(siteContent);
    }
  }, [siteContent, dirtyContent]);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to complete sign in.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setDirtyContent(false);
  };

  const updateDraft = (updater: (prev: SiteContentBundle) => SiteContentBundle) => {
    setDraftContent((prev) => updater(prev));
    setDirtyContent(true);
  };

  const handleSaveSiteContent = async () => {
    if (!user || !isAdmin) return;
    setSavingContent(true);
    try {
      await saveSiteContent(draftContent, user.uid);
      setDirtyContent(false);
      showToast('success', 'All site edits published live.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSavingContent(false);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!user || !isAdmin) return;
    setSavingContent(true);
    try {
      await forceRestoreAllDefaults(user.uid);
      setDraftContent(DEFAULT_SITE_CONTENT);
      setDirtyContent(false);
      setConfirmRestoreDefaults(false);
      showToast('success', 'Restored original Amaanity Studio defaults.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to restore defaults.');
    } finally {
      setSavingContent(false);
    }
  };

  const handleSaveProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !user || !isAdmin) return;
    if (!editingProject.title.trim()) {
      showToast('error', 'Please enter a project title.');
      return;
    }
    setSavingProject(true);
    try {
      const payload: CaseStudy = {
        ...editingProject,
        id: isNewProject
          ? sanitizeId(`${editingProject.title}-${Date.now().toString(36)}`)
          : editingProject.id,
        nicheLabel: editingProject.nicheLabel.trim() || getNicheLabelForId(editingProject.niche),
      };
      await saveProject(payload);
      setEditingProject(null);
      setIsNewProject(false);
      showToast('success', isNewProject ? 'New project added to portfolio.' : 'Project updated.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Could not save project.');
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user || !isAdmin) return;
    try {
      await deleteProject(projectId);
      setConfirmDeleteId(null);
      showToast('success', 'Project removed from portfolio.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Could not delete project.');
    }
  };

  const handleLocalImageUpload = async (
    file: File | undefined,
    onDone: (dataUrl: string) => void
  ) => {
    if (!file) return;
    try {
      const compressed = await compressImageFileToDataUrl(file);
      onDone(compressed);
      showToast('success', 'Image optimized and attached.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Image upload failed.');
    }
  };

  const filteredProjects = useMemo(() => {
    const sorted = [...projects].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
    if (categoryFilter === 'all') return sorted;
    return sorted.filter((p) => p.niche === categoryFilter);
  }, [projects, categoryFilter]);

  const inputClass =
    'w-full rounded-xl border border-black/12 dark:border-white/15 bg-white/75 dark:bg-white/[0.06] backdrop-blur-md px-3.5 py-2.5 text-sm text-[#1C1D1E] dark:text-white focus:outline-none focus:border-[#F8B033] transition-colors duration-300';
  const labelClass =
    'block text-[11px] font-bold uppercase tracking-wider text-[#68696A] dark:text-white/55 mb-1.5';

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center studio-canvas-bg text-[#1C1D1E] dark:text-white">
        <div className="rounded-3xl bg-white/70 dark:bg-[#1E2025]/80 backdrop-blur-2xl border border-black/10 dark:border-white/15 px-8 py-6 text-sm font-semibold shadow-xl">
          Verifying admin session...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 studio-canvas-bg text-[#1C1D1E] dark:text-white relative">
        <div
          aria-hidden="true"
          className="fixed inset-0 studio-dot-texture opacity-70 dark:opacity-80 pointer-events-none"
        />
        <div className="relative z-10 max-w-md w-full rounded-[28px] bg-white/78 dark:bg-[#1A1C21]/86 backdrop-blur-2xl border border-black/10 dark:border-white/14 ring-1 ring-inset ring-white/50 dark:ring-white/10 p-7 sm:p-9 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#429AD4]">
              <Lock className="w-3.5 h-3.5 text-[#F8B033]" />
              <span>Private Admin URL</span>
            </span>
            <button
              type="button"
              onClick={onToggleDark}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#F8B033]" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Amaanity Admin Studio
            </h1>
            <p className="mt-2 text-sm text-[#434445] dark:text-white/70 leading-relaxed">
              Sign in with the studio administrator Google account to manage portfolio categories, projects, and live website copy.
            </p>
          </div>

          {authError && (
            <div className="rounded-xl bg-red-500/12 border border-red-500/25 px-4 py-3 text-xs font-medium text-red-600 dark:text-red-300">
              {authError}
            </div>
          )}

          <button
            type="button"
            disabled={signingIn}
            onClick={handleGoogleSignIn}
            className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-[#1C1D1E] dark:bg-white text-white dark:text-[#1C1D1E] px-6 py-3.5 text-sm font-bold hover:bg-[#F8B033] dark:hover:bg-[#F8B033] hover:text-[#1C1D1E] transition-all duration-300 ease-out cursor-pointer shadow-lg disabled:opacity-60"
          >
            <UserCheck className="w-4 h-4" />
            <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#68696A] dark:text-white/55 hover:text-[#1C1D1E] dark:hover:text-white transition-colors duration-300 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 studio-canvas-bg text-[#1C1D1E] dark:text-white">
        <div className="max-w-md w-full rounded-[28px] bg-white/80 dark:bg-[#1A1C21]/88 backdrop-blur-2xl border border-black/10 dark:border-white/14 p-7 sm:p-9 shadow-2xl space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/12 text-red-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Unauthorized Account
            </h1>
            <p className="mt-2 text-sm text-[#434445] dark:text-white/70 leading-relaxed">
              Signed in as <strong className="text-[#1C1D1E] dark:text-white">{user.email}</strong>, which does not have admin permissions for Amaanity Studio.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-full bg-[#1C1D1E] dark:bg-white text-white dark:text-[#1C1D1E] px-5 py-3 text-sm font-bold hover:bg-[#F8B033] hover:text-[#1C1D1E] transition-colors duration-300 cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full rounded-full bg-black/[0.05] dark:bg-white/[0.08] px-5 py-2.5 text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/15 transition-colors duration-300 cursor-pointer"
            >
              Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'projects', label: `Projects (${projects.length})`, icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'hero', label: 'Hero & Headings', icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: 'metrics', label: 'Metrics & Ticker', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'services', label: 'Services & Process', icon: <Layers className="w-4 h-4" /> },
    { id: 'about', label: 'About, Reviews & Reel', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'brand', label: 'Brand & Footer', icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen studio-canvas-bg text-[#1C1D1E] dark:text-white pb-20 relative">
      <div
        aria-hidden="true"
        className="fixed inset-0 studio-dot-texture opacity-65 dark:opacity-75 pointer-events-none z-0"
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-2xl border flex items-center gap-2.5 ${
            toast.type === 'success'
              ? 'bg-[#1C1D1E]/92 dark:bg-white/95 text-white dark:text-[#1C1D1E] border-[#F8B033]/50'
              : 'bg-red-600/95 text-white border-red-400/50'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-[#F8B033]" />
          ) : (
            <ShieldAlert className="w-4 h-4" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Top Studio Bar */}
      <header className="sticky top-0 z-30 bg-white/76 dark:bg-[#16181D]/82 backdrop-blur-2xl border-b border-black/10 dark:border-white/12">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={isDark ? draftContent.brand.logoNegative : draftContent.brand.logoPositive}
              alt="Amaanity"
              className="h-6 sm:h-7 w-auto object-contain"
            />
            <span className="px-2.5 py-1 rounded-full bg-[#F8B033]/20 text-[#1C1D1E] dark:text-[#F8B033] text-[11px] font-bold uppercase tracking-wider">
              Admin CMS
            </span>
            <span className="hidden md:inline text-xs text-[#68696A] dark:text-white/55">
              {user.email}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {activeTab !== 'projects' && (
              <button
                type="button"
                disabled={savingContent || !dirtyContent}
                onClick={handleSaveSiteContent}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-300 ease-out cursor-pointer ${
                  dirtyContent
                    ? 'bg-[#F8B033] text-[#1C1D1E] hover:bg-[#1C1D1E] hover:text-white shadow-md'
                    : 'bg-black/[0.06] dark:bg-white/[0.08] text-[#68696A] dark:text-white/45 cursor-default'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingContent ? 'Saving...' : dirtyContent ? 'Publish Edits' : 'Saved'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/60 dark:bg-white/[0.08] border border-black/10 dark:border-white/14 px-3.5 py-2 text-xs font-semibold hover:bg-white dark:hover:bg-white/16 transition-all duration-300 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Live Site</span>
            </button>

            <button
              type="button"
              onClick={onToggleDark}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full bg-white/60 dark:bg-white/[0.08] border border-black/10 dark:border-white/14 flex items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#F8B033]" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] px-3.5 py-2 text-xs font-semibold hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-300 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 pb-3 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 ease-out cursor-pointer ${
                  active
                    ? 'bg-[#1C1D1E] dark:bg-white text-white dark:text-[#1C1D1E] shadow-sm'
                    : 'bg-white/55 dark:bg-white/[0.06] text-[#434445] dark:text-white/70 hover:bg-white/90 dark:hover:bg-white/14'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-8 pt-6 sm:pt-8 space-y-6">
        {/* TAB 1: PROJECTS MANAGER */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-[24px] bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 sm:p-6 shadow-sm">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                  Portfolio Projects by Category
                </h1>
                <p className="text-xs sm:text-sm text-[#68696A] dark:text-white/60 mt-1">
                  Add new projects to any specialty, reorder cards, swap gallery images, or update outcomes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const defaultNiche: NicheId =
                    categoryFilter === 'all' ? 'brand-identity' : categoryFilter;
                  setIsNewProject(true);
                  setEditingProject(EMPTY_PROJECT(defaultNiche, projects.length + 1));
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F8B033] text-[#1C1D1E] px-5 py-2.5 text-sm font-bold hover:bg-[#1C1D1E] hover:text-white dark:hover:bg-white dark:hover:text-[#1C1D1E] transition-all duration-300 ease-out cursor-pointer shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>
                  Add Project
                  {categoryFilter !== 'all'
                    ? ` to ${NICHE_TABS.find((t) => t.id === categoryFilter)?.label}`
                    : ''}
                </span>
              </button>
            </div>

            {/* Category Filter Strip */}
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
              {NICHE_TABS.map((tab) => {
                const active = categoryFilter === tab.id;
                const count =
                  tab.id === 'all'
                    ? projects.length
                    : projects.filter((p) => p.niche === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border transition-all duration-300 ease-out cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#1C1D1E] dark:bg-white text-white dark:text-[#1C1D1E] border-transparent'
                        : 'bg-white/60 dark:bg-white/[0.06] text-[#434445] dark:text-white/75 border-black/10 dark:border-white/12 hover:bg-white dark:hover:bg-white/14'
                    }`}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/45 dark:ring-white/10 overflow-hidden flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="p-3 pb-0">
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/5 dark:bg-black/30">
                        <img
                          src={project.heroImage}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#1C1D1E] shadow-sm"
                          style={{ backgroundColor: project.accentHex || '#F8B033' }}
                        >
                          {project.indexNumber} · {project.nicheLabel}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#68696A] dark:text-white/50">
                        {project.client} · Order #{project.sortOrder ?? 0}
                      </div>
                      <h3 className="font-display text-lg font-bold tracking-tight">
                        {project.title}
                      </h3>
                      <p className="text-xs text-[#434445] dark:text-white/70 line-clamp-2">
                        {project.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-black/8 dark:border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewProject(false);
                        setEditingProject(project);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#1C1D1E] dark:bg-white text-white dark:text-[#1C1D1E] px-4 py-1.5 text-xs font-semibold hover:bg-[#F8B033] dark:hover:bg-[#F8B033] hover:text-[#1C1D1E] transition-colors duration-300 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Project</span>
                    </button>

                    {confirmDeleteId === project.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project.id)}
                          className="rounded-full bg-red-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-full bg-black/10 dark:bg-white/10 px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(project.id)}
                        aria-label={`Delete ${project.title}`}
                        className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#68696A] dark:text-white/60 hover:bg-red-500/15 hover:text-red-500 flex items-center justify-center transition-colors duration-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: HERO, VIDEO & SECTION HEADINGS */}
        {activeTab === 'hero' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 sm:p-7 space-y-4">
              <h2 className="font-display text-lg font-bold">Hero Section Text</h2>
              <div>
                <label className={labelClass}>Text Above Main Heading (Eyebrow)</label>
                <input
                  type="text"
                  value={draftContent.copy.heroEyebrow}
                  onChange={(e) =>
                    updateDraft((p) => ({
                      ...p,
                      copy: { ...p.copy, heroEyebrow: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className={labelClass}>Main Heading Prefix</label>
                  <input
                    type="text"
                    value={draftContent.copy.heroHeadingMain}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, heroHeadingMain: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Roll Default Text</label>
                  <input
                    type="text"
                    value={draftContent.copy.heroHeadingHighlight}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, heroHeadingHighlight: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Roll Hover Text</label>
                  <input
                    type="text"
                    value={draftContent.copy.heroHeadingHighlightRoll}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, heroHeadingHighlightRoll: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={draftContent.copy.heroSubtitle}
                  onChange={(e) =>
                    updateDraft((p) => ({
                      ...p,
                      copy: { ...p.copy, heroSubtitle: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Primary CTA</label>
                  <input
                    type="text"
                    value={draftContent.copy.heroPrimaryCta}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, heroPrimaryCta: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Secondary CTA</label>
                  <input
                    type="text"
                    value={draftContent.copy.heroSecondaryCta}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, heroSecondaryCta: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Scroll Hint</label>
                  <input
                    type="text"
                    value={draftContent.copy.heroScrollLabel}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, heroScrollLabel: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 sm:p-7 space-y-4">
              <h2 className="font-display text-lg font-bold">Founder Video & Work Headings</h2>
              <div>
                <label className={labelClass}>Hosted Services Intro Video URL (MP4 / WebM)</label>
                <input
                  type="url"
                  placeholder="https://.../amaan-services-intro.mp4"
                  value={draftContent.brand.introVideoUrl}
                  onChange={(e) =>
                    updateDraft((p) => ({
                      ...p,
                      brand: { ...p.brand, introVideoUrl: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Video Badge Text</label>
                  <input
                    type="text"
                    value={draftContent.copy.videoBadgeLabel}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, videoBadgeLabel: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Video Eyebrow</label>
                  <input
                    type="text"
                    value={draftContent.copy.videoEyebrow}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, videoEyebrow: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Video Overlay Headline</label>
                <input
                  type="text"
                  value={draftContent.copy.videoHeadline}
                  onChange={(e) =>
                    updateDraft((p) => ({
                      ...p,
                      copy: { ...p.copy, videoHeadline: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Manifesto Statement</label>
                <textarea
                  rows={2}
                  value={draftContent.copy.manifestoText}
                  onChange={(e) =>
                    updateDraft((p) => ({
                      ...p,
                      copy: { ...p.copy, manifestoText: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Work Section Eyebrow</label>
                  <input
                    type="text"
                    value={draftContent.copy.workEyebrow}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, workEyebrow: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Work Section Heading</label>
                  <input
                    type="text"
                    value={draftContent.copy.workHeading}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, workHeading: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Reel Eyebrow</label>
                  <input
                    type="text"
                    value={draftContent.copy.reelEyebrow}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, reelEyebrow: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Reel Heading</label>
                  <input
                    type="text"
                    value={draftContent.copy.reelHeading}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, reelHeading: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Reel Helper Text</label>
                  <input
                    type="text"
                    value={draftContent.copy.reelSubtext}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, reelSubtext: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: METRICS & MARQUEE */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draftContent.metrics.map((metric, idx) => (
                <div
                  key={metric.id}
                  className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Metric Card 0{idx + 1}
                    </span>
                    <input
                      type="color"
                      value={metric.bgHex}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          metrics: p.metrics.map((m, i) =>
                            i === idx ? { ...m, bgHex: e.target.value } : m
                          ),
                        }))
                      }
                      aria-label={`Color for metric ${idx + 1}`}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Number</label>
                      <input
                        type="number"
                        value={metric.targetNumber}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            metrics: p.metrics.map((m, i) =>
                              i === idx ? { ...m, targetNumber: Number(e.target.value) || 0 } : m
                            ),
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Suffix</label>
                      <input
                        type="text"
                        value={metric.suffix}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            metrics: p.metrics.map((m, i) =>
                              i === idx ? { ...m, suffix: e.target.value } : m
                            ),
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Label</label>
                    <input
                      type="text"
                      value={metric.label}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          metrics: p.metrics.map((m, i) =>
                            i === idx ? { ...m, label: e.target.value } : m
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Detail</label>
                    <input
                      type="text"
                      value={metric.detail}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          metrics: p.metrics.map((m, i) =>
                            i === idx ? { ...m, detail: e.target.value } : m
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>

            <section className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Scrolling Marquee Items</h2>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft((p) => ({
                      ...p,
                      sectors: [...p.sectors, 'New Capability'],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F8B033] text-[#1C1D1E] px-3.5 py-1.5 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {draftContent.sectors.map((sec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sec}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          sectors: p.sectors.map((item, i) =>
                            i === idx ? e.target.value : item
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft((p) => ({
                          ...p,
                          sectors: p.sectors.filter((_, i) => i !== idx),
                        }))
                      }
                      aria-label="Remove ticker item"
                      className="shrink-0 w-9 h-9 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] hover:text-red-500 flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: SERVICES & PROCESS */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <section className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 sm:p-7 space-y-4">
              <h2 className="font-display text-lg font-bold">Specialties Section Intro</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Eyebrow</label>
                  <input
                    type="text"
                    value={draftContent.copy.specialtiesEyebrow}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, specialtiesEyebrow: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Heading</label>
                  <input
                    type="text"
                    value={draftContent.copy.specialtiesHeading}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, specialtiesHeading: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Subtitle</label>
                  <input
                    type="text"
                    value={draftContent.copy.specialtiesSubtitle}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, specialtiesSubtitle: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draftContent.services.map((svc, idx) => (
                <div
                  key={svc.id}
                  className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 space-y-3"
                >
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className={labelClass}>No.</label>
                      <input
                        type="text"
                        value={svc.number}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            services: p.services.map((s, i) =>
                              i === idx ? { ...s, number: e.target.value } : s
                            ),
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Service Title</label>
                      <input
                        type="text"
                        value={svc.title}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            services: p.services.map((s, i) =>
                              i === idx ? { ...s, title: e.target.value } : s
                            ),
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Turnaround</label>
                      <input
                        type="text"
                        value={svc.turnaround}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            services: p.services.map((s, i) =>
                              i === idx ? { ...s, turnaround: e.target.value } : s
                            ),
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Tagline</label>
                    <input
                      type="text"
                      value={svc.tagline}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          services: p.services.map((s, i) =>
                            i === idx ? { ...s, tagline: e.target.value } : s
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Deliverables (one per line)</label>
                    <textarea
                      rows={3}
                      value={svc.deliverables.join('\n')}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          services: p.services.map((s, i) =>
                            i === idx
                              ? {
                                  ...s,
                                  deliverables: e.target.value.split('\n').map((l) => l.trim()),
                                }
                              : s
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>

            <section className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 sm:p-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Process Eyebrow</label>
                  <input
                    type="text"
                    value={draftContent.copy.processEyebrow}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, processEyebrow: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Process Heading</label>
                  <input
                    type="text"
                    value={draftContent.copy.processHeading}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, processHeading: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {draftContent.processSteps.map((st, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] p-4 space-y-2.5"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={st.step}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            processSteps: p.processSteps.map((s, i) =>
                              i === idx ? { ...s, step: e.target.value } : s
                            ),
                          }))
                        }
                        className={inputClass}
                      />
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            processSteps: p.processSteps.map((s, i) =>
                              i === idx ? { ...s, title: e.target.value } : s
                            ),
                          }))
                        }
                        className={`col-span-2 ${inputClass}`}
                      />
                    </div>
                    <input
                      type="text"
                      value={st.description}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          processSteps: p.processSteps.map((s, i) =>
                            i === idx ? { ...s, description: e.target.value } : s
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={st.handoffNote}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          processSteps: p.processSteps.map((s, i) =>
                            i === idx ? { ...s, handoffNote: e.target.value } : s
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 5: ABOUT, TESTIMONIALS & ARCHIVE REEL */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <section className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 sm:p-7 space-y-4">
              <h2 className="font-display text-lg font-bold">Founder / About Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>About Eyebrow</label>
                  <input
                    type="text"
                    value={draftContent.copy.aboutEyebrow}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, aboutEyebrow: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>About Heading</label>
                  <input
                    type="text"
                    value={draftContent.copy.aboutHeading}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, aboutHeading: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>About Bio Paragraph</label>
                <textarea
                  rows={2}
                  value={draftContent.copy.aboutBody}
                  onChange={(e) =>
                    updateDraft((p) => ({
                      ...p,
                      copy: { ...p.copy, aboutBody: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Design Focus Label</label>
                  <input
                    type="text"
                    value={draftContent.copy.aboutFocusLabel}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, aboutFocusLabel: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Design Focus Highlights</label>
                  <input
                    type="text"
                    value={draftContent.copy.aboutFocusText}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, aboutFocusText: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Founder Portrait Image Path / URL</label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={draftContent.brand.founderAvatar}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        brand: { ...p.brand, founderAvatar: e.target.value },
                      }))
                    }
                    className={`flex-1 min-w-[220px] ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAssetPickerTarget(() => (url: string) =>
                        updateDraft((p) => ({
                          ...p,
                          brand: { ...p.brand, founderAvatar: url },
                        }))
                      )
                    }
                    className="rounded-xl bg-black/[0.06] dark:bg-white/[0.08] px-3.5 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Library
                  </button>
                  <label className="rounded-xl bg-[#F8B033] text-[#1C1D1E] px-3.5 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleLocalImageUpload(e.target.files?.[0], (url) =>
                          updateDraft((p) => ({
                            ...p,
                            brand: { ...p.brand, founderAvatar: url },
                          }))
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </section>

            {/* Testimonials Editor */}
            <section className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 sm:p-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold">Client Proof Testimonials</h2>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft((p) => ({
                      ...p,
                      testimonials: [
                        ...p.testimonials,
                        {
                          id: `review-${Date.now()}`,
                          quote: 'Clear direction and fast production turnaround.',
                          author: 'Client Lead',
                          role: 'Brand Launch',
                          organization: 'Studio Partner',
                          scope: 'Branding & UI',
                        } as Testimonial,
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F8B033] text-[#1C1D1E] px-3.5 py-1.5 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Review</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Reviews Eyebrow</label>
                  <input
                    type="text"
                    value={draftContent.copy.reviewsEyebrow}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, reviewsEyebrow: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Reviews Heading</label>
                  <input
                    type="text"
                    value={draftContent.copy.reviewsHeading}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, reviewsHeading: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {draftContent.testimonials.map((t, idx) => (
                  <div
                    key={t.id}
                    className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#68696A] dark:text-white/50">
                        Review #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((p) => ({
                            ...p,
                            testimonials: p.testimonials.filter((_, i) => i !== idx),
                          }))
                        }
                        aria-label="Delete testimonial"
                        className="text-red-500 hover:opacity-75 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Scope"
                      value={t.scope}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          testimonials: p.testimonials.map((r, i) =>
                            i === idx ? { ...r, scope: e.target.value } : r
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                    <textarea
                      rows={3}
                      value={t.quote}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          testimonials: p.testimonials.map((r, i) =>
                            i === idx ? { ...r, quote: e.target.value } : r
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Author"
                      value={t.author}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          testimonials: p.testimonials.map((r, i) =>
                            i === idx ? { ...r, author: e.target.value } : r
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Role / Project"
                      value={t.role}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          testimonials: p.testimonials.map((r, i) =>
                            i === idx ? { ...r, role: e.target.value } : r
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Archive Reel Strip Editor */}
            <section className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Archive Strip Frames</h2>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft((p) => ({
                      ...p,
                      reelGallery: [
                        ...p.reelGallery,
                        {
                          id: `reel-${Date.now()}`,
                          title: 'New Archive Frame',
                          nicheLabel: 'Design',
                          image: STUDIO_ASSET_LIBRARY[0].url,
                          caseStudyId: projects[0]?.id || '',
                        } as ReelVisualItem,
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F8B033] text-[#1C1D1E] px-3.5 py-1.5 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Frame</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {draftContent.reelGallery.map((frame, idx) => (
                  <div
                    key={frame.id}
                    className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] p-3.5 space-y-2"
                  >
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-black/10 relative">
                      <img src={frame.image} alt={frame.title} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((p) => ({
                            ...p,
                            reelGallery: p.reelGallery.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={frame.title}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          reelGallery: p.reelGallery.map((f, i) =>
                            i === idx ? { ...f, title: e.target.value } : f
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={frame.nicheLabel}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          reelGallery: p.reelGallery.map((f, i) =>
                            i === idx ? { ...f, nicheLabel: e.target.value } : f
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                    <select
                      value={frame.caseStudyId}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          reelGallery: p.reelGallery.map((f, i) =>
                            i === idx ? { ...f, caseStudyId: e.target.value } : f
                          ),
                        }))
                      }
                      className={inputClass}
                    >
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          Links to: {proj.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setAssetPickerTarget(() => (url: string) =>
                          updateDraft((p) => ({
                            ...p,
                            reelGallery: p.reelGallery.map((f, i) =>
                              i === idx ? { ...f, image: url } : f
                            ),
                          }))
                        )
                      }
                      className="w-full rounded-xl bg-black/[0.06] dark:bg-white/[0.08] py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      Change Image
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 6: BRAND, FOOTER & RESTORE */}
        {activeTab === 'brand' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 sm:p-7 space-y-4">
              <h2 className="font-display text-lg font-bold">Studio Contact & Socials</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Studio Name</label>
                  <input
                    type="text"
                    value={draftContent.brand.fullName}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        brand: { ...p.brand, fullName: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Domain</label>
                  <input
                    type="text"
                    value={draftContent.brand.domain}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        brand: { ...p.brand, domain: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Primary Email</label>
                  <input
                    type="email"
                    value={draftContent.brand.email}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        brand: { ...p.brand, email: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="text"
                    value={draftContent.brand.phone}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        brand: { ...p.brand, phone: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    type="text"
                    value={draftContent.brand.location}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        brand: { ...p.brand, location: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Instagram URL</label>
                  <input
                    type="url"
                    value={draftContent.brand.instagramUrl}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        brand: { ...p.brand, instagramUrl: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>LinkedIn URL</label>
                <input
                  type="url"
                  value={draftContent.brand.linkedinUrl}
                  onChange={(e) =>
                    updateDraft((p) => ({
                      ...p,
                      brand: { ...p.brand, linkedinUrl: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </section>

            <section className="rounded-[24px] bg-white/72 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 p-5 sm:p-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="font-display text-lg font-bold">Footer CTA & Tagline</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className={labelClass}>Footer Eyebrow</label>
                    <input
                      type="text"
                      value={draftContent.copy.footerEyebrow}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          copy: { ...p.copy, footerEyebrow: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Footer Roll Default</label>
                    <input
                      type="text"
                      value={draftContent.copy.footerCtaPhrase}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          copy: { ...p.copy, footerCtaPhrase: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Footer Roll Hover</label>
                    <input
                      type="text"
                      value={draftContent.copy.footerCtaPhraseRoll}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          copy: { ...p.copy, footerCtaPhraseRoll: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Footer Subtitle</label>
                  <textarea
                    rows={2}
                    value={draftContent.copy.footerSubtitle}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, footerSubtitle: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Footer Bottom Specialties Line</label>
                  <input
                    type="text"
                    value={draftContent.copy.footerTagline}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        copy: { ...p.copy, footerTagline: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-black/10 dark:border-white/12 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#68696A] dark:text-white/55">
                  Need a clean reset to original copy & projects?
                </span>
                {confirmRestoreDefaults ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRestoreDefaults}
                      className="rounded-full bg-red-600 text-white px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      Yes, Restore All Defaults
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRestoreDefaults(false)}
                      className="rounded-full bg-black/10 dark:bg-white/10 px-3 py-2 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRestoreDefaults(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] px-4 py-2 text-xs font-semibold hover:bg-red-500/15 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Defaults</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* PROJECT EDITOR MODAL */}
      {editingProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[26px] bg-white/94 dark:bg-[#181A20]/96 backdrop-blur-2xl border border-black/10 dark:border-white/15 p-5 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/12">
              <h2 className="font-display text-xl font-bold">
                {isNewProject ? 'Add New Project' : `Edit ${editingProject.title}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="w-8 h-8 rounded-full bg-black/[0.06] dark:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    value={editingProject.niche}
                    onChange={(e) => {
                      const nextNiche = e.target.value as NicheId;
                      setEditingProject((prev) =>
                        prev
                          ? {
                              ...prev,
                              niche: nextNiche,
                              nicheLabel: getNicheLabelForId(nextNiche),
                            }
                          : null
                      );
                    }}
                    className={inputClass}
                  >
                    {NICHE_TABS.filter((t) => t.id !== 'all').map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Index No. (e.g. 08)</label>
                  <input
                    type="text"
                    value={editingProject.indexNumber}
                    onChange={(e) =>
                      setEditingProject((p) => (p ? { ...p, indexNumber: e.target.value } : null))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Sort Order</label>
                  <input
                    type="number"
                    value={editingProject.sortOrder ?? 1}
                    onChange={(e) =>
                      setEditingProject((p) =>
                        p ? { ...p, sortOrder: Number(e.target.value) || 0 } : null
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Project Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject((p) => (p ? { ...p, title: e.target.value } : null))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Client Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.client}
                    onChange={(e) =>
                      setEditingProject((p) => (p ? { ...p, client: e.target.value } : null))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Role Tag</label>
                  <input
                    type="text"
                    value={editingProject.roleTag}
                    onChange={(e) =>
                      setEditingProject((p) => (p ? { ...p, roleTag: e.target.value } : null))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Accent Color</label>
                  <div className="flex items-center gap-2">
                    {ACCENT_PRESETS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() =>
                          setEditingProject((p) => (p ? { ...p, accentHex: hex } : null))
                        }
                        className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                          editingProject.accentHex.toLowerCase() === hex.toLowerCase()
                            ? 'border-[#1C1D1E] dark:border-white scale-110'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                    <input
                      type="text"
                      value={editingProject.accentHex}
                      onChange={(e) =>
                        setEditingProject((p) => (p ? { ...p, accentHex: e.target.value } : null))
                      }
                      className={`w-24 ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Card Summary</label>
                <textarea
                  rows={2}
                  value={editingProject.summary}
                  onChange={(e) =>
                    setEditingProject((p) => (p ? { ...p, summary: e.target.value } : null))
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>01 / Challenge</label>
                  <textarea
                    rows={3}
                    value={editingProject.challenge}
                    onChange={(e) =>
                      setEditingProject((p) => (p ? { ...p, challenge: e.target.value } : null))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>02 / Execution</label>
                  <textarea
                    rows={3}
                    value={editingProject.solution}
                    onChange={(e) =>
                      setEditingProject((p) => (p ? { ...p, solution: e.target.value } : null))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Outcome Headline</label>
                  <input
                    type="text"
                    value={editingProject.outcomeMetric}
                    onChange={(e) =>
                      setEditingProject((p) =>
                        p ? { ...p, outcomeMetric: e.target.value } : null
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Outcome Context</label>
                  <input
                    type="text"
                    value={editingProject.outcomeContext}
                    onChange={(e) =>
                      setEditingProject((p) =>
                        p ? { ...p, outcomeContext: e.target.value } : null
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Hero Image + Upload + Studio Picker */}
              <div>
                <label className={labelClass}>Cover / Hero Image URL</label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={editingProject.heroImage}
                    onChange={(e) =>
                      setEditingProject((p) => (p ? { ...p, heroImage: e.target.value } : null))
                    }
                    className={`flex-1 min-w-[200px] ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAssetPickerTarget(() => (url: string) =>
                        setEditingProject((p) => (p ? { ...p, heroImage: url } : null))
                      )
                    }
                    className="rounded-xl bg-black/[0.06] dark:bg-white/[0.08] px-3.5 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Studio Assets
                  </button>
                  <label className="rounded-xl bg-[#F8B033] text-[#1C1D1E] px-3.5 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleLocalImageUpload(e.target.files?.[0], (url) =>
                          setEditingProject((p) => (p ? { ...p, heroImage: url } : null))
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass}>Gallery Images ({editingProject.galleryImages.length})</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setAssetPickerTarget(() => (url: string) =>
                          setEditingProject((p) =>
                            p ? { ...p, galleryImages: [...p.galleryImages, url] } : null
                          )
                        )
                      }
                      className="text-xs font-semibold text-[#429AD4] hover:underline cursor-pointer"
                    >
                      + From Library
                    </button>
                    <label className="text-xs font-semibold text-[#F8B033] hover:underline cursor-pointer">
                      + Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleLocalImageUpload(e.target.files?.[0], (url) =>
                            setEditingProject((p) =>
                              p ? { ...p, galleryImages: [...p.galleryImages, url] } : null
                            )
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={editingProject.galleryImages.join('\n')}
                  onChange={(e) =>
                    setEditingProject((p) =>
                      p
                        ? {
                            ...p,
                            galleryImages: e.target.value.split('\n').map((l) => l.trim()),
                          }
                        : null
                    )
                  }
                  placeholder="One image URL per line"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Specs Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editingProject.specs.join(', ')}
                    onChange={(e) =>
                      setEditingProject((p) =>
                        p
                          ? {
                              ...p,
                              specs: e.target.value.split(',').map((s) => s.trim()),
                            }
                          : null
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Deliverables (one per line)</label>
                  <textarea
                    rows={3}
                    value={editingProject.deliverables.join('\n')}
                    onChange={(e) =>
                      setEditingProject((p) =>
                        p
                          ? {
                              ...p,
                              deliverables: e.target.value.split('\n').map((s) => s.trim()),
                            }
                          : null
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-black/10 dark:border-white/12 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="rounded-full bg-black/[0.06] dark:bg-white/[0.08] px-5 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F8B033] text-[#1C1D1E] px-6 py-2.5 text-xs sm:text-sm font-bold hover:bg-[#1C1D1E] hover:text-white transition-colors duration-300 cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProject ? 'Saving...' : 'Save Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDIO ASSET PICKER MODAL */}
      {assetPickerTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[24px] bg-white/95 dark:bg-[#181A20]/96 p-5 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Select Studio Asset</h3>
              <button
                type="button"
                onClick={() => setAssetPickerTarget(null)}
                className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {STUDIO_ASSET_LIBRARY.map((asset) => (
                <button
                  key={asset.url}
                  type="button"
                  onClick={() => {
                    assetPickerTarget(asset.url);
                    setAssetPickerTarget(null);
                  }}
                  className="group rounded-xl overflow-hidden border border-black/10 dark:border-white/12 bg-black/5 dark:bg-white/5 text-left hover:border-[#F8B033] transition-colors cursor-pointer"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={asset.url}
                      alt={asset.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 text-[11px] font-semibold truncate">{asset.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
