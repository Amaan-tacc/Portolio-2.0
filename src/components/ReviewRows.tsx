import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import type { Testimonial } from '../types/studio';

function ReviewRow({ review, index }: { review: Testimonial; index: number }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Keep every review readable; focus follows the reading area without hiding content.
  const opacity = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0.62, 1, 1, 0.62]);
  const filter = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], ['blur(0.7px)', 'blur(0px)', 'blur(0px)', 'blur(0.7px)']);
  return (
    <motion.blockquote ref={ref} className="review-row group"
      style={reduced ? undefined : { opacity, filter }}>
      <span className="review-row-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0">
        <p className="review-row-quote font-display">“{review.quote}”</p>
        <div className="review-row-accent" aria-hidden="true" />
      </div>
      <footer className="review-row-author">
        <cite className="not-italic font-bold text-sm sm:text-base">{review.author}</cite>
        {review.role && <p className="mt-1 text-xs leading-relaxed text-[#68696A] dark:text-white/60">{review.role}</p>}
        {review.scope && <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#68696A] dark:text-white/55">{review.scope}</p>}
      </footer>
    </motion.blockquote>
  );
}

export function ReviewRows({ reviews }: { reviews: Testimonial[] }) {
  return <div className="review-rows">{reviews.map((review, index) => <ReviewRow key={review.id} review={review} index={index} />)}</div>;
}
