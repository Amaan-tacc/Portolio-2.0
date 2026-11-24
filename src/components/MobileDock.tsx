import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Layers, LayoutGrid, Moon, Sun, User } from 'lucide-react';

interface MobileDockProps {
  isDark: boolean;
  onToggleDark: () => void;
  onOpenBrief: () => void;
}

export const MobileDock: React.FC<MobileDockProps> = ({
  isDark,
  onToggleDark,
  onOpenBrief,
}) => {
  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Mobile Bottom Dock Navigation"
      className="fixed bottom-3 left-3 right-3 z-40 md:hidden flex items-center justify-between gap-1 px-2 py-1.5 rounded-full bg-white/68 dark:bg-[#1E2025]/72 backdrop-blur-2xl border border-black/10 dark:border-white/14 ring-1 ring-inset ring-white/45 dark:ring-white/12 shadow-2xl"
    >
      <a
        href="#work"
        className="flex-1 flex flex-col items-center justify-center py-1.5 text-[10px] font-semibold text-[#1C1D1E] dark:text-white/85 hover:text-[#F8B033] transition-all duration-300 ease-out rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
      >
        <LayoutGrid className="w-4 h-4 mb-0.5" />
        <span>Work</span>
      </a>

      <a
        href="#specialties"
        className="flex-1 flex flex-col items-center justify-center py-1.5 text-[10px] font-semibold text-[#1C1D1E] dark:text-white/85 hover:text-[#F8B033] transition-all duration-300 ease-out rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
      >
        <Layers className="w-4 h-4 mb-0.5" />
        <span>Services</span>
      </a>

      <a
        href="#about"
        className="flex-1 flex flex-col items-center justify-center py-1.5 text-[10px] font-semibold text-[#1C1D1E] dark:text-white/85 hover:text-[#F8B033] transition-all duration-300 ease-out rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
      >
        <User className="w-4 h-4 mb-0.5" />
        <span>About</span>
      </a>

      <button
        type="button"
        onClick={onToggleDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="flex-1 flex flex-col items-center justify-center py-1.5 text-[10px] font-semibold text-[#1C1D1E] dark:text-[#F8B033] cursor-pointer rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all duration-300 ease-out"
      >
        {isDark ? <Sun className="w-4 h-4 mb-0.5" /> : <Moon className="w-4 h-4 mb-0.5" />}
        <span>{isDark ? 'Light' : 'Dark'}</span>
      </button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onClick={onOpenBrief}
        className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#F8B033]/92 backdrop-blur-xl ring-1 ring-inset ring-white/40 text-[#1C1D1E] px-3.5 py-2.5 text-xs font-bold shadow-sm hover:bg-[#1C1D1E] hover:text-white transition-colors duration-300 ease-out cursor-pointer"
      >
        <span>Brief</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </motion.button>
    </motion.nav>
  );
};
