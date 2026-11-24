import { responsiveImage } from '../lib/responsiveImage';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { CaseStudy, NicheId } from '../types/studio';

interface CaseStudyDrawerProps {
  study: CaseStudy | null;
  onClose: () => void;
  onRequestSimilar: (niche: NicheId) => void;
}

export const CaseStudyDrawer: React.FC<CaseStudyDrawerProps> = ({
  study,
  onClose,
  onRequestSimilar,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    setActiveImageIdx(0);
  }, [study?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (study) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [study, onClose]);

  const activeImage = study ? study.galleryImages[activeImageIdx] ?? study.heroImage : '';

  return (
    <AnimatePresence>
      {study && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`${study.title} case study`}
        >
          {/* Translucent Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/62 backdrop-blur-xl"
          />

          {/* Slide-Over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            data-lenis-prevent
            data-project-scroll
            tabIndex={-1}
            className="relative z-10 w-full max-w-3xl bg-white/86 dark:bg-[#181A1E]/88 backdrop-blur-2xl text-[#1C1D1E] dark:text-white h-[100dvh] min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-y] shadow-2xl flex flex-col border-l border-black/10 dark:border-white/14 ring-1 ring-inset ring-white/40 dark:ring-white/10"
          >
            {/* Translucent Sticky Header */}
            <div className="shrink-0 sticky top-0 z-20 bg-white/70 dark:bg-[#181A1E]/72 backdrop-blur-2xl border-b border-black/10 dark:border-white/10 px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
              <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#68696A] dark:text-white/55 truncate">
                {study.indexNumber} · {study.nicheLabel} · {study.client}
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                onClick={onClose}
                aria-label="Close case study drawer"
                className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-white/55 dark:bg-white/10 backdrop-blur-xl border border-black/10 dark:border-white/15 ring-1 ring-inset ring-white/45 dark:ring-white/10 flex items-center justify-center hover:bg-[#1C1D1E] dark:hover:bg-white hover:text-white dark:hover:text-[#1C1D1E] transition-colors duration-300 ease-out cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Staggered Case Study Content */}
            <div className="p-4 sm:p-9 space-y-6 sm:space-y-8 flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
                  {study.title}
                </h2>
                <p className="mt-2.5 sm:mt-3 text-sm sm:text-lg text-[#434445] dark:text-white/75 leading-relaxed">
                  {study.summary}
                </p>

                <div className="mt-4 sm:mt-5 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-semibold text-[#1C1D1E] dark:text-white/85">
                  {study.specs.map((spec, idx) => (
                    <span key={spec} className="inline-flex items-center gap-3 sm:gap-4">
                      <span>{spec}</span>
                      {idx < study.specs.length - 1 && (
                        <span className="text-black/25 dark:text-white/25" aria-hidden="true">
                          /
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Animated Crossfade Multi-Image Gallery inside Padded Frosted Mat */}
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2.5 sm:space-y-3"
              >
                <div className="p-2 sm:p-2.5 rounded-[22px] sm:rounded-[26px] bg-black/[0.045] dark:bg-white/[0.045] backdrop-blur-2xl border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/45 dark:ring-white/10 shadow-sm">
                  <div className="rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[#F4F4F4] dark:bg-[#141517] aspect-[16/10] relative">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImage}
                        src={activeImage}
                      {...responsiveImage(activeImage, '(min-width: 768px) 700px, 95vw')}
                        alt={`${study.title} view ${activeImageIdx + 1}`}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  </div>
                </div>

                {study.galleryImages.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-2.5">
                    {study.galleryImages.map((imgUrl, idx) => {
                      const active = idx === activeImageIdx;
                      return (
                        <motion.button
                          key={imgUrl}
                          type="button"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setActiveImageIdx(idx)}
                          className="relative rounded-xl p-1 bg-black/[0.04] dark:bg-white/[0.05] backdrop-blur-md border border-black/10 dark:border-white/12 aspect-[4/3] cursor-pointer"
                        >
                          <div className="w-full h-full rounded-lg overflow-hidden">
                            <img
                              src={imgUrl}
                      {...responsiveImage(imgUrl, '(min-width: 768px) 130px, 22vw')}
                              alt={`${study.title} thumbnail ${idx + 1}`}
                              className={`w-full h-full object-cover transition-opacity duration-300 ${
                                active ? 'opacity-100' : 'opacity-55 hover:opacity-90'
                              }`}
                            />
                          </div>
                          {active && (
                            <motion.span
                              layoutId="drawer-thumb-ring"
                              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                              className="absolute inset-0 rounded-xl border-2 border-[#F8B033] pointer-events-none"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Outcome Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl p-5 sm:p-6 text-[#1C1D1E] ring-1 ring-inset ring-white/35 shadow-sm"
                style={{ backgroundColor: study.accentHex }}
              >
                <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-black/65">
                  Delivery Outcome
                </div>
                <div className="mt-1 font-display text-xl sm:text-3xl font-bold tracking-tight">
                  {study.outcomeMetric}
                </div>
                <p className="mt-1 text-xs sm:text-sm text-black/80">{study.outcomeContext}</p>
              </motion.div>

              {/* Challenge vs Solution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
              >
                <div className="rounded-2xl bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl p-4 sm:p-6 border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/45 dark:ring-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#68696A] dark:text-white/50 mb-2">
                    01 / Challenge
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1C1D1E] dark:text-white/85 leading-relaxed">
                    {study.challenge}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl p-4 sm:p-6 border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/45 dark:ring-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#68696A] dark:text-white/50 mb-2">
                    02 / Execution
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1C1D1E] dark:text-white/85 leading-relaxed">
                    {study.solution}
                  </p>
                </div>
              </motion.div>

              {/* Deliverables Checklist with Staggered Reveal */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#68696A] dark:text-white/50 mb-3">
                  Delivered Scope
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {study.deliverables.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.32,
                        delay: 0.24 + i * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1C1D1E] dark:text-white/90 bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/45 dark:ring-white/10"
                    >
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#F8B033]" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Translucent Sticky Bottom Conversion CTA */}
            <div className="shrink-0 sticky bottom-0 bg-white/70 dark:bg-[#181A1E]/72 backdrop-blur-2xl border-t border-black/10 dark:border-white/10 px-4 sm:px-8 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-[#68696A] dark:text-white/60">
                Want similar production craft?
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                onClick={() => {
                  const targetNiche = study.niche;
                  onClose();
                  onRequestSimilar(targetNiche);
                }}
                className="group inline-flex items-center gap-2 rounded-full bg-[#1C1D1E]/90 dark:bg-white/90 backdrop-blur-xl ring-1 ring-inset ring-white/20 dark:ring-black/10 text-white dark:text-[#1C1D1E] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold hover:bg-[#F8B033] dark:hover:bg-[#F8B033] hover:text-[#1C1D1E] transition-colors duration-350 ease-out cursor-pointer"
              >
                <span>Request Similar Scope</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
