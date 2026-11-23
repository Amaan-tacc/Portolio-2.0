import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, ExternalLink, Pause, Play, RotateCcw, X } from 'lucide-react';
import { STUDIO_BRAND } from '../data/studioData';
import { NicheId } from '../types/studio';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProject: (niche?: NicheId) => void;
}

interface ReelSlide {
  id: string;
  niche: NicheId;
  chapter: string;
  title: string;
  caption: string;
  image: string;
  durationSec: number;
}

const REEL_SLIDES: ReelSlide[] = [
  {
    id: 'slide-1',
    niche: 'books-educational',
    chapter: '01 / Books & Publishing',
    title: 'Creating Talents Series',
    caption: 'Unified interior grids, academic covers & press-ready print files.',
    image: '/assets/amaanity/work/creating-talents.webp',
    durationSec: 6,
  },
  {
    id: 'slide-2',
    niche: 'brand-identity',
    chapter: '02 / Brand Identity',
    title: 'WestVue & Bluoom Systems',
    caption: 'Sharp wordmarks, guideline books, reception signage & rollouts.',
    image: '/assets/amaanity/work/westvue.webp',
    durationSec: 6,
  },
  {
    id: 'slide-3',
    niche: 'print-packaging',
    chapter: '03 / Print & Packaging',
    title: 'FAR Organics & EnnoShi',
    caption: 'Shelf-ready cartons, bottle labels, clay jars & CMYK mechanicals.',
    image: '/assets/amaanity/work/far-organics.webp',
    durationSec: 6,
  },
  {
    id: 'slide-4',
    niche: 'game-assets',
    chapter: '04 / Game Art & Interactive UI',
    title: 'QuickGrade & Asset Pipelines',
    caption: '2D/3D assets, HUD flows & clean developer-ready structures.',
    image: '/assets/amaanity/work/quickgrade.webp',
    durationSec: 6,
  },
  {
    id: 'slide-5',
    niche: 'illustration',
    chapter: '05 / Custom Illustration',
    title: 'De Fontein Educational Art',
    caption: 'Original classroom posters, story spreads & large-format banners.',
    image: '/assets/amaanity/gallery/print-01__maths-poster-mockup.webp',
    durationSec: 6,
  },
];

export const ShowreelModal: React.FC<ShowreelModalProps> = ({
  isOpen,
  onClose,
  onStartProject,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(0);
    setProgress(0);
    setIsPlaying(true);
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const slideDurationMs = REEL_SLIDES[activeIndex].durationSec * 1000;
    const tickMs = 50;
    const step = (tickMs / slideDurationMs) * 100;

    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          setActiveIndex((idx) => (idx + 1) % REEL_SLIDES.length);
          return 0;
        }
        return prev + step;
      });
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [isOpen, isPlaying, activeIndex]);

  const currentSlide = REEL_SLIDES[activeIndex];

  const handleSelectChapter = (idx: number) => {
    setActiveIndex(idx);
    setProgress(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Amaanity Studio Showreel"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/82 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-5xl rounded-[28px] overflow-hidden bg-[#181A1D] border border-white/15 shadow-2xl text-white"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 bg-black/45 backdrop-blur-md border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F8B033]" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                  Amaanity Studio Reel · 300+ Clients
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close showreel player"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-[#1C1D1E] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 16:9 Cinema Stage */}
            <div className="relative aspect-[16/9] w-full bg-[#090A0C] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0"
                >
                  <motion.img
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    initial={{ scale: 1.02 }}
                    animate={{ scale: isPlaying ? 1.1 : 1.04 }}
                    transition={{ duration: currentSlide.durationSec, ease: 'linear' }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

                  {/* Kinetic Reel Title Card */}
                  <div className="absolute bottom-6 left-5 right-5 sm:bottom-10 sm:left-10 sm:right-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                      className="max-w-xl"
                    >
                      <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#F8B033] mb-1.5">
                        {currentSlide.chapter}
                      </div>
                      <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
                        {currentSlide.title}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-base text-white/80">
                        {currentSlide.caption}
                      </p>
                    </motion.div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onStartProject(currentSlide.niche);
                      }}
                      className="self-start sm:self-end inline-flex items-center gap-2 rounded-full bg-[#F8B033] text-[#1C1D1E] px-5 py-2.5 text-xs sm:text-sm font-bold hover:bg-white transition-colors cursor-pointer shrink-0"
                    >
                      <span>Book This Scope</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Scrubber & Controls */}
            <div className="px-5 sm:px-7 py-4 bg-[#121417] border-t border-white/10 space-y-4">
              {/* Chapter Progress Bars */}
              <div className="grid grid-cols-5 gap-2">
                {REEL_SLIDES.map((slide, idx) => {
                  const isPast = idx < activeIndex;
                  const isCurrent = idx === activeIndex;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => handleSelectChapter(idx)}
                      aria-label={`Jump to ${slide.title}`}
                      className="group text-left space-y-1.5 cursor-pointer"
                    >
                      <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                        <div
                          className="h-full bg-[#F8B033] transition-all duration-100"
                          style={{
                            width: isPast ? '100%' : isCurrent ? `${progress}%` : '0%',
                          }}
                        />
                      </div>
                      <div
                        className={`hidden sm:block text-[11px] font-medium truncate transition-colors ${
                          isCurrent ? 'text-white' : 'text-white/45 group-hover:text-white/80'
                        }`}
                      >
                        {slide.chapter}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Player Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full bg-white/12 hover:bg-white/20 px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIndex(0);
                      setProgress(0);
                      setIsPlaying(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/8 hover:bg-white/15 px-3.5 py-2 text-xs font-medium text-white/75 hover:text-white cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restart</span>
                  </button>
                </div>

                <a
                  href={STUDIO_BRAND.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F8B033] hover:text-white transition-colors"
                >
                  <span>More Video Reels on Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
