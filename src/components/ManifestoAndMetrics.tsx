import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  MotionValue,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { DEFAULT_SITE_COPY, STUDIO_METRICS, TRUSTED_SECTORS } from '../data/studioData';
import { StudioMetric } from '../types/studio';

interface ManifestoAndMetricsProps {
  manifestoText?: string;
  metrics?: StudioMetric[];
  sectors?: string[];
}

const ScrollRevealWord: React.FC<{
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
}> = ({ word, range, progress }) => {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block mr-[0.26em] will-change-transform">
      {word}
    </motion.span>
  );
};

const AnimatedCounter: React.FC<{ target: number; suffix: string }> = ({ target, suffix }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame = 0;
    const totalFrames = 64; // Half-speed smooth count up
    const step = () => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      setCount(Math.round(target * progress));
      if (frame < totalFrames) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
};

export const ManifestoAndMetrics: React.FC<ManifestoAndMetricsProps> = ({
  manifestoText = DEFAULT_SITE_COPY.manifestoText,
  metrics = STUDIO_METRICS,
  sectors = TRUSTED_SECTORS,
}) => {
  const manifestoRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: rawTextProgress } = useScroll({
    target: manifestoRef,
    offset: ['start 0.9', 'end 0.45'],
  });
  const smoothTextProgress = useSpring(rawTextProgress, {
    stiffness: 120,
    damping: 28,
  });

  const { scrollYProgress: rawCardsProgress } = useScroll({
    target: cardsGridRef,
    offset: ['start end', 'end start'],
  });
  const smoothCardsProgress = useSpring(rawCardsProgress, {
    stiffness: 90,
    damping: 22,
  });

  const { scrollYProgress: marqueeScroll } = useScroll({
    target: marqueeRef,
    offset: ['start end', 'end start'],
  });
  const smoothMarqueeScroll = useSpring(marqueeScroll, {
    stiffness: 95,
    damping: 24,
  });

  const oddColumnY = useTransform(smoothCardsProgress, [0, 1], [42, -48]);
  const evenColumnY = useTransform(smoothCardsProgress, [0, 1], [-18, 62]);
  const oddRotate = useTransform(smoothCardsProgress, [0, 1], [-1.2, 1.2]);
  const evenRotate = useTransform(smoothCardsProgress, [0, 1], [1.2, -1.2]);
  const marqueeDriftX = useTransform(smoothMarqueeScroll, [0, 1], [70, -120]);

  const words = manifestoText.split(' ');

  return (
    <section className="py-10 sm:py-20 bg-transparent overflow-x-clip transition-colors duration-500">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8">
        <div ref={manifestoRef} className="max-w-5xl py-2 sm:py-4">
          <p className="text-[clamp(1.35rem,3.6vw,2.75rem)] font-light leading-[1.32] tracking-[-0.02em] text-[#1C1D1E] dark:text-white">
            {words.map((word, index) => {
              const start = index / words.length;
              const end = Math.min(1, start + 1.8 / words.length);
              return (
                <ScrollRevealWord
                  key={`${word}-${index}`}
                  word={word}
                  range={[start, end]}
                  progress={smoothTextProgress}
                />
              );
            })}
          </p>
        </div>

        {/* 4 Experience & 300+ Clients Cards — Compact 2x2 on Mobile */}
        <div
          ref={cardsGridRef}
          className="mt-8 sm:mt-18 mb-10 sm:mb-24 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
        >
          {metrics.map((metric, index) => {
            const isOddCol = index % 2 === 0;
            return (
              <motion.div
                key={metric.id}
                style={{
                  backgroundColor: metric.bgHex,
                  y: isOddCol ? oddColumnY : evenColumnY,
                  rotate: isOddCol ? oddRotate : evenRotate,
                }}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03, y: -6, rotate: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  opacity: { duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] },
                  scale: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                className={`rounded-[22px] sm:rounded-[30px] p-4 sm:p-8 text-[#1C1D1E] flex flex-col justify-between min-h-[155px] sm:min-h-[240px] ring-1 ring-inset ring-white/45 will-change-transform shadow-sm hover:shadow-xl transition-shadow duration-300 ${metric.offsetClass}`}
              >
                <div className="font-display text-[clamp(1.95rem,5.5vw,4.5rem)] font-bold leading-none tracking-[-0.04em]">
                  <AnimatedCounter target={metric.targetNumber} suffix={metric.suffix} />
                </div>

                <div>
                  <div className="h-px w-full bg-black/18 mb-2.5 sm:mb-4" />
                  <div className="text-xs sm:text-base font-bold tracking-tight mb-0.5 sm:mb-1">
                    {metric.label}
                  </div>
                  <p className="text-[11px] sm:text-sm text-black/75 leading-snug">{metric.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Half-Speed Scroll-Driven Marquee */}
      <div ref={marqueeRef} className="pt-8 sm:pt-12 border-t border-[#DEDEDE] dark:border-white/10">
        <div className="marquee-mask overflow-hidden py-3">
          <motion.div style={{ x: marqueeDriftX }} className="will-change-transform">
            <div className="animate-marquee-right marquee-pausable flex items-center gap-10 sm:gap-14 whitespace-nowrap">
              {[...sectors, ...sectors].map((sector, idx) => (
                <div
                  key={`${sector}-${idx}`}
                  className="flex items-center gap-10 sm:gap-14 font-display text-lg sm:text-xl font-semibold tracking-tight text-[#434445] dark:text-white/75 hover:text-[#1C1D1E] dark:hover:text-white transition-colors duration-300 ease-out"
                >
                  <span>{sector}</span>
                  <span
                    className={idx % 2 === 0 ? 'text-[#F8B033]' : 'text-[#429AD4]'}
                    aria-hidden="true"
                  >
                    /
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
