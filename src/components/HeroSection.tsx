import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowUpRight, Play } from 'lucide-react';
import { CaseStudy } from '../types/studio';

interface HeroSectionProps {
  onOpenBrief: () => void;
  onOpenShowreel: () => void;
  onSelectCaseStudy?: (study: CaseStudy) => void;
}

const HEADLINE_WORDS = ['Bold', 'design.', 'Built', 'to', 'ship.'];

const REEL_THUMB_FRAMES = [
  {
    src: '/assets/amaanity/work/creating-talents.webp',
    label: 'Books & Educational Series',
  },
  {
    src: '/assets/amaanity/work/westvue.webp',
    label: 'Brand Identity Systems',
  },
  {
    src: '/assets/amaanity/work/far-organics.webp',
    label: 'Print & Packaging',
  },
  {
    src: '/assets/amaanity/work/quickgrade.webp',
    label: 'Game Art & Interactive UI',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBrief,
  onOpenShowreel,
}) => {
  const [frameIndex, setFrameIndex] = useState(0);

  const heroTitleRef = useRef<HTMLDivElement>(null);
  const videoTrackRef = useRef<HTMLDivElement>(null);

  // Subtle ambient thumbnail preview cycle (matches Uncode Creative Lab multi-bg effect)
  useEffect(() => {
    const interval = window.setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % REEL_THUMB_FRAMES.length);
    }, 3200);
    return () => window.clearInterval(interval);
  }, []);

  // 1) Full-screen Hero scroll parallax (keeps the smooth feel on main heading)
  const { scrollYProgress: titleScroll } = useScroll({
    target: heroTitleRef,
    offset: ['start start', 'end start'],
  });
  const headlineY = useTransform(titleScroll, [0, 1], [0, -72]);
  const headlineScale = useTransform(titleScroll, [0, 1], [1, 1.16]);
  const headlineOpacity = useTransform(titleScroll, [0, 0.78], [1, 0.08]);

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
      {/* PART 1: Full-Viewport Clean Editorial Main Heading (fills entire initial screen) */}
      <div
        ref={heroTitleRef}
        className="min-h-[calc(100svh-5.25rem)] flex flex-col justify-center items-center px-4 sm:px-8 pt-10 pb-14 text-center relative"
      >
        <motion.div
          style={{ y: headlineY, scale: headlineScale, opacity: headlineOpacity }}
          className="max-w-5xl mx-auto will-change-transform"
        >
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#68696A] dark:text-white/55 mb-5 sm:mb-7"
          >
            <span className="w-2 h-2 rounded-full bg-[#F8B033]" aria-hidden="true" />
            <span>Amaanity Studio · Full-Service Design Agency</span>
          </motion.p>

          {/* Main Heading Animation Speed Kept Exactly as Requested */}
          <h1
            className="font-display text-[clamp(3.15rem,9vw,8.25rem)] font-bold leading-[0.94] tracking-[-0.048em] text-[#1C1D1E] dark:text-white text-balance"
            aria-label="Bold design. Built to ship."
          >
            {HEADLINE_WORDS.map((word, idx) => {
              const isYellowWord = idx >= 3; // "to ship."
              return (
                <span
                  key={`${word}-${idx}`}
                  className="inline-block overflow-hidden mr-[0.22em] pb-1.5 align-top"
                >
                  <motion.span
                    initial={{ y: '118%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{
                      duration: 1.15,
                      delay: 0.08 + idx * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`inline-block ${isYellowWord ? 'text-[#F8B033]' : ''}`}
                  >
                    {word}
                  </motion.span>
                </span>
              );
            })}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 sm:mt-8 max-w-xl mx-auto text-sm sm:text-xl text-[#434445] dark:text-white/70"
          >
            Branding, books, print packaging, game art & illustration.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenBrief}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#F8B033]/92 backdrop-blur-md text-[#1C1D1E] px-7 py-3.5 text-sm sm:text-base font-bold hover:bg-[#1C1D1E] hover:text-white dark:hover:bg-white dark:hover:text-[#1C1D1E] border border-[#F8B033]/40 shadow-lg shadow-[#F8B033]/15 transition-colors cursor-pointer"
            >
              <span>Start a Project</span>
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>

            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-full bg-black/5 dark:bg-white/8 backdrop-blur-md border border-black/10 dark:border-white/15 px-6 py-3.5 text-sm sm:text-base font-semibold text-[#1C1D1E] dark:text-white hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
            >
              <span>See Work</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Subtle Scroll Indicator at Bottom of Full-Screen Hero */}
        <motion.a
          href="#studio-reel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.05 }}
          aria-label="Scroll to studio showreel"
          className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden sm:inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#68696A] dark:text-white/45 hover:text-[#1C1D1E] dark:hover:text-[#F8B033] transition-colors"
        >
          <span>Scroll to Watch Reel</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </motion.a>
      </div>

      {/* PART 2: Scroll-Revealed Expanding Clickable Video Thumbnail Stage (Creative Lab Effect) */}
      <div
        id="studio-reel"
        ref={videoTrackRef}
        className="relative px-3 sm:px-6 lg:px-8 pb-10 sm:pb-16"
      >
        <motion.div
          style={{
            scale: cardScale,
            borderRadius: cardRadius,
          }}
          className="max-w-[1380px] mx-auto overflow-hidden shadow-2xl border border-black/10 dark:border-white/12 bg-[#18191B] will-change-transform origin-top"
        >
          <button
            type="button"
            onClick={onOpenShowreel}
            aria-label="Play Amaanity Studio showreel video"
            className="group relative block w-full h-[54vh] min-h-[340px] sm:h-[78vh] sm:min-h-[520px] max-h-[820px] overflow-hidden cursor-pointer text-left"
          >
            {/* Cycling Background Showcase Stills */}
            {REEL_THUMB_FRAMES.map((frame, idx) => (
              <motion.img
                key={frame.src}
                style={{ scale: innerImageScale }}
                src={frame.src}
                alt={frame.label}
                initial={false}
                animate={{
                  opacity: idx === frameIndex ? 1 : 0,
                  scale: idx === frameIndex ? 1.04 : 1,
                }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full object-cover will-change-transform"
              />
            ))}

            {/* Atmospheric Cinema Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/25 group-hover:via-black/20 transition-colors duration-300" />

            {/* Centered Creative Lab Circular Play Trigger */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative flex items-center justify-center">
                <span
                  aria-hidden="true"
                  className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/15 animate-ping"
                  style={{ animationDuration: '2.6s' }}
                />
                <span className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/88 backdrop-blur-xl text-[#1C1D1E] flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#F8B033] transition-all duration-300">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                </span>
              </div>

              <div className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-black/45 backdrop-blur-md border border-white/18 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F8B033]" />
                <span>Play Studio Showreel · 0:30</span>
              </div>
            </div>

            {/* Bottom Corner Meta */}
            <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8 flex items-end justify-between gap-4 text-white">
              <div className="rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 px-4 py-2.5">
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#F8B033]">
                  Now Previewing
                </div>
                <div className="font-display text-sm sm:text-lg font-bold tracking-tight">
                  {REEL_THUMB_FRAMES[frameIndex].label}
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                <span>Click to watch reel</span>
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
};
