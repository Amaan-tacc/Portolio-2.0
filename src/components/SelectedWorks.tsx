import React, { useRef } from 'react';
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import {
  CASE_STUDIES,
  DEFAULT_SITE_COPY,
  NICHE_TABS,
  REEL_GALLERY,
} from '../data/studioData';
import { CaseStudy, NicheId, ReelVisualItem, SiteCopyConfig } from '../types/studio';

interface SelectedWorksProps {
  activeFilter: 'all' | NicheId;
  onFilterChange: (filter: 'all' | NicheId) => void;
  onSelectCaseStudy: (study: CaseStudy) => void;
  onRequestSimilar: (niche: NicheId) => void;
  projects?: CaseStudy[];
  reelGallery?: ReelVisualItem[];
  copy?: SiteCopyConfig;
}

interface StackedProjectCardProps {
  study: CaseStudy;
  index: number;
  total: number;
  nextSlotRef: React.RefObject<HTMLDivElement | null> | null;
  ownSlotRef: React.RefObject<HTMLDivElement | null>;
  onSelectCaseStudy: (study: CaseStudy) => void;
  onRequestSimilar: (niche: NicheId) => void;
}

const StackedProjectCard: React.FC<StackedProjectCardProps> = ({
  study,
  index,
  total,
  nextSlotRef,
  ownSlotRef,
  onSelectCaseStudy,
  onRequestSimilar,
}) => {
  const isLast = index === total - 1;

  // Measure the NEXT card's non-sticky top marker entering from below over this card.
  // Scrolling up immediately lowers overlapProgress and restores full 100% brightness & scale.
  const { scrollYProgress: overlapProgress } = useScroll({
    target: nextSlotRef ?? ownSlotRef,
    offset: ['start 64%', 'start 110px'],
  });

  const scale = useTransform(overlapProgress, [0, 1], [1, isLast ? 1 : 0.94]);
  const opacity = useTransform(overlapProgress, [0, 0.35, 1], [1, 1, isLast ? 1 : 0.84]);
  const cardY = useTransform(overlapProgress, [0, 1], [0, isLast ? 0 : -12]);
  const imageScale = useTransform(overlapProgress, [0, 1], [1.05, 1]);
  const imageY = useTransform(overlapProgress, [0, 1], [-10, 12]);

  return (
    <>
      <div
        ref={ownSlotRef}
        className={`h-0 w-full pointer-events-none ${index > 0 ? 'mt-6 sm:mt-14' : ''}`}
        aria-hidden="true"
      />

      <div
        className="sticky"
        style={{
          top: `${74 + index * 7}px`,
          zIndex: index + 1,
        }}
      >
        <motion.article
          style={{ scale, opacity, y: cardY }}
          className="group rounded-[22px] md:rounded-[40px] bg-white/92 dark:bg-[#1E1F23]/90 backdrop-blur-2xl border border-black/10 dark:border-white/14 ring-1 ring-inset ring-white/95 dark:ring-white/10 overflow-hidden shadow-[0_22px_55px_-12px_rgba(28,29,30,0.14)] dark:shadow-[0_26px_65px_rgba(0,0,0,0.58)] origin-top will-change-transform hover:border-black/22 dark:hover:border-white/28 transition-colors duration-300"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 lg:min-h-[470px]"
          >
            {/* Left Info Column */}
            <div className="lg:col-span-5 p-4 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#68696A] dark:text-white/55 mb-2 sm:mb-3">
                  <span className="tabular-nums text-[#68696A] dark:text-white/45">
                    {study.indexNumber}
                  </span>
                  <span aria-hidden="true">/</span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: study.accentHex }}
                    aria-hidden="true"
                  />
                  <span className="text-[#1C1D1E] dark:text-white/90">{study.nicheLabel}</span>
                </div>

                <h3 className="font-display text-xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1D1E] dark:text-white">
                  {study.title}
                </h3>

                <p className="mt-2 sm:mt-3 text-xs sm:text-base text-[#434445] dark:text-white/75 leading-snug max-w-sm">
                  {study.summary}
                </p>
              </div>

              <div className="mt-4 sm:mt-8 pt-3.5 sm:pt-5 border-t border-black/10 dark:border-white/12 space-y-3.5 sm:space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs sm:text-lg font-bold tracking-tight text-[#1C1D1E] dark:text-white">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: study.accentHex }}
                      aria-hidden="true"
                    />
                    <span>{study.outcomeMetric}</span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#68696A] dark:text-white/55 mt-0.5 sm:mt-1">
                    {study.specs.join(' · ')}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    onClick={() => onSelectCaseStudy(study)}
                    className="group/btn inline-flex items-center gap-2 rounded-full bg-[#1C1D1E] dark:bg-white/90 backdrop-blur-xl ring-1 ring-inset ring-white/15 dark:ring-white/45 text-white dark:text-[#1C1D1E] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold hover:bg-[#F8B033] dark:hover:bg-[#F8B033] hover:text-[#1C1D1E] transition-colors duration-350 ease-out cursor-pointer"
                  >
                    <span>View Project</span>
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => onRequestSimilar(study.niche)}
                    className="text-xs sm:text-sm font-medium text-[#434445] dark:text-white/75 hover:text-[#1C1D1E] dark:hover:text-[#F8B033] border-b border-black/25 dark:border-white/25 hover:border-[#1C1D1E] dark:hover:border-[#F8B033] pb-0.5 transition-colors duration-300 ease-out cursor-pointer"
                  >
                    Book Similar
                  </button>
                </div>
              </div>
            </div>

            {/* Right Image Column with Gallery Mat Padding */}
            <div className="lg:col-span-7 p-2.5 pt-0 sm:p-4 sm:pt-0 lg:p-5 flex">
              <div
                onClick={() => onSelectCaseStudy(study)}
                className="relative w-full h-[185px] sm:h-[290px] lg:h-full rounded-[16px] md:rounded-[28px] bg-[#ECECEF] dark:bg-[#111215] border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/75 dark:ring-white/10 overflow-hidden cursor-pointer shadow-inner"
              >
                <motion.img
                  style={{ y: imageY, scale: imageScale }}
                  src={study.heroImage}
                  alt={`${study.title} — ${study.roleTag}`}
                  loading="lazy"
                  className="w-full h-[112%] -mt-[4%] object-cover will-change-transform transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </motion.article>
      </div>
    </>
  );
};

