import React, { useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { DEFAULT_SITE_COPY, NICHE_TABS, STUDIO_BRAND } from '../data/studioData';
import { NicheId, SiteCopyConfig, StudioBrandConfig } from '../types/studio';

interface FooterCTAProps {
  onOpenBrief: (niche?: NicheId) => void;
  brand?: StudioBrandConfig;
  copy?: SiteCopyConfig;
}

export const FooterCTA: React.FC<FooterCTAProps> = ({
  onOpenBrief,
  brand = STUDIO_BRAND,
  copy = DEFAULT_SITE_COPY,
}) => {
  const [copied, setCopied] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'start 0.35'],
  });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 24 });
  const footerScale = useTransform(smoothScroll, [0, 1], [0.95, 1]);
  const footerY = useTransform(smoothScroll, [0, 1], [32, 0]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(brand.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback handled by mailto link
    }
  };

  return (
    <motion.footer
      ref={footerRef}
      style={{ scale: footerScale, y: footerY }}
      className="relative overflow-clip studio-dark-band text-white rounded-t-[28px] md:rounded-t-[56px] pt-12 sm:pt-22 pb-28 md:pb-10 origin-bottom will-change-transform border-t border-white/12 ring-1 ring-inset ring-white/10"
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
        <div className="pb-10 sm:pb-16 border-b border-white/12">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 mb-3 sm:mb-4">
            {copy.footerEyebrow}
          </div>

          <button
            type="button"
            onClick={() => onOpenBrief()}
            className="inline-flex flex-wrap items-center gap-4 sm:gap-8 text-left cursor-pointer"
          >
            <span className="group/talk relative inline-grid overflow-hidden whitespace-nowrap font-display text-[clamp(3rem,11vw,9.5rem)] font-bold leading-[0.95] tracking-[-0.045em]">
              <span className="col-start-1 row-start-1 block transition-transform duration-400 ease-out group-hover/talk:-translate-y-full text-white">
                {copy.footerCtaPhrase}
              </span>
              <span
                aria-hidden="true"
                className="col-start-1 row-start-1 block translate-y-full transition-transform duration-400 ease-out group-hover/talk:translate-y-0 text-[#F8B033]"
              >
                {copy.footerCtaPhraseRoll}
              </span>
            </span>

            <span className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#F8B033]/92 backdrop-blur-xl ring-1 ring-inset ring-white/45 text-[#1C1D1E] flex items-center justify-center shadow-lg hover:rotate-12 hover:scale-105 transition-transform duration-300 ease-out">
              <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </span>
          </button>

          <p className="mt-4 sm:mt-5 max-w-md text-sm sm:text-base text-white/70">
            {copy.footerSubtitle}
          </p>
        </div>

        <div className="py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-sm">
          <div>
            <img
              src={brand.logoNegative}
              alt={brand.fullName}
              width={128}
              height={62}
              className="h-8 w-auto object-contain mb-5"
            />
            <ul className="space-y-2.5 text-white/80">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenBrief()}
                  className="hover:text-[#F8B033] transition-colors duration-300 ease-out cursor-pointer font-semibold text-white"
                >
                  Start a Project Brief
                </button>
              </li>
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  className="hover:text-[#F8B033] transition-colors duration-300 ease-out"
                >
                  {brand.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${brand.phone.replace(/\s+/g, '')}`}
                  className="hover:text-[#F8B033] transition-colors duration-300 ease-out tabular-nums"
                >
                  {brand.phone}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors duration-300 ease-out cursor-pointer pt-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#F8B033]" />
                      <span className="text-[#F8B033]">Copied {brand.email}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy studio email</span>
                    </>
                  )}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-4">
              Specialties
            </div>
            <ul className="space-y-2.5 text-white/80">
              {NICHE_TABS.filter((tab) => tab.id !== 'all').map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => onOpenBrief(tab.id as NicheId)}
                    className="hover:text-[#F8B033] transition-colors duration-300 ease-out cursor-pointer"
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-4">
              Navigate & Social
            </div>
            <ul className="space-y-2.5 text-white/80">
              <li>
                <a href="#work" className="hover:text-[#F8B033] transition-colors duration-300 ease-out">
                  Selected Work
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-[#F8B033] transition-colors duration-300 ease-out">
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#F8B033] transition-colors duration-300 ease-out">
                  About Amaan
                </a>
              </li>
              <li>
                <a
                  href={brand.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F8B033] transition-colors duration-300 ease-out"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={brand.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F8B033] transition-colors duration-300 ease-out"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-4">
              Studio
            </div>
            <p className="text-white/80 leading-relaxed">{brand.location}</p>
            <div className="mt-3 text-xs text-white/50">{brand.domain}</div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/45">
          <div>© {new Date().getFullYear()} {brand.fullName}.</div>
          <div>{copy.footerTagline}</div>
        </div>
      </div>
    </motion.footer>
  );
};
