import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import type { Testimonial } from '../types/studio';

export function ReviewRows({ reviews }: { reviews: Testimonial[] }) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.25 });
  const reduced = useReducedMotion();
  const index = reviews.length ? ((page % reviews.length) + reviews.length) % reviews.length : 0;
  const move = (delta: number) => { setDirection(delta); setPage(value => value + delta); };
  useEffect(() => {
    if (!visible || paused || reduced || reviews.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) { setDirection(1); setPage(value => value + 1); }
    }, 9000);
    return () => window.clearInterval(timer);
  }, [visible, paused, reduced, reviews.length, page]);
  if (!reviews.length) return null;
  const review = reviews[index];
  const words = review.quote.split(' ');
  const start = Math.floor(words.length / 3);
  const end = Math.ceil(words.length * 2 / 3);
  return (
    <div ref={ref} className="review-stage" role="region" aria-roledescription="carousel" aria-label="Client reviews"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      <Quote className="review-stage-mark" strokeWidth={0.7} aria-hidden="true" />
      {reviews.length > 1 && <div className="review-stage-neighbors" aria-hidden="true">
        <p className="review-stage-previous">{reviews[(index - 1 + reviews.length) % reviews.length].quote}</p>
        <p className="review-stage-next">{reviews[(index + 1) % reviews.length].quote}</p>
      </div>}
      <div className="review-stage-window">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.blockquote key={review.id} custom={direction} className="review-stage-quote"
            variants={{ enter: d => ({ opacity: 0, x: reduced ? 0 : d * 55 }), center: { opacity: 1, x: 0 }, exit: d => ({ opacity: 0, x: reduced ? 0 : d * -55 }) }}
            initial="enter" animate="center" exit="exit" transition={{ duration: reduced ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            drag={reviews.length > 1 ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12}
            onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 45 || Math.abs(info.velocity.x) > 450) move(info.offset.x < 0 ? 1 : -1); }}>
            <p className="font-display">{words.slice(0, start).join(' ')}{' '}<span className="review-stage-highlight">{words.slice(start, end).join(' ')}</span>{' '}{words.slice(end).join(' ')}</p>
            <footer>
              <cite className="not-italic">{review.author}</cite>
              {review.role && <p>{review.role}</p>}
              <span className="review-stage-author-line" aria-hidden="true" />
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>
      <div className="review-stage-controls">
        <span className="tabular-nums" aria-label={`Review ${index + 1} of ${reviews.length}`}><span className="review-stage-highlight">{String(index + 1).padStart(2, '0')}</span><span className="mx-2 opacity-40">/</span>{String(reviews.length).padStart(2, '0')}</span>
        {reviews.length > 1 && <div className="flex gap-3">
          <button type="button" onClick={() => move(-1)} aria-label="Previous review" className="review-stage-arrow"><ArrowLeft size={22} /></button>
          <button type="button" onClick={() => move(1)} aria-label="Next review" className="review-stage-arrow"><ArrowRight size={22} /></button>
        </div>}
      </div>
    </div>
  );
}
