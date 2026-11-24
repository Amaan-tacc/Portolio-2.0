/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { motion, MotionConfig, useScroll, useSpring } from 'motion/react';
import { Navbar } from './components/Navbar';
import { MobileDock } from './components/MobileDock';
import { HeroSection } from './components/HeroSection';
import { ManifestoAndMetrics } from './components/ManifestoAndMetrics';
import { SelectedWorks } from './components/SelectedWorks';
import { ExpertiseAndProcess } from './components/ExpertiseAndProcess';
import { FooterCTA } from './components/FooterCTA';
import { CaseStudyDrawer } from './components/CaseStudyDrawer';
import { GuidedBriefModal } from './components/GuidedBriefModal';
import { ShowreelModal } from './components/ShowreelModal';
import { AdminPortal } from './components/AdminPortal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CASE_STUDIES, DEFAULT_SITE_CONTENT } from './data/studioData';
import { testConnection } from './lib/firebase';
import { subscribeToProjects, subscribeToSiteContent } from './lib/studioCms';
import { CaseStudy, NicheId, SiteContentBundle } from './types/studio';

const THEME_STORAGE_KEY = 'amaanity_theme_mode';

function isCurrentlyAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.replace(/\/+$/, '');
  return path === '/admin' || window.location.hash === '#/admin';
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return false;
    } catch {
      return false;
    }
  });

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => isCurrentlyAdminRoute());
  const [siteContent, setSiteContent] = useState<SiteContentBundle>(DEFAULT_SITE_CONTENT);
  const [projects, setProjects] = useState<CaseStudy[]>(CASE_STUDIES);

  const [activeFilter, setActiveFilter] = useState<'all' | NicheId>('all');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [showreelOpen, setShowreelOpen] = useState(false);
  const [prefilledNiche, setPrefilledNiche] = useState<NicheId | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage error
    }
  }, [isDark]);

  // Listen to browser navigation for hidden /admin URL
  useEffect(() => {
    const syncRoute = () => setIsAdminRoute(isCurrentlyAdminRoute());
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  // Verify Firestore connection and subscribe to live CMS documents
  useEffect(() => {
    testConnection();
    const unsubContent = subscribeToSiteContent((content) => {
      setSiteContent(content);
    });
    const unsubProjects = subscribeToProjects((nextProjects) => {
      setProjects(nextProjects);
    });
    return () => {
      unsubContent();
      unsubProjects();
    };
  }, []);

  // Smooth inertial momentum scrolling on the public portfolio only
  useEffect(() => {
    if (isAdminRoute) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.082,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.35,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };
    rafId = window.requestAnimationFrame(raf);

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!target) return;
      const hash = target.getAttribute('href');
      if (!hash) return;
      e.preventDefault();
      if (hash === '#' || hash === '#hero-top') {
        lenis.scrollTo(0, { duration: 1.15 });
        return;
      }
      const section = document.querySelector(hash);
      if (section instanceof HTMLElement) {
        lenis.scrollTo(section, { offset: -84, duration: 1.15 });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isAdminRoute]);

  // Pause background inertial scroll when overlays are open
  useEffect(() => {
    const hasModal = selectedCaseStudy !== null || briefOpen || showreelOpen;
    if (hasModal) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }
  }, [selectedCaseStudy, briefOpen, showreelOpen]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  const handleOpenBrief = (niche?: NicheId) => {
    setPrefilledNiche(niche ?? null);
    setBriefOpen(true);
  };

  const navigateHome = () => {
    if (window.location.hash === '#/admin') {
      window.location.hash = '';
    }
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        {isAdminRoute ? (
          <AdminPortal
            isDark={isDark}
            onToggleDark={() => setIsDark((prev) => !prev)}
            siteContent={siteContent}
            projects={projects}
            onNavigateHome={navigateHome}
          />
        ) : (
          <div className="relative min-h-screen studio-canvas-bg text-[#1C1D1E] dark:text-white selection:bg-[#F8B033] selection:text-[#1C1D1E] transition-colors duration-500">
            {/* Global Textured Dot-Grid & Matte Film Grain Overlays */}
            <div
              aria-hidden="true"
              className="fixed inset-0 studio-dot-texture opacity-70 dark:opacity-80 pointer-events-none z-0"
            />
            <div
              aria-hidden="true"
              className="fixed inset-0 studio-grain-texture opacity-[0.07] dark:opacity-[0.11] mix-blend-overlay pointer-events-none z-0"
            />

            {/* Slow, fluid top reading progress bar */}
            <motion.div
              style={{ scaleX }}
              className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#F8B033] via-[#F8B033] to-[#429AD4] origin-left z-50 pointer-events-none"
            />

            <div className="relative z-10">
              <Navbar
                isDark={isDark}
                onToggleDark={() => setIsDark((prev) => !prev)}
                onOpenBrief={() => handleOpenBrief()}
                brand={siteContent.brand}
              />

              <main>
                <HeroSection
                  onOpenBrief={() => handleOpenBrief()}
                  onOpenShowreel={() => setShowreelOpen(true)}
                  onSelectCaseStudy={setSelectedCaseStudy}
                  copy={siteContent.copy}
                  brand={siteContent.brand}
                />

                <ManifestoAndMetrics
                  manifestoText={siteContent.copy.manifestoText}
                  metrics={siteContent.metrics}
                  sectors={siteContent.sectors}
                />

                <SelectedWorks
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  onSelectCaseStudy={setSelectedCaseStudy}
                  onRequestSimilar={(niche) => handleOpenBrief(niche)}
                  projects={projects}
                  reelGallery={siteContent.reelGallery}
                  copy={siteContent.copy}
                />

                <ExpertiseAndProcess
                  onScopeService={(niche) => handleOpenBrief(niche)}
                  services={siteContent.services}
                  processSteps={siteContent.processSteps}
                  testimonials={siteContent.testimonials}
                  brand={siteContent.brand}
                  copy={siteContent.copy}
                />
              </main>

              <FooterCTA
                onOpenBrief={handleOpenBrief}
                brand={siteContent.brand}
                copy={siteContent.copy}
              />
            </div>

            <MobileDock
              isDark={isDark}
              onToggleDark={() => setIsDark((prev) => !prev)}
              onOpenBrief={() => handleOpenBrief()}
            />

            <ShowreelModal
              isOpen={showreelOpen}
              onClose={() => setShowreelOpen(false)}
              onStartProject={(niche) => handleOpenBrief(niche)}
              brand={siteContent.brand}
              services={siteContent.services}
            />

            <CaseStudyDrawer
              study={selectedCaseStudy}
              onClose={() => setSelectedCaseStudy(null)}
              onRequestSimilar={(niche) => handleOpenBrief(niche)}
            />

            <GuidedBriefModal
              isOpen={briefOpen}
              prefilledNiche={prefilledNiche}
              onClose={() => setBriefOpen(false)}
              brand={siteContent.brand}
              services={siteContent.services}
            />
          </div>
        )}
      </MotionConfig>
    </ErrorBoundary>
  );
}
