import React, { useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { NICHE_TABS, STUDIO_BRAND } from '../data/studioData';
import { NicheId } from '../types/studio';

interface FooterCTAProps {
  onOpenBrief: (niche?: NicheId) => void;
}

export const FooterCTA: React.FC<FooterCTAProps> = ({ onOpenBrief }) => {
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
      await navigator.clipboard.writeText(STUDIO_BRAND.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback handled by mailto link
    }
  };

  return (
    <motion.footer
      id="contact"
      ref={footerRef}
      style={{ scale: footerScale, y: footerY }}
      className="relative overflow-clip studio-dark-band text-white rounded-t-[32px] md:rounded-t-[56px] pt-16 sm:pt-24 pb-28 md:pb-10 origin-bottom will-change-transform border-t border-white/10"
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
        <div className="pb-14 sm:pb-18 border-b border-white/12">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 mb-4">
            Have a project in mind?
          </div>

          <button
            type="button"
            onClick={() => onOpenBrief()}
            className="group inline-flex flex-wrap items-center gap-4 sm:gap-8 text-left cursor-pointer"
          >
            <span className="relative overflow-hidden inline-block font-display text-[clamp(3.2rem,11vw,9.5rem)] font-bold leading-[0.95] tracking-[-0.045em]">
              <span className="block transition-transform duration-400 ease-out group-hover:-translate-y-full text-white">
                Let’s Talk
              </span>
              <span
                aria-hidden="true"
                className="block absolute inset-0 translate-y-full transition-transform duration-400 ease-out group-hover:translate-y-0 text-[#F8B033]"
              >
                Let’s Talk
              </span>
            </span>

            <span className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#F8B033]/95 backdrop-blur-md text-[#1C1D1E] flex items-center justify-center group-hover:rotate-12 group-hover:scale-105 transition-transform duration-300">
              <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </span>
          </button>

          <p className="mt-5 max-w-md text-sm sm:text-base text-white/70">
            Tell us what you’re building. Direct reply from Muhammad Amaan within 24 hours.
          </p>
        </div>

        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-sm">
          <div>
            <img
              src={STUDIO_BRAND.logoNegative}
              alt="Amaanity"
              width={128}
              height={62}
              className="h-8 w-auto object-contain mb-5"
            />
            <ul className="space-y-2.5 text-white/80">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenBrief()}
                  className="hover:text-[#F8B033] transition-colors cursor-pointer font-semibold text-white"
                >
                  Start a Project Brief
                </button>
              </li>
              <li>
                <a
                  href={`mailto:${STUDIO_BRAND.email}`}
                  className="hover:text-[#F8B033] transition-colors"
                >
                  {STUDIO_BRAND.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${STUDIO_BRAND.phone.replace(/\s+/g, '')}`}
                  className="hover:text-[#F8B033] transition-colors tabular-nums"
                >
                  {STUDIO_BRAND.phone}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors cursor-pointer pt-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#F8B033]" />
                      <span className="text-[#F8B033]">Copied {STUDIO_BRAND.email}</span>
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
                    className="hover:text-[#F8B033] transition-colors cursor-pointer"
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
                <a href="#work" className="hover:text-[#F8B033] transition-colors">
                  Selected Work
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-[#F8B033] transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#F8B033] transition-colors">
                  About Amaan
                </a>
              </li>
              <li>
                <a
                  href={STUDIO_BRAND.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F8B033] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={STUDIO_BRAND.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F8B033] transition-colors"
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
            <p className="text-white/80 leading-relaxed">{STUDIO_BRAND.location}</p>
            <div className="mt-3 text-xs text-white/50">{STUDIO_BRAND.domain}</div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/45">
          <div>© {new Date().getFullYear()} Amaanity Studio.</div>
          <div>Branding · Books · Print & Packaging · Game Art · Illustration</div>
        </div>
      </div>
    </motion.footer>
  );
};