export const SelectedWorks: React.FC<SelectedWorksProps> = ({
  activeFilter,
  onFilterChange,
  onSelectCaseStudy,
  onRequestSimilar,
  projects = CASE_STUDIES,
  reelGallery = REEL_GALLERY,
  copy = DEFAULT_SITE_COPY,
}) => {
  const reelSectionRef = useRef<HTMLElement>(null);

  const filteredStudies = React.useMemo(
    () =>
      activeFilter === 'all'
        ? projects
        : projects.filter((item) => item.niche === activeFilter),
    [activeFilter, projects]
  );

  const slotRefs = React.useMemo(
    () => filteredStudies.map(() => React.createRef<HTMLDivElement>()),
    [filteredStudies]
  );

  const stripRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, start: 0, left: 0, moved: false });
  const scrollArchive = (direction: number) => {
    const el = stripRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const handleOpenById = (studyId: string) => {
    const match = projects.find((c) => c.id === studyId) ?? projects[0];
    if (match) onSelectCaseStudy(match);
  };

  return (
    <>
      <section
        id="work"
        className="scroll-mt-20 sm:scroll-mt-24 relative overflow-clip py-12 sm:py-22 studio-work-band text-[#1C1D1E] dark:text-white rounded-[26px] md:rounded-[52px] mx-2 sm:mx-4 border border-black/12 dark:border-white/14 ring-1 ring-inset ring-white/90 dark:ring-white/10 transition-colors duration-500"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#F8B033]/75 to-transparent pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 studio-work-band-dots opacity-85 pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 studio-grain-texture opacity-[0.05] dark:opacity-[0.09] mix-blend-overlay pointer-events-none"
        />
        <div className="relative z-10 max-w-[1380px] mx-auto px-3.5 sm:px-8">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-black/10 dark:border-white/12">
            <div className="shrink-0">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1D6FA5] dark:text-[#F8B033] mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#429AD4]" aria-hidden="true" />
                <span>{copy.workEyebrow}</span>
              </div>
              <h2 className="font-display text-[clamp(1.85rem,4.2vw,3.9rem)] font-bold leading-[1.0] tracking-[-0.038em] text-balance">
                {copy.workHeading}
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Filter projects by specialty"
              className="flex flex-nowrap items-center gap-4 sm:gap-5 xl:gap-4 2xl:gap-5 overflow-x-auto max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5 shrink-0"
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
                    className={`relative shrink-0 text-xs sm:text-sm font-medium pb-2 transition-colors duration-300 ease-out cursor-pointer whitespace-nowrap ${
                      active
                        ? 'text-[#1C1D1E] dark:text-white'
                        : 'text-[#68696A] dark:text-white/55 hover:text-[#1C1D1E] dark:hover:text-white'
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

          <div className="mt-7 sm:mt-10 pb-4 sm:pb-6">
            <AnimatePresence>
              {filteredStudies.map((study, index) => {
                const nextSlot = index + 1 < slotRefs.length ? slotRefs[index + 1] : null;
                return (
                  <StackedProjectCard
                    key={study.id}
                    study={study}
                    index={index}
                    total={filteredStudies.length}
                    ownSlotRef={slotRefs[index]}
                    nextSlotRef={nextSlot}
                    onSelectCaseStudy={onSelectCaseStudy}
                    onRequestSimilar={onRequestSimilar}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Scroll-Parallax Archive Strip with Framed Glass Cards */}
      <section
        ref={reelSectionRef}
        className="py-12 sm:py-20 bg-transparent overflow-hidden transition-colors duration-500"
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#68696A] dark:text-white/50 mb-1">
              {copy.reelEyebrow}
            </div>
            <h3 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-[#1C1D1E] dark:text-white">
              {copy.reelHeading}
            </h3>
          </div>
          <span className="text-xs font-medium text-[#68696A] dark:text-white/55">
            {copy.reelSubtext}
          </span>
        </div>

        <div className="max-w-[1380px] mx-auto flex justify-end gap-2 px-4 sm:px-8 mb-2">
          <button aria-label="Previous archive images" onClick={() => scrollArchive(-1)} className="rounded-full border border-current/20 px-4 py-2 hover:bg-[#F8B033] transition-colors">←</button>
          <button aria-label="Next archive images" onClick={() => scrollArchive(1)} className="rounded-full border border-current/20 px-4 py-2 hover:bg-[#F8B033] transition-colors">→</button>
        </div>
        <div ref={stripRef} data-lenis-prevent role="region" aria-label="Project image gallery" tabIndex={0}
          onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); scrollArchive(e.key === 'ArrowRight' ? 1 : -1); } }}
          onPointerDown={e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; drag.current = {active: true, start: e.clientX, left: e.currentTarget.scrollLeft, moved: false}; }}
          onPointerMove={e => { const d = drag.current; if (!d.active) return; const delta = e.clientX - d.start; if (Math.abs(delta) > 6) { d.moved = true; e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.scrollLeft = d.left - delta; } }}
          onPointerUp={e => { drag.current.active = false; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}
          onPointerCancel={() => { drag.current.active = false; }}
          onPointerLeave={() => { drag.current.active = false; }}
          onClickCapture={e => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; } }}
          className="archive-scroll overflow-x-auto py-3 px-4 sm:px-8 cursor-grab active:cursor-grabbing select-none">
            <div className="flex w-max items-stretch gap-3.5 sm:gap-5">
              {reelGallery.map((item, idx) => (
                <motion.button
                  key={`${item.id}-${idx}`}
                  type="button"
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  onClick={() => handleOpenById(item.caseStudyId)}
                  className="group relative shrink-0 w-[200px] sm:w-[330px] h-[165px] sm:h-[250px] p-2 sm:p-2.5 rounded-[20px] sm:rounded-[28px] bg-white/55 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/8 dark:border-white/14 ring-1 ring-inset ring-white/45 dark:ring-white/10 shadow-sm hover:shadow-xl cursor-pointer text-left will-change-transform"
                >
                  <div className="relative w-full h-full rounded-[14px] sm:rounded-[20px] overflow-hidden bg-[#141518]">
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      decoding="async"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-85 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 rounded-xl bg-black/40 backdrop-blur-xl ring-1 ring-inset ring-white/18 px-3 py-1.5 sm:py-2 text-white transition-transform duration-300 group-hover:-translate-y-0.5">
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#F8B033] font-semibold">
                        {item.nicheLabel}
                      </div>
                      <div className="text-xs sm:text-sm font-bold tracking-tight mt-0.5 truncate">
                        {item.title}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
        </div>
      </section>
    </>
  );
};
