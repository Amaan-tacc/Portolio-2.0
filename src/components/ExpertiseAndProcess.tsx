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
  DEFAULT_SITE_COPY,
  PROCESS_STEPS,
  SERVICE_DISCIPLINES,
  STUDIO_BRAND,
  TESTIMONIALS,
} from '../data/studioData';
import {
  NicheId,
  ProcessStep,
  ServiceDiscipline,
  SiteCopyConfig,
  StudioBrandConfig,
  Testimonial,
} from '../types/studio';

interface ExpertiseAndProcessProps {
  onScopeService: (niche: NicheId) => void;
  services?: ServiceDiscipline[];
  processSteps?: ProcessStep[];
  testimonials?: Testimonial[];
  brand?: StudioBrandConfig;
  copy?: SiteCopyConfig;
}

export const ExpertiseAndProcess: React.FC<ExpertiseAndProcessProps> = ({
  onScopeService,
  services = SERVICE_DISCIPLINES,
  processSteps = PROCESS_STEPS,
  testimonials = TESTIMONIALS,
  brand = STUDIO_BRAND,
  copy = DEFAULT_SITE_COPY,
}) => {
  const [expandedId, setExpandedId] = useState<NicheId | null>('brand-identity');

  const aboutRef = useRef<HTMLElement>(null);
  const { scrollYProgress: aboutScroll } = useScroll({
    target: aboutRef,
    offset: ['start end', 'end start'],
  });
  const smoothAboutScroll = useSpring(aboutScroll, { stiffness: 100, damping: 24 });
  const avatarImgY = useTransform(smoothAboutScroll, [0, 1], [6, 0]);
  const oddStepY = useTransform(smoothAboutScroll, [0, 1], [16, -16]);
  const evenStepY = useTransform(smoothAboutScroll, [0, 1], [-12, 20]);

  return (
    <div className="bg-transparent text-[#1C1D1E] dark:text-white transition-colors duration-500">
      {/* Section 1: Sticky Left Heading + Slow Expandable Capabilities */}
      <section
        id="specialties"
        className="scroll-mt-20 sm:scroll-mt-24 py-12 sm:py-20 border-t border-[#DEDEDE] dark:border-white/10"
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-4 lg:sticky lg:top-28"
            >
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#68696A] dark:text-white/55 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#429AD4]" aria-hidden="true" />
                <span>{copy.specialtiesEyebrow}</span>
              </div>
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.85rem)] font-bold leading-[1.0] tracking-[-0.038em] text-balance">
                {copy.specialtiesHeading}
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#434445] dark:text-white/70">
                {copy.specialtiesSubtitle}
              </p>
            </motion.div>

            <div className="lg:col-span-8 border-t border-[#DEDEDE] dark:border-white/12">
              {services.map((service, idx) => {
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
                      className="w-full py-4 sm:py-7 flex items-center justify-between gap-4 sm:gap-6 text-left cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8">
                        <span className="text-[11px] sm:text-sm font-bold text-[#68696A] dark:text-white/50 tabular-nums transition-colors duration-300 ease-out group-hover:text-[#F8B033]">
                          {service.number}
                        </span>
                        <span className="font-display text-lg sm:text-3xl font-bold tracking-tight text-[#1C1D1E] dark:text-white transition-transform duration-300 ease-out group-hover:translate-x-2">
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
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border backdrop-blur-xl ring-1 ring-inset flex items-center justify-center transition-colors duration-300 ease-out ${
                            isOpen
                              ? 'bg-[#1C1D1E]/90 dark:bg-white/90 text-white dark:text-[#1C1D1E] border-transparent ring-white/25 dark:ring-black/10'
                              : 'bg-white/55 dark:bg-white/[0.06] border-black/10 dark:border-white/14 ring-white/45 dark:ring-white/10 text-[#1C1D1E] dark:text-white group-hover:bg-[#1C1D1E] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#1C1D1E]'
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
                          <div className="pb-6 sm:pb-8 sm:pl-14 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                            <div className="md:col-span-6 space-y-3 sm:space-y-4">
                              <p className="text-sm sm:text-base text-[#1C1D1E] dark:text-white/80 leading-relaxed">
                                {service.tagline}
                              </p>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.03, y: -1 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                                onClick={() => onScopeService(service.id)}
                                className="group/cta inline-flex items-center gap-2 rounded-full bg-[#1C1D1E]/88 dark:bg-white/90 backdrop-blur-xl ring-1 ring-inset ring-white/20 dark:ring-black/10 text-white dark:text-[#1C1D1E] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold hover:bg-[#F8B033] dark:hover:bg-[#F8B033] hover:text-[#1C1D1E] transition-colors duration-350 ease-out cursor-pointer"
                              >
                                <span>Start {service.title}</span>
                                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                              </motion.button>
                            </div>

                            <div className="md:col-span-6 bg-white/58 dark:bg-white/[0.06] backdrop-blur-2xl rounded-2xl p-4 sm:p-5 border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/45 dark:ring-white/10">
                              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#68696A] dark:text-white/50 mb-2.5 sm:mb-3">
                                Deliverables
                              </div>
                              <ul className="space-y-1.5 sm:space-y-2">
                                {service.deliverables.map((item) => (
                                  <li
                                    key={item}
                                    className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1C1D1E] dark:text-white/85"
                                  >
                                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 shrink-0 text-[#F8B033]" />
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
        className="scroll-mt-20 sm:scroll-mt-24 py-12 sm:py-20 bg-white/22 dark:bg-white/[0.03] backdrop-blur-md border-y border-black/10 dark:border-white/10 overflow-x-clip transition-colors duration-500"
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 space-y-10 sm:space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[22px] sm:rounded-[32px] bg-white/62 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/45 dark:ring-white/10 p-5 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center shadow-sm"
          >
            {/* Properly Padded & Unclipped Founder Portrait Frame */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-[205px] sm:max-w-[275px] rounded-[22px] sm:rounded-[26px] p-1.5 bg-white/55 dark:bg-white/[0.05] backdrop-blur-xl border border-black/10 dark:border-white/14 ring-1 ring-inset ring-white/45 dark:ring-white/10 mx-auto shadow-sm">
                <div className="relative w-full h-full rounded-[16px] sm:rounded-[20px] overflow-hidden bg-gradient-to-b from-[#F5F5F6] to-[#E8E8EA] dark:from-[#262628] dark:to-[#18181A] aspect-[4/5] pt-6 sm:pt-8 px-5 sm:px-7 pb-0 flex items-end justify-center">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(248,176,51,0.16),transparent_58%)] pointer-events-none"
                  />
                  <motion.img
                    style={{ y: avatarImgY }}
                    src={brand.founderAvatar}
                    alt={`${brand.founderName}, founder of ${brand.name}`}
                    loading="lazy"
                    className="relative z-10 w-full h-full object-contain object-bottom will-change-transform drop-shadow-md"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-3 sm:space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-[#68696A] dark:text-white/55">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F8B033]" aria-hidden="true" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#429AD4]" aria-hidden="true" />
                <span>{copy.aboutEyebrow}</span>
              </div>
              <h2 className="font-display text-xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1D1E] dark:text-white">
                {copy.aboutHeading}
              </h2>
              <p className="text-xs sm:text-lg text-[#434445] dark:text-white/75 leading-relaxed">
                {copy.aboutBody}
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-3 text-sm font-medium">
                {[
                  ['Email', `mailto:${brand.email}`], ['LinkedIn', brand.linkedinUrl],
                  ['Instagram', brand.instagramUrl], ['YouTube', 'https://www.youtube.com/@amaanity'],
                  ['WhatsApp', brand.whatsappUrl],
                ].map(([label, href]) => (
                  <a key={label} href={href} target={label === 'Email' ? undefined : '_blank'} rel="noreferrer" className="text-[#1D6FA5] dark:text-[#F8B033] hover:underline underline-offset-4 transition-opacity hover:opacity-75">{label === 'Email' ? brand.email : label}</a>
                ))}
              </div>

              <div className="pt-3 sm:pt-4 border-t border-black/10 dark:border-white/12 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#68696A] dark:text-white/50">
                <span className="inline-flex items-center gap-1.5 text-[#429AD4]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#429AD4]" aria-hidden="true" />
                  <span>{copy.aboutFocusLabel}</span>
                </span>
                <span className="text-[#1C1D1E] dark:text-white/85">
                  {copy.aboutFocusText}
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
              className="max-w-xl mb-7 sm:mb-10"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#68696A] dark:text-white/55 mb-2">
                {copy.processEyebrow}
              </div>
              <h2 className="font-display text-[clamp(1.85rem,4vw,3.1rem)] font-bold leading-[1.05] tracking-[-0.03em]">
                {copy.processHeading}
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {processSteps.map((step, index) => (
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
                  className="rounded-[20px] sm:rounded-3xl bg-white/62 dark:bg-white/[0.06] backdrop-blur-2xl border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/45 dark:ring-white/10 p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl transition-shadow duration-300 will-change-transform"
                >
                  <div>
                    <div
                      className={`font-display text-2xl sm:text-3xl font-bold tracking-tight tabular-nums mb-2 sm:mb-3 ${
                        index % 2 === 0 ? 'text-[#F8B033]' : 'text-[#429AD4]'
                      }`}
                    >
                      {step.step}
                    </div>
                    <h3 className="font-display text-base sm:text-xl font-bold tracking-tight mb-1.5 sm:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#434445] dark:text-white/70 leading-snug sm:leading-normal">
                      {step.description}
                    </p>
                  </div>
                  <div className="mt-3.5 sm:mt-5 pt-2.5 sm:pt-3 border-t border-black/10 dark:border-white/12 text-[11px] sm:text-xs font-semibold text-[#1C1D1E] dark:text-white/90">
                    {step.handoffNote}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Client Proof */}
      <section id="reviews" className="scroll-mt-20 sm:scroll-mt-24 py-12 sm:py-20">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-7 sm:mb-10"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#68696A] dark:text-white/55 mb-2">
              {copy.reviewsEyebrow}
            </div>
            <h2 className="font-display text-[clamp(1.85rem,4vw,3.1rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              {copy.reviewsHeading}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((review, index) => (
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
                className="rounded-[22px] sm:rounded-3xl border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/45 dark:ring-white/10 p-5 sm:p-7 flex flex-col justify-between bg-white/62 dark:bg-white/[0.06] backdrop-blur-2xl shadow-xs hover:shadow-xl transition-shadow duration-300"
              >
                <div>
                  <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#68696A] dark:text-white/50 mb-2.5 sm:mb-3">
                    {review.scope}
                  </div>
                  <p className="text-sm sm:text-base font-medium leading-relaxed text-[#1C1D1E] dark:text-white/90">
                    “{review.quote}”
                  </p>
                </div>

                <footer className="mt-5 sm:mt-7 pt-3 sm:pt-4 border-t border-black/10 dark:border-white/12">
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
