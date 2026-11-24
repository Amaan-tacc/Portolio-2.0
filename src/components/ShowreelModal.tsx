import { responsiveImage } from '../lib/responsiveImage';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Pause, Play, RotateCcw, X } from 'lucide-react';
import { SERVICE_DISCIPLINES, STUDIO_BRAND } from '../data/studioData';
import { NicheId, ServiceDiscipline, StudioBrandConfig } from '../types/studio';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProject: (niche?: NicheId) => void;
  brand?: StudioBrandConfig;
  services?: ServiceDiscipline[];
}

const VIDEO_DURATION_SEC = 45;

export const ShowreelModal: React.FC<ShowreelModalProps> = ({
  isOpen,
  onClose,
  onStartProject,
  brand = STUDIO_BRAND,
  services = SERVICE_DISCIPLINES,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedSec, setElapsedSec] = useState(0);

  const hasUploadedVideo = Boolean(brand.introVideoUrl);

  useEffect(() => {
    if (!isOpen) return;
    setElapsedSec(0);
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
    if (!isOpen || !isPlaying || hasUploadedVideo) return;
    const tickMs = 100;
    const timer = window.setInterval(() => {
      setElapsedSec((prev) => {
        const next = prev + tickMs / 1000;
        if (next >= VIDEO_DURATION_SEC) {
          setIsPlaying(false);
          return VIDEO_DURATION_SEC;
        }
        return next;
      });
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [isOpen, isPlaying, hasUploadedVideo]);

  const safeServices = services.length > 0 ? services : SERVICE_DISCIPLINES;
  const progressPct = Math.min(100, (elapsedSec / VIDEO_DURATION_SEC) * 100);
  const activeServiceIndex = Math.min(
    safeServices.length - 1,
    Math.floor((elapsedSec / VIDEO_DURATION_SEC) * safeServices.length)
  );
  const activeService = safeServices[activeServiceIndex];

  const formatTime = (sec: number) => {
    const rounded = Math.floor(sec);
    const mins = Math.floor(rounded / 60);
    const secs = rounded % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Muhammad Amaan Services Overview Video"
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
            data-lenis-prevent
            tabIndex={-1}
            className="relative z-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto overscroll-contain [touch-action:pan-y] rounded-[24px] sm:rounded-[28px] bg-[#16181C]/90 backdrop-blur-2xl border border-white/15 ring-1 ring-inset ring-white/12 shadow-2xl text-white flex flex-col"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-4 px-4 sm:px-7 py-3.5 sm:py-4 bg-white/[0.04] backdrop-blur-2xl border-b border-white/10">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#F8B033] shrink-0" />
                <span className="w-2 h-2 rounded-full bg-[#429AD4] shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] sm:tracking-[0.16em] text-white/80 truncate ml-1">
                  Muhammad Amaan · Services Overview
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close video player"
                className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-white/10 backdrop-blur-xl ring-1 ring-inset ring-white/20 hover:bg-white hover:text-[#1C1D1E] hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-300 ease-out cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Padded Cinema Bezel + Single 16:9 Video Stage */}
            <div className="p-2 sm:p-3.5 bg-white/[0.03] border-b border-white/10">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-[16px] sm:rounded-[20px] bg-[#0B0D11] overflow-hidden ring-1 ring-inset ring-white/12">
                {hasUploadedVideo ? (
                  <video
                    src={brand.introVideoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-10 bg-[radial-gradient(circle_at_22%_25%,rgba(248,176,51,0.16),transparent_50%),linear-gradient(135deg,#1d1d1f_0%,#121213_60%,#09090a_100%)]">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 studio-work-band-dots opacity-70 pointer-events-none"
                    />

                    {/* Properly Padded Founder Presence on Right */}
                    <div className="absolute right-3 sm:right-10 bottom-0 top-6 sm:top-10 flex items-end justify-end pointer-events-none opacity-35 sm:opacity-90">
                      <img
                        src={brand.founderAvatar}
                      {...responsiveImage(brand.founderAvatar, '(min-width: 640px) 360px, 200px')}
                        alt={brand.founderName}
                        className="h-full max-h-[92%] w-auto object-contain object-bottom drop-shadow-2xl"
                      />
                    </div>

                    <div className="relative z-10 flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                      <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-inset ring-white/15 text-[#F8B033]">
                        Single Video Walkthrough
                      </span>
                      <span className="hidden sm:inline text-white/45">
                        Direct from {brand.founderRole}
                      </span>
                    </div>

                    <div className="relative z-10 max-w-xl my-auto">
                      <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#429AD4] mb-1.5">
                        Covering {activeService.number} / {activeService.title}
                      </div>
                      <h3 className="font-display text-xl sm:text-4xl font-bold tracking-tight text-white">
                        One studio. {safeServices.length} specialties built around your goals.
                      </h3>
                      <p className="mt-2 text-xs sm:text-base text-white/75 leading-relaxed max-w-lg">
                        {activeService.tagline}
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {safeServices.map((svc, idx) => (
                          <span
                            key={svc.id}
                            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-colors duration-300 ease-out ${
                              idx === activeServiceIndex
                                ? 'bg-[#F8B033] text-[#1C1D1E]'
                                : 'bg-white/10 text-white/60 ring-1 ring-inset ring-white/12'
                            }`}
                          >
                            {svc.title}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onStartProject(activeService.id);
                        }}
                        className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/90 backdrop-blur-xl ring-1 ring-inset ring-white/50 text-[#1C1D1E] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold hover:bg-[#F8B033] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out cursor-pointer shrink-0"
                      >
                        <span>Start a Project</span>
                        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Single Continuous Scrubber & Controls */}
            {!hasUploadedVideo && (
              <div className="px-4 sm:px-7 py-3.5 sm:py-4 bg-white/[0.03] backdrop-blur-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold tabular-nums text-white/70">
                    {formatTime(elapsedSec)}
                  </span>
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={VIDEO_DURATION_SEC}
                    aria-valuenow={Math.floor(elapsedSec)}
                    className="flex-1 h-1.5 rounded-full bg-white/15 overflow-hidden"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#F8B033] to-[#429AD4] transition-all duration-100"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums text-white/45">
                    {formatTime(VIDEO_DURATION_SEC)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (elapsedSec >= VIDEO_DURATION_SEC) {
                          setElapsedSec(0);
                          setIsPlaying(true);
                        } else {
                          setIsPlaying((prev) => !prev);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/12 backdrop-blur-xl ring-1 ring-inset ring-white/15 hover:bg-white/22 active:scale-95 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold cursor-pointer transition-all duration-300 ease-out"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setElapsedSec(0);
                        setIsPlaying(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/8 backdrop-blur-xl ring-1 ring-inset ring-white/12 hover:bg-white/18 active:scale-95 px-3.5 py-1.5 sm:py-2 text-xs font-medium text-white/75 hover:text-white cursor-pointer transition-all duration-300 ease-out"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restart</span>
                    </button>
                  </div>

                  <span className="text-xs text-white/55">
                    Direct services intro by {brand.founderName}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
