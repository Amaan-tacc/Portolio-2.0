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
      className="fixed bottom-4 left-3 right-3 z-40 md:hidden flex items-center justify-between gap-1 px-2.5 py-2 rounded-full bg-white/72 dark:bg-[#1C1D1E]/75 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-2xl"
    >
      <a
        href="#work"
        className="flex-1 flex flex-col items-center justify-center py-1.5 text-[10px] font-semibold text-[#1C1D1E] dark:text-white/85 hover:text-[#F8B033] transition-colors"
      >
        <LayoutGrid className="w-4 h-4 mb-0.5" />
        <span>Work</span>
      </a>

      <a
        href="#specialties"
        className="flex-1 flex flex-col items-center justify-center py-1.5 text-[10px] font-semibold text-[#1C1D1E] dark:text-white/85 hover:text-[#F8B033] transition-colors"
      >
        <Layers className="w-4 h-4 mb-0.5" />
        <span>Services</span>
      </a>

      <a
        href="#about"
        className="flex-1 flex flex-col items-center justify-center py-1.5 text-[10px] font-semibold text-[#1C1D1E] dark:text-white/85 hover:text-[#F8B033] transition-colors"
      >
        <User className="w-4 h-4 mb-0.5" />
        <span>About</span>
      </a>

      <button
        type="button"
        onClick={onToggleDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="flex-1 flex flex-col items-center justify-center py-1.5 text-[10px] font-semibold text-[#1C1D1E] dark:text-[#F8B033] cursor-pointer"
      >
        {isDark ? <Sun className="w-4 h-4 mb-0.5" /> : <Moon className="w-4 h-4 mb-0.5" />}
        <span>{isDark ? 'Light' : 'Dark'}</span>
      </button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={onOpenBrief}
        className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#F8B033]/95 backdrop-blur-md text-[#1C1D1E] px-3.5 py-2.5 text-xs font-bold shadow-sm cursor-pointer"
      >
        <span>Brief</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </motion.button>
    </motion.nav>
  );
};
