import React, { useRef } from 'react';
import {
  AnimatePresence,
  motion,
  MotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { CASE_STUDIES, NICHE_TABS, REEL_GALLERY } from '../data/studioData';
import { CaseStudy, NicheId } from '../types/studio';

interface SelectedWorksProps {
  activeFilter: 'all' | NicheId;
  onFilterChange: (filter: 'all' | NicheId) => void;
  onSelectCaseStudy: (study: CaseStudy) => void;
  onRequestSimilar: (niche: NicheId) => void;
}

interface StackedProjectCardProps {
  study: CaseStudy;
  index: number;
  total: number;
  progress: MotionValue<number>;
  onSelectCaseStudy: (study: CaseStudy) => void;
  onRequestSimilar: (niche: NicheId) => void;
}

const StackedProjectCard: React.FC<StackedProjectCardProps> = ({
  study,
  index,
  total,
  progress,
  onSelectCaseStudy,
  onRequestSimilar,
}) => {
  const rangeStart = total > 1 ? index / total : 0;
  const rangeEnd = total > 1 ? Math.min(1, (index + 1) / total) : 1;

  const isLast = index === total - 1;
  const scale = useTransform(progress, [rangeStart, rangeEnd], [1, isLast ? 1 : 0.9]);
  const opacity = useTransform(progress, [rangeStart, rangeEnd], [1, isLast ? 1 : 0.36]);
  const cardY = useTransform(progress, [rangeStart, rangeEnd], [0, isLast ? 0 : -20]);
  const imageScale = useTransform(progress, [rangeStart, rangeEnd], [1.08, 1]);
  const imageY = useTransform(progress, [rangeStart, rangeEnd], [-16, 18]);

  return (
    <div
      className="sticky"
      style={{
        top: `${76 + index * 10}px`,
        zIndex: index + 1,
      }}
    >
      <motion.article
        layout
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
        style={{ scale, opacity, y: cardY }}
        className="group rounded-[26px] md:rounded-[44px] bg-[#222324]/95 backdrop-blur-xl border border-white/12 overflow-hidden shadow-2xl origin-top will-change-transform hover:border-white/28 transition-colors duration-300"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[390px] lg:min-h-[490px]">
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold uppercase tracking-wider text-white/55 mb-3">
                <span className="tabular-nums text-white/40">{study.indexNumber}</span>
                <span aria-hidden="true">/</span>
                <span style={{ color: study.accentHex }}>{study.nicheLabel}</span>
              </div>

              <h3 className="font-display text-2xl sm:text-5xl font-bold tracking-tight text-white">
                {study.title}
              </h3>

              <p className="mt-3 text-sm sm:text-base text-white/75 leading-snug max-w-sm">
                {study.summary}
              </p>
            </div>

            <div className="mt-6 sm:mt-8 pt-5 border-t border-white/12 space-y-5">
              <div>
                <div
                  className="text-sm sm:text-lg font-bold tracking-tight"
                  style={{ color: study.accentHex }}
                >
                  {study.outcomeMetric}
                </div>
                <div className="text-xs text-white/50 mt-1">{study.specs.join(' · ')}</div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                  onClick={() => onSelectCaseStudy(study)}
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md text-[#1C1D1E] px-5 py-2.5 text-sm font-semibold hover:bg-[#F8B033] transition-colors cursor-pointer"
                >
                  <span>View Project</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.button>
                <button
                  type="button"
                  onClick={() => onRequestSimilar(study.niche)}
                  className="text-sm font-medium text-white/75 hover:text-[#F8B033] border-b border-white/25 hover:border-[#F8B033] pb-0.5 transition-colors cursor-pointer"
                >
                  Book Similar
                </button>
              </div>
            </div>
          </div>

          <div
            onClick={() => onSelectCaseStudy(study)}
            className="lg:col-span-7 relative min-h-[240px] sm:min-h-[380px] bg-[#18191B] overflow-hidden cursor-pointer"
          >
            <motion.img
              style={{ y: imageY, scale: imageScale }}
              src={study.heroImage}
              alt={`${study.title} — ${study.roleTag}`}
              loading="lazy"
              className="w-full h-[112%] -mt-[4%] object-cover will-change-transform transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </motion.article>
    </div>
  );
};

export const SelectedWorks: React.FC<SelectedWorksProps> = ({
  activeFilter,
  onFilterChange,
  onSelectCaseStudy,
  onRequestSimilar,
}) => {
  const stackContainerRef = useRef<HTMLDivElement>(null);
  const reelSectionRef = useRef<HTMLElement>(null);

  const filteredStudies =
    activeFilter === 'all'
      ? CASE_STUDIES
      : CASE_STUDIES.filter((item) => item.niche === activeFilter);

  const { scrollYProgress: rawProgress } = useScroll({
    target: stackContainerRef,
    offset: ['start start', 'end end'],
  });
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 110,
    damping: 26,
  });

  const { scrollYProgress: reelScroll } = useScroll({
    target: reelSectionRef,
    offset: ['start end', 'end start'],
  });
  const smoothReelScroll = useSpring(reelScroll, { stiffness: 100, damping: 24 });
  const reelShiftX = useTransform(smoothReelScroll, [0, 1], [-100, 100]);

  const handleOpenById = (studyId: string) => {
    const match = CASE_STUDIES.find((c) => c.id === studyId);
    if (match) onSelectCaseStudy(match);
  };

  return (
    <>
      <section
        id="work"
        className="relative overflow-clip py-16 sm:py-24 studio-dark-band text-white rounded-[28px] md:rounded-[52px] mx-2 sm:mx-4 border border-white/10 transition-colors duration-500"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 studio-dark-band-dots opacity-85 pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 studio-grain-texture opacity-[0.09] mix-blend-overlay pointer-events-none"
        />
        <div className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 pb-8 border-b border-white/12">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F8B033] mb-2">
                Selected Work
              </div>
              <h2 className="font-display text-[clamp(2.1rem,5vw,4.5rem)] font-bold leading-[1.0] tracking-[-0.038em] text-balance">
                Recent client projects.
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Filter projects by specialty"
              className="flex flex-wrap items-center gap-x-5 sm:gap-x-6 gap-y-2.5"
            >
              {NICHE_TABS.map((tab) => {
                const active = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => onFilterChange(tab.id)}
                    className={`relative text-xs sm:text-sm font-medium pb-2 transition-colors cursor-pointer whitespace-nowrap ${
                      active ? 'text-white' : 'text-white/55 hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {active && (
                      <motion.span
                        layoutId="niche-tab-underline"
                        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                        className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#F8B033]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={stackContainerRef} className="mt-10 space-y-10 sm:space-y-16 pb-6">
            <AnimatePresence mode="popLayout">
              {filteredStudies.map((study, index) => (
                <StackedProjectCard
                  key={study.id}
                  study={study}
                  index={index}
                  total={filteredStudies.length}
                  progress={smoothProgress}
                  onSelectCaseStudy={onSelectCaseStudy}
                  onRequestSimilar={onRequestSimilar}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Half-Speed Scroll-Parallax Archive Strip */}
      <section
        ref={reelSectionRef}
        className="py-14 sm:py-20 bg-transparent overflow-hidden transition-colors duration-500"
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 mb-7 flex flex-wrap items-end justify-between gap-4">
          <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1D1E] dark:text-white">
            More from the studio
          </h3>
          <span className="text-xs font-medium text-[#68696A] dark:text-white/55">
            Click any card to inspect
          </span>
        </div>

        <div className="marquee-mask overflow-hidden py-3">
          <motion.div style={{ x: reelShiftX }} className="will-change-transform">
            <div className="animate-marquee-left marquee-pausable flex items-stretch gap-4 sm:gap-5">
              {[...REEL_GALLERY, ...REEL_GALLERY].map((item, idx) => (
                <motion.button
                  key={`${item.id}-${idx}`}
                  type="button"
                  whileHover={{ y: -8, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  onClick={() => handleOpenById(item.caseStudyId)}
                  className="group relative shrink-0 w-[240px] sm:w-[340px] h-[200px] sm:h-[260px] rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#F4F4F4] dark:bg-[#222324] border border-black/8 dark:border-white/10 cursor-pointer text-left will-change-transform"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-85 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 rounded-xl bg-black/35 backdrop-blur-md border border-white/12 px-3 py-2 text-white transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-[#F8B033] font-semibold">
                      {item.nicheLabel}
                    </div>
                    <div className="text-xs sm:text-base font-bold tracking-tight mt-0.5">
                      {item.title}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
