import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ClipboardCheck, MessagesSquare, Compass, PanelsTopLeft, PenTool, Layers, FolderCheck, FileCheck2, ArrowDown, ArrowRight, Check } from 'lucide-react';
import type { ProcessStep } from '../types/studio';

const illustrations = [
  [ClipboardCheck, MessagesSquare],
  [PanelsTopLeft, Compass],
  [Layers, PenTool],
  [FolderCheck, FileCheck2],
];

/** Open, connected stages; the CMS remains the source of the process copy. */
export function ProcessFlow({ steps }: { steps: ProcessStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '80px' });
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 35%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });
  const oddY = useTransform(progress, [0, 1], [8, -8]);
  const evenY = useTransform(progress, [0, 1], [-6, 8]);

  return (
    <div ref={ref} className="process-flow" data-running={inView ? 'true' : 'false'}>
      <ol className="process-stages" style={{ '--stage-count': steps.length } as React.CSSProperties}>
        {steps.map((step, index) => {
          const [Primary, Secondary] = illustrations[index % illustrations.length];
          return (
            <motion.li key={step.step} className="process-stage group"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}>
              <motion.div className="process-art" aria-hidden="true"
                style={reduced ? undefined : { y: index % 2 ? evenY : oddY }}>
                <div className="process-art-halo" />
                <div className="process-paper process-paper-back" />
                <div className="process-paper process-paper-front">
                  <Primary className="process-main-icon" strokeWidth={1.15} />
                  <span className="process-paper-line" /><span className="process-paper-line process-paper-line-short" />
                </div>
                <div className="process-icon-orbit"><Secondary strokeWidth={1.3} /></div>
                <span className="process-spark process-spark-gold" /><span className="process-spark process-spark-blue" />
              </motion.div>
              <div className="process-step-copy">
                <span className="process-step-number">{step.step}</span>
                <h3 className="font-display font-bold tracking-tight text-2xl sm:text-3xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434445] dark:text-white/70 max-w-[25ch]">{step.description}</p>
                <p className="process-handoff"><Check size={13} aria-hidden="true" />{step.handoffNote}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="process-connector" aria-hidden="true" style={{ '--flow-delay': `${index * -1.2}s` } as React.CSSProperties}>
                  <svg className="process-curve" viewBox="0 0 160 52" fill="none" preserveAspectRatio="none">
                    <path d="M 2 27 C 40 0, 105 52, 156 24" stroke="currentColor" strokeWidth="1.4" />
                    <path d="m 148 21 8 3-5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="process-traveler" />
                  <ArrowDown className="process-mobile-arrow" size={17} />
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>
      <div className="process-flow-footer">
        <p className="flex items-center gap-3 text-sm sm:text-base font-medium"><span className="h-7 w-0.5 bg-[#F8B033] rounded-full" />You’re involved at every step.</p>
        <span className="flex items-center gap-2 text-xs text-[#68696A] dark:text-white/55">One team, from start to finish <ArrowRight size={15} className="text-[#429AD4]" aria-hidden="true" /></span>
      </div>
    </div>
  );
}
