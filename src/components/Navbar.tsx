import React from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import { STUDIO_BRAND } from '../data/studioData';
import { StudioBrandConfig } from '../types/studio';

interface NavbarProps {
  isDark: boolean;
  onToggleDark: () => void;
  onOpenBrief: () => void;
  brand?: StudioBrandConfig;
}

const NAV_LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'Specialties', href: '#specialties' },
  { label: 'About', href: '#about' },
  { label: 'Reviews', href: '#reviews' },
];

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  onToggleDark,
  onOpenBrief,
  brand = STUDIO_BRAND,
}) => {
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 48);
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full pointer-events-none px-3 sm:px-6 pt-3 sm:pt-4">
      <div
        className={`pointer-events-auto mx-auto flex items-center justify-between gap-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? 'max-w-[1040px] h-14 sm:h-15 px-3.5 sm:px-5 rounded-full bg-white/68 dark:bg-[#1E2025]/74 backdrop-blur-2xl border border-black/10 dark:border-white/14 ring-1 ring-inset ring-white/45 dark:ring-white/12 shadow-xl'
            : 'max-w-[1380px] h-16 px-2 sm:px-4 rounded-full bg-transparent border border-transparent'
        }`}
      >
        {/* Left Zone: Amaanity Studio Mark */}
        <a
          href="#"
          aria-label="Amaanity home"
          className="flex items-center shrink-0 focus:outline-none pl-1 transition-transform duration-300 ease-out hover:scale-[1.03]"
        >
          <img
            src={isDark ? brand.logoNegative : brand.logoPositive}
            alt={brand.name}
            width={128}
            height={62}
            className={`w-auto object-contain transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              scrolled ? 'h-6 sm:h-7' : 'h-7 sm:h-8'
            }`}
          />
        </a>

        {/* Center Zone: Floating Glass Pill Nav Links on Desktop */}
        <nav
          aria-label="Primary Navigation"
          className={`hidden md:flex items-center gap-1 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            scrolled
              ? 'px-1 py-0.5'
              : 'bg-white/50 dark:bg-white/[0.07] backdrop-blur-2xl border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/45 dark:ring-white/10 px-2 py-1.5 shadow-sm'
          }`}
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#434445] dark:text-white/80 hover:text-[#1C1D1E] dark:hover:text-white hover:bg-black/[0.07] dark:hover:bg-white/14 transition-all duration-300 ease-out whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Zone: Theme Toggle + Crisp Studio Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/55 dark:bg-white/[0.08] backdrop-blur-2xl border border-black/10 dark:border-white/14 ring-1 ring-inset ring-white/45 dark:ring-white/10 text-[#1C1D1E] dark:text-[#F8B033] hover:bg-white/85 dark:hover:bg-white/18 hover:scale-105 active:scale-95 transition-all duration-300 ease-out cursor-pointer shadow-xs"
          >
            <motion.span
              key={isDark ? 'sun' : 'moon'}
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-center"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.span>
          </button>

          <button
            type="button"
            onClick={onOpenBrief}
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#1C1D1E]/88 dark:bg-white/90 backdrop-blur-xl ring-1 ring-inset ring-white/20 dark:ring-black/10 text-white dark:text-[#1C1D1E] px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold hover:bg-[#F8B033] dark:hover:bg-[#F8B033] hover:text-[#1C1D1E] hover:scale-[1.03] active:scale-[0.97] hover:shadow-md transition-all duration-300 ease-out cursor-pointer whitespace-nowrap shadow-xs"
          >
            <span>Let’s Talk</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
