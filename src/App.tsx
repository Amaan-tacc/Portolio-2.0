/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
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
import { CaseStudy, NicheId } from './types/studio';

const THEME_STORAGE_KEY = 'amaanity_theme_mode';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  const [activeFilter, setActiveFilter] = useState<'all' | NicheId>('all');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [showreelOpen, setShowreelOpen] = useState(false);
  const [prefilledNiche, setPrefilledNiche] = useState<NicheId | null>(null);

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

  return (
    <MotionConfig reducedMotion="user">
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
          className="fixed top-0 left-0 right-0 h-[2.5px] bg-[#F8B033] origin-left z-50 pointer-events-none"
        />

        <div className="relative z-10">
          <Navbar
            isDark={isDark}
            onToggleDark={() => setIsDark((prev) => !prev)}
            onOpenBrief={() => handleOpenBrief()}
          />

          <main>
            <HeroSection
              onOpenBrief={() => handleOpenBrief()}
              onOpenShowreel={() => setShowreelOpen(true)}
              onSelectCaseStudy={setSelectedCaseStudy}
            />

            <ManifestoAndMetrics />

            <SelectedWorks
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onSelectCaseStudy={setSelectedCaseStudy}
              onRequestSimilar={(niche) => handleOpenBrief(niche)}
            />

            <ExpertiseAndProcess onScopeService={(niche) => handleOpenBrief(niche)} />
          </main>

          <FooterCTA onOpenBrief={handleOpenBrief} />
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
        />
      </div>
    </MotionConfig>
  );
}
