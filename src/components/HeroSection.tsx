import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowUpRight, Play } from 'lucide-react';
import { DEFAULT_SITE_COPY, STUDIO_BRAND } from '../data/studioData';
import { CaseStudy, SiteCopyConfig, StudioBrandConfig } from '../types/studio';

interface HeroSectionProps {
  onOpenBrief: () => void;
  onOpenShowreel: () => void;
  onSelectCaseStudy?: (study: CaseStudy) => void;
  copy?: SiteCopyConfig;
  brand?: StudioBrandConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBrief,
  onOpenShowreel,
  copy = DEFAULT_SITE_COPY,
  brand = STUDIO_BRAND,
}) => {
  const [headingRolled, setHeadingRolled] = useState(false);

  const heroTitleRef = useRef<HTMLDivElement>(null);
  const videoTrackRef = useRef<HTMLDivElement>(null);

  // 1) Full-screen Hero scroll parallax with gentle top buffer so centered heading rests cleanly
  const { scrollYProgress: titleScroll } = useScroll({
    target: heroTitleRef,
    offset: ['start start', 'end start'],
  });
  const headlineY = useTransform(titleScroll, [0, 0.1, 1], [0, 0, -72]);
  const headlineScale = useTransform(titleScroll, [0, 0.1, 1], [1, 1, 1.16]);
  const headlineOpacity = useTransform(titleScroll, [0, 0.12, 0.82], [1, 1, 0.08]);

  // 2) Creative Lab scroll-expanding video thumbnail card
  const { scrollYProgress: videoScroll } = useScroll({
    target: videoTrackRef,
    offset: ['start end', 'end end'],
  });
  const cardScale = useTransform(videoScroll, [0, 0.55, 1], [0.84, 0.96, 1]);
  const cardRadius = useTransform(videoScroll, [0, 0.55, 1], [48, 36, 28]);
  const innerImageScale = useTransform(videoScroll, [0, 1], [1.12, 1]);

  return (
    <section className="bg-transparent overflow-x-clip">
      {/* PART 1: True Full-Viewport Dead-Center Main Heading */}
      <div
        id="hero-top"
        ref={heroTitleRef}
        className="min-h-[100svh] flex flex-col justify-center items-center px-4 sm:px-8 py-20 text-center relative"
      >
        <motion.div
          style={{ y: headlineY, scale: headlineScale, opacity: headlineOpacity }}
          className="w-full max-w-5xl mx-auto will-change-transform"
        >
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-[#68696A] dark:text-white/55 mb-5 sm:mb-7"
          >
            {copy.heroEyebrow}
          </motion.p>

          {/* Main Heading: Roll triggers strictly when cursor is over the highlighted phrase */}
          <h1
            className="font-display text-[clamp(2.75rem,9vw,8.25rem)] font-bold leading-[1.02] tracking-[-0.045em] text-[#1C1D1E] dark:text-white text-balance select-none"
            aria-label={`${copy.heroHeadingMain} ${copy.heroHeadingHighlight}`}
          >
            <span className="inline-block overflow-hidden mr-[0.22em] pb-1 align-top">
              <motion.span
                initial={{ y: '118%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 1.15, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                {copy.heroHeadingMain}
              </motion.span>
            </span>

            <span className="inline-block overflow-hidden pb-1 align-top">
              <motion.span
                initial={{ y: '118%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 1.15, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setHeadingRolled((prev) => !prev)}
                className="group/roll relative inline-grid overflow-hidden whitespace-nowrap align-top cursor-pointer"
              >
                <span
                  className={`col-start-1 row-start-1 block transition-transform duration-400 ease-out group-hover/roll:-translate-y-full text-[#F8B033] ${
                    headingRolled ? '-translate-y-full' : ''
                  }`}
                >
                  {copy.heroHeadingHighlight}
                </span>
                <span
                  aria-hidden="true"
                  className={`col-start-1 row-start-1 block transition-transform duration-400 ease-out group-hover/roll:translate-y-0 text-[#429AD4] ${
                    headingRolled ? 'translate-y-0' : 'translate-y-full'
                  }`}
                >
                  {copy.heroHeadingHighlightRoll}
                </span>
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 sm:mt-8 max-w-xl mx-auto text-sm sm:text-xl text-[#434445] dark:text-white/70"
          >
            {copy.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              onClick={onOpenBrief}
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#F8B033]/88 backdrop-blur-xl ring-1 ring-inset ring-white/45 text-[#1C1D1E] px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-bold hover:bg-[#1C1D1E] hover:text-white dark:hover:bg-white dark:hover:text-[#1C1D1E] shadow-lg shadow-[#F8B033]/20 hover:shadow-xl transition-colors duration-350 ease-out cursor-pointer"
            >
              <span>{copy.heroPrimaryCta}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.button>

            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-full bg-white/45 dark:bg-white/[0.07] backdrop-blur-2xl border border-black/10 dark:border-white/15 ring-1 ring-inset ring-white/50 dark:ring-white/10 px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-[#1C1D1E] dark:text-white hover:bg-white/75 dark:hover:bg-white/16 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97] hover:shadow-md transition-all duration-350 ease-out shadow-xs"
            >
              <span>{copy.heroSecondaryCta}</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Subtle Scroll Indicator at Bottom of Full-Screen Hero */}
        <motion.a
          href="#studio-reel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.05 }}
          aria-label="Scroll to founder video"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#68696A] dark:text-white/45 hover:text-[#429AD4] dark:hover:text-[#F8B033] transition-colors duration-300 ease-out"
        >
          <span>{copy.heroScrollLabel}</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </motion.a>
      </div>

      {/* PART 2: Single Founder Services Explanation Video Stage */}
      <div
        id="studio-reel"
        ref={videoTrackRef}
        className="scroll-mt-20 relative px-3 sm:px-6 lg:px-8 pb-8 sm:pb-14"
      >
        <motion.div
          style={{
            scale: cardScale,
            borderRadius: cardRadius,
          }}
          className="max-w-[1380px] mx-auto p-2 sm:p-3.5 bg-white/55 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/15 ring-1 ring-inset ring-white/50 dark:ring-white/12 shadow-2xl will-change-transform origin-top"
        >
          <button
            type="button"
            onClick={onOpenShowreel}
            aria-label="Play Muhammad Amaan services introduction video"
            className="group relative block w-full h-[38vh] min-h-[250px] sm:h-[72vh] sm:min-h-[460px] max-h-[740px] rounded-[20px] sm:rounded-[28px] bg-[#111318] overflow-hidden cursor-pointer text-left"
          >
            {/* Atmospheric Dark Architectural Stage with Subtle Gold Lighting */}
            <motion.div
              style={{ scale: innerImageScale }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_24%_25%,rgba(248,176,51,0.14),transparent_52%),linear-gradient(135deg,#1d1d1f_0%,#121213_55%,#09090a_100%)] will-change-transform"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 studio-work-band-dots opacity-75 pointer-events-none"
            />

            {/* Properly Padded Founder Portrait Backdrop */}
            <div className="absolute inset-0 flex items-end justify-center sm:justify-end sm:pr-14 lg:pr-24 pt-8 sm:pt-12 px-6 pointer-events-none">
              <img
                src={brand.founderAvatar}
                alt={`${brand.founderName} introducing ${brand.fullName} services`}
                className="h-full max-h-[86%] w-auto object-contain object-bottom opacity-85 sm:opacity-95 transition-transform duration-700 ease-out group-hover:scale-[1.03] drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/35 sm:to-transparent" />

            {/* Centered Play Button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
              <div className="relative flex items-center justify-center">
                <span
                  aria-hidden="true"
                  className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#F8B033]/20 animate-ping"
                  style={{ animationDuration: '2.6s' }}
                />
                <span className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/80 backdrop-blur-2xl ring-2 ring-inset ring-white/75 text-[#1C1D1E] flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#F8B033] transition-all duration-350 ease-out">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-0.5 sm:ml-1" />
                </span>
              </div>

              <div className="mt-4 sm:mt-5 inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-xl ring-1 ring-inset ring-white/20 px-3.5 sm:px-4 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F8B033]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#429AD4]" />
                <span>{copy.videoBadgeLabel}</span>
              </div>
            </div>

            {/* Bottom Corner Founder Video Caption */}
            <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-7 sm:left-7 sm:right-7 flex items-end justify-between gap-4 text-white">
              <div className="rounded-xl sm:rounded-2xl bg-black/45 backdrop-blur-xl ring-1 ring-inset ring-white/18 px-3 sm:px-4 py-2 sm:py-2.5 max-w-md">
                <div className="text-[9px] sm:text-xs font-semibold uppercase tracking-widest text-[#429AD4]">
                  {copy.videoEyebrow}
                </div>
                <div className="font-display text-xs sm:text-lg font-bold tracking-tight mt-0.5">
                  {copy.videoHeadline}
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-xl ring-1 ring-inset ring-white/15 px-3.5 py-2 text-xs font-semibold text-white/85 group-hover:text-white group-hover:bg-black/60 transition-all duration-300 ease-out">
                <span>{copy.videoCtaLabel}</span>
                <ArrowUpRight className="w-4 h-4 text-[#F8B033] transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
};
