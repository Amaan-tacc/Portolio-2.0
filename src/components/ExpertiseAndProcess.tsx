import React, { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowUpRight, Check, Plus } from 'lucide-react';
import {
  PROCESS_STEPS,
  SERVICE_DISCIPLINES,
  STUDIO_BRAND,
  TESTIMONIALS,
} from '../data/studioData';
import { NicheId } from '../types/studio';

interface ExpertiseAndProcessProps {
  onScopeService: (niche: NicheId) => void;
}

export const ExpertiseAndProcess: React.FC<ExpertiseAndProcessProps> = ({ onScopeService }) => {
  const [expandedId, setExpandedId] = useState<NicheId | null>('brand-identity');

  const aboutRef = useRef<HTMLElement>(null);
  const { scrollYProgress: aboutScroll } = useScroll({
    target: aboutRef,
    offset: ['start end', 'end start'],
  });
  const smoothAboutScroll = useSpring(aboutScroll, { stiffness: 100, damping: 24 });
  const avatarImgY = useTransform(smoothAboutScroll, [0, 1], [-20, 20]);
  const oddStepY = useTransform(smoothAboutScroll, [0, 1], [16, -16]);
  const evenStepY = useTransform(smoothAboutScroll, [0, 1], [-12, 20]);

  return (
    <div className="bg-transparent text-[#1C1D1E] dark:text-white transition-colors duration-500">
      {/* Section 1: Sticky Left Heading + Slow Expandable Capabilities */}
      <section id="specialties" className="py-16 sm:py-24 border-t border-[#DEDEDE] dark:border-white/10">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-4 lg:sticky lg:top-28"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#68696A] dark:text-white/55 mb-2">
                What We Do
              </div>
              <h2 className="font-display text-[clamp(2.1rem,4.5vw,3.85rem)] font-bold leading-[1.0] tracking-[-0.038em] text-balance">
                Five specialties. One team.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#434445] dark:text-white/70">
                Branding, books, print, game art & illustration under one roof.
              </p>
            </motion.div>

            <div className="lg:col-span-8 border-t border-[#DEDEDE] dark:border-white/12">
              {SERVICE_DISCIPLINES.map((service, idx) => {
                const isOpen = expandedId === service.id;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-[#DEDEDE] dark:border-white/12"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setExpandedId(isOpen ? null : service.id)}
                      className="w-full py-6 sm:py-8 flex items-start sm:items-center justify-between gap-4 sm:gap-6 text-left cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-8">
                        <span className="text-xs sm:text-sm font-bold text-[#68696A] dark:text-white/50 tabular-nums transition-colors group-hover:text-[#F8B033]">
                          {service.number}
                        </span>
                        <span className="font-display text-xl sm:text-3xl font-bold tracking-tight text-[#1C1D1E] dark:text-white transition-transform duration-300 group-hover:translate-x-2">
                          {service.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-[#68696A] dark:text-white/50 tabular-nums">
                          {service.turnaround}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                          className={`w-9 h-9 rounded-full border backdrop-blur-md flex items-center justify-center transition-colors ${
                            isOpen
                              ? 'bg-[#1C1D1E] dark:bg-white text-white dark:text-[#1C1D1E] border-transparent'
                              : 'bg-black/4 dark:bg-white/6 border-[#DEDEDE] dark:border-white/15 text-[#1C1D1E] dark:text-white group-hover:bg-[#1C1D1E] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#1C1D1E]'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </motion.span>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pb-8 sm:pl-14 grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-6 space-y-4">
                              <p className="text-sm sm:text-base text-[#1C1D1E] dark:text-white/80 leading-relaxed">
                                {service.tagline}
                              </p>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                                onClick={() => onScopeService(service.id)}
                                className="inline-flex items-center gap-2 rounded-full bg-[#1C1D1E]/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-[#1C1D1E] px-5 py-2.5 text-sm font-semibold hover:bg-[#F8B033] dark:hover:bg-[#F8B033] hover:text-[#1C1D1E] transition-colors cursor-pointer"
                              >
                                <span>Start {service.title}</span>
                                <ArrowUpRight className="w-4 h-4" />
                              </motion.button>
                            </div>

                            <div className="md:col-span-6 bg-[#F4F4F4]/80 dark:bg-white/6 backdrop-blur-md rounded-2xl p-5 border border-[#DEDEDE] dark:border-white/12">
                              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#68696A] dark:text-white/50 mb-3">
                                Deliverables
                              </div>
                              <ul className="space-y-2">
                                {service.deliverables.map((item) => (
                                  <li
                                    key={item}
                                    className="flex items-start gap-2.5 text-sm text-[#1C1D1E] dark:text-white/85"
                                  >
                                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#F8B033]" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Centered Founder Card + Staggered Process Steps */}
      <section
        ref={aboutRef}
        id="about"
        className="py-16 sm:py-24 bg-black/[0.03] dark:bg-white/[0.025] backdrop-blur-[2px] border-y border-black/10 dark:border-white/10 overflow-x-clip transition-colors duration-500"
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[28px] sm:rounded-[32px] bg-white/80 dark:bg-white/6 backdrop-blur-xl border border-[#DEDEDE] dark:border-white/12 p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Properly Centered Founder Portrait Frame */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-[270px] rounded-[24px] overflow-hidden bg-[#F4F4F4] dark:bg-[#222324] aspect-[3/4] mx-auto shadow-sm">
                <motion.img
                  style={{ y: avatarImgY }}
                  src={STUDIO_BRAND.founderAvatar}
                  alt="Muhammad Amaan, founder of Amaanity"
                  loading="lazy"
                  className="w-full h-[112%] -mt-[6%] object-cover object-center will-change-transform"
                />
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#68696A] dark:text-white/55">
                Muhammad Amaan · Creative Lead
              </div>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1D1E] dark:text-white">
                One lead keeping your whole project connected.
              </h2>
              <p className="text-sm sm:text-lg text-[#434445] dark:text-white/75 leading-relaxed">
                I work directly with clients and guide our specialist designers from first brief through final press and game-ready files.
              </p>

              <div className="pt-4 border-t border-[#DEDEDE] dark:border-white/12 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-wider text-[#68696A] dark:text-white/50">
                <span>Stack</span>
                <span className="text-[#1C1D1E] dark:text-white/85">
                  Illustrator · Photoshop · Figma · Trello · GameAnalytics
                </span>
              </div>
            </div>
          </motion.div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl mb-10"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#68696A] dark:text-white/55 mb-2">
                Process
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3.1rem)] font-bold leading-[1.05] tracking-[-0.03em]">
                Brief to handoff in four steps.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {PROCESS_STEPS.map((step, index) => (
                <motion.div
                  key={step.step}
                  style={{ y: index % 2 === 0 ? oddStepY : evenStepY }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    opacity: { duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] },
                    scale: { type: 'spring', stiffness: 300, damping: 24 },
                  }}
                  className="rounded-3xl bg-white/80 dark:bg-white/6 backdrop-blur-lg border border-[#DEDEDE] dark:border-white/12 p-6 flex flex-col justify-between shadow-xs hover:shadow-xl transition-shadow duration-300 will-change-transform"
                >
                  <div>
                    <div className="font-display text-3xl font-bold tracking-tight text-[#F8B033] tabular-nums mb-3">
                      {step.step}
                    </div>
                    <h3 className="font-display text-xl font-bold tracking-tight mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#434445] dark:text-white/70">{step.description}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#DEDEDE] dark:border-white/12 text-xs font-semibold text-[#1C1D1E] dark:text-white/90">
                    {step.handoffNote}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Client Proof */}
      <section id="reviews" className="py-16 sm:py-22">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10 sm:mb-12"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#68696A] dark:text-white/55 mb-2">
                Client Proof
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3.1rem)] font-bold leading-[1.05] tracking-[-0.03em]">
                Why clients stay with Amaanity.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {TESTIMONIALS.map((review, index) => (
                <motion.blockquote
                  key={review.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    opacity: { duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] },
                    y: { type: 'spring', stiffness: 320, damping: 24 },
                  }}
                  className="rounded-3xl border border-[#DEDEDE] dark:border-white/12 p-6 sm:p-7 flex flex-col justify-between bg-white/80 dark:bg-white/6 backdrop-blur-lg shadow-xs hover:shadow-xl transition-shadow duration-300"
                >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#68696A] dark:text-white/50 mb-3">
                    {review.scope}
                  </div>
                  <p className="text-sm sm:text-base font-medium leading-relaxed text-[#1C1D1E] dark:text-white/90">
                    “{review.quote}”
                  </p>
                </div>

                <footer className="mt-7 pt-4 border-t border-[#DEDEDE] dark:border-white/12">
                  <div className="text-sm font-bold text-[#1C1D1E] dark:text-white">{review.author}</div>
                  <div className="text-xs text-[#68696A] dark:text-white/55 mt-0.5">{review.role}</div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
