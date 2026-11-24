import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Check, Copy, Mail, X } from 'lucide-react';
import { SERVICE_DISCIPLINES, STUDIO_BRAND } from '../data/studioData';
import {
  NicheId,
  ProjectBriefForm,
  ServiceDiscipline,
  StudioBrandConfig,
} from '../types/studio';

interface GuidedBriefModalProps {
  isOpen: boolean;
  prefilledNiche: NicheId | null;
  onClose: () => void;
  brand?: StudioBrandConfig;
  services?: ServiceDiscipline[];
}

const STORAGE_KEY = 'amaanity_studio_brief_draft_v3';

const TIMELINE_OPTIONS = ['2 – 4 Weeks', '1 – 2 Months', 'Ongoing Retainer'];
const BUDGET_OPTIONS = ['$1.5k – $3k', '$3k – $7.5k', '$7.5k – $15k', '$15k+', 'Custom'];

const INITIAL_FORM: ProjectBriefForm = {
  name: '',
  email: '',
  organization: '',
  niches: ['brand-identity'],
  timeline: '2 – 4 Weeks',
  budget: '$3k – $7.5k',
  customBudget: '',
  details: '',
};

export const GuidedBriefModal: React.FC<GuidedBriefModalProps> = ({
  isOpen,
  prefilledNiche,
  onClose,
  brand = STUDIO_BRAND,
  services = SERVICE_DISCIPLINES,
}) => {
  const [form, setForm] = useState<ProjectBriefForm>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...INITIAL_FORM, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore storage errors
    }
    return INITIAL_FORM;
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    niches?: string;
    customBudget?: string;
  }>({});
  const [submitted, setSubmitted] = useState(false);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendError, setSendError] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    if (isOpen && prefilledNiche) {
      setSubmitted(false);
      setForm((prev) => ({
        ...prev,
        niches: prev.niches.includes(prefilledNiche) ? prev.niches : [prefilledNiche],
      }));
    }
  }, [isOpen, prefilledNiche]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // Ignore quota errors
    }
  }, [form]);

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

  const toggleNiche = (niche: NicheId) => {
    setForm((prev) => {
      const exists = prev.niches.includes(niche);
      const next = exists
        ? prev.niches.filter((item) => item !== niche)
        : [...prev.niches, niche];
      return { ...prev, niches: next };
    });
    if (errors.niches) {
      setErrors((prev) => ({ ...prev, niches: undefined }));
    }
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: {
      name?: string;
      email?: string;
      niches?: string;
      customBudget?: string;
    } = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Please enter your name.';
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid work email address.';
    }
    if (form.niches.length === 0) {
      nextErrors.niches = 'Select at least one studio specialty.';
    }
    if (form.budget === 'Custom' && !form.customBudget.trim()) {
      nextErrors.customBudget = 'Please enter your custom budget amount.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSendState('idle');
    setSendError('');
    setSubmitted(true);
  };

  const resolvedBudget =
    form.budget === 'Custom' ? `Custom (${form.customBudget.trim()})` : form.budget;

  const activeServices = services.length > 0 ? services : SERVICE_DISCIPLINES;
  const selectedLabels = activeServices
    .filter((d) => form.niches.includes(d.id))
    .map((d) => d.title)
    .join(', ');

  const formattedBriefText = [
    `Client Name: ${form.name}`,
    `Email: ${form.email}`,
    form.organization ? `Company / Organization: ${form.organization}` : null,
    `Specialties Needed: ${selectedLabels}`,
    `Target Timeline: ${form.timeline}`,
    `Estimated Budget: ${resolvedBudget}`,
    form.details ? `Project Notes: ${form.details}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const handleSendBrief = async () => {
    if (sendState === 'sending' || sendState === 'sent') return;
    setSendState('sending'); setSendError('');
    try {
      const response = await fetch('/api/brief.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, brief: formattedBriefText }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to send. Please try again.');
      setSendState('sent');
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      setSendState('error');
      setSendError(error instanceof Error ? error.message : 'Unable to send. Please try again.');
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(formattedBriefText);
      setCopiedSummary(true);
      window.setTimeout(() => setCopiedSummary(false), 2200);
    } catch {
      // Fallback handled by mailto link
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Start a Project Brief"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 18 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] sm:rounded-[28px] bg-white/88 dark:bg-[#191B1E]/88 backdrop-blur-2xl text-[#1C1D1E] dark:text-white shadow-2xl border border-black/10 dark:border-white/14 ring-1 ring-inset ring-white/45 dark:ring-white/10"
          >
            {/* Translucent Header */}
            <div className="sticky top-0 z-20 bg-white/72 dark:bg-[#191B1E]/74 backdrop-blur-2xl px-4 sm:px-8 py-3.5 sm:py-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[#68696A] dark:text-white/55">
                  Amaanity Studio · Brief
                </div>
                <h2 className="font-display text-lg sm:text-2xl font-bold tracking-tight mt-0.5">
                  {submitted ? 'Project Brief Ready' : 'Start a Project'}
                </h2>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                onClick={onClose}
                aria-label="Close project brief modal"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/55 dark:bg-white/10 backdrop-blur-xl border border-black/10 dark:border-white/15 ring-1 ring-inset ring-white/45 dark:ring-white/10 flex items-center justify-center hover:bg-[#1C1D1E] dark:hover:bg-white hover:text-white dark:hover:text-[#1C1D1E] transition-colors duration-300 ease-out cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {submitted ? (
              <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
                <div className="rounded-2xl bg-[#F8B033] p-5 sm:p-6 text-[#1C1D1E] ring-1 ring-inset ring-white/35">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                    <Check className="w-4 h-4" />
                    <span>{sendState === 'sent' ? 'Brief sent' : 'Brief ready to send'}</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                    Thank you, {form.name}.
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-black/85 leading-relaxed">
                    {sendState === 'sent' ? 'Your brief has been submitted. We’ll reply to your email within 24 hours.' : 'Review your brief, then send it directly to our inbox below.'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl border border-black/10 dark:border-white/12 ring-1 ring-inset ring-white/45 dark:ring-white/10 p-4 sm:p-5 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#68696A] dark:text-white/55">Specialties</span>
                    <span className="font-semibold text-right">{selectedLabels}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#68696A] dark:text-white/55">Timeline</span>
                    <span className="font-semibold tabular-nums">{form.timeline}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#68696A] dark:text-white/55">Budget</span>
                    <span className="font-semibold tabular-nums">{resolvedBudget}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#68696A] dark:text-white/55">Email</span>
                    <span className="font-semibold">{form.email}</span>
                  </div>
                </div>

                {sendError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{sendError}</p>}
                <div aria-live="polite" className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <button
                    type="button" onClick={handleSendBrief} disabled={sendState === 'sending' || sendState === 'sent'}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1C1D1E]/90 dark:bg-white/90 backdrop-blur-xl ring-1 ring-inset ring-white/20 dark:ring-black/10 text-white dark:text-[#1C1D1E] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold hover:bg-[#F8B033] dark:hover:bg-[#F8B033] hover:text-[#1C1D1E] hover:scale-[1.03] active:scale-[0.97] transition-all duration-350 ease-out"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{sendState === 'sending' ? 'Sending…' : sendState === 'sent' ? 'Brief sent ✓' : 'Send to amaan@amaanity.com'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-2 rounded-full bg-white/55 dark:bg-white/[0.07] backdrop-blur-xl border border-black/10 dark:border-white/14 ring-1 ring-inset ring-white/45 dark:ring-white/10 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold hover:bg-white/85 dark:hover:bg-white/16 active:scale-95 transition-all duration-300 ease-out cursor-pointer"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Summary Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs sm:text-sm font-medium text-[#68696A] dark:text-white/60 hover:text-[#1C1D1E] dark:hover:text-white transition-colors duration-300 ease-out px-2 py-2 cursor-pointer"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={validateAndSubmit} className="p-4 sm:p-8 space-y-5 sm:space-y-6" noValidate>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#68696A] dark:text-white/55 mb-2">
                    1. Specialties *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeServices.map((service) => {
                      const selected = form.niches.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleNiche(service.id)}
                          className={`flex items-center justify-between gap-3 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium border backdrop-blur-xl ring-1 ring-inset transition-all duration-300 ease-out cursor-pointer ${
                            selected
                              ? 'bg-[#1C1D1E]/90 dark:bg-white/92 text-white dark:text-[#1C1D1E] border-transparent ring-white/20 dark:ring-black/10'
                              : 'bg-white/58 dark:bg-white/[0.06] text-[#1C1D1E] dark:text-white border-black/10 dark:border-white/12 ring-white/45 dark:ring-white/10 hover:border-[#434445] dark:hover:border-white/35'
                          }`}
                        >
                          <span>{service.title}</span>
                          {selected && (
                            <Check className="w-4 h-4 text-[#F8B033] dark:text-[#1C1D1E] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.niches && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{errors.niches}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#68696A] dark:text-white/55 mb-2">
                      2. Timeline
                    </label>
                    <div className="space-y-2">
                      {TIMELINE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, timeline: option }))}
                          className={`w-full rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm font-medium border backdrop-blur-xl ring-1 ring-inset transition-all duration-300 ease-out cursor-pointer tabular-nums ${
                            form.timeline === option
                              ? 'bg-white/85 dark:bg-white/14 border-[#1C1D1E] dark:border-[#F8B033] ring-white/50 dark:ring-white/15 text-[#1C1D1E] dark:text-white font-semibold'
                              : 'bg-white/55 dark:bg-white/[0.05] border-black/10 dark:border-white/12 ring-white/40 dark:ring-white/10 text-[#68696A] dark:text-white/65 hover:border-[#434445]'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#68696A] dark:text-white/55 mb-2">
                      3. Budget
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {BUDGET_OPTIONS.map((option) => {
                        const isCustom = option === 'Custom';
                        const active = form.budget === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({ ...prev, budget: option }));
                              if (!isCustom && errors.customBudget) {
                                setErrors((prev) => ({ ...prev, customBudget: undefined }));
                              }
                            }}
                            className={`rounded-xl px-3 py-2 sm:py-2.5 text-left text-xs sm:text-sm font-medium border backdrop-blur-xl ring-1 ring-inset transition-all duration-300 ease-out cursor-pointer tabular-nums ${
                              isCustom ? 'col-span-2' : ''
                            } ${
                              active
                                ? 'bg-white/85 dark:bg-white/14 border-[#1C1D1E] dark:border-[#F8B033] ring-white/50 dark:ring-white/15 text-[#1C1D1E] dark:text-white font-semibold'
                                : 'bg-white/55 dark:bg-white/[0.05] border-black/10 dark:border-white/12 ring-white/40 dark:ring-white/10 text-[#68696A] dark:text-white/65 hover:border-[#434445]'
                            }`}
                          >
                            {option === 'Custom' ? 'Custom Budget Amount' : option}
                          </button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {form.budget === 'Custom' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2.5">
                            <input
                              type="text"
                              value={form.customBudget}
                              onChange={(e) => {
                                setForm((prev) => ({ ...prev, customBudget: e.target.value }));
                                if (errors.customBudget) {
                                  setErrors((prev) => ({ ...prev, customBudget: undefined }));
                                }
                              }}
                              placeholder="Enter custom value (e.g. $800 or $22k)"
                              className="w-full rounded-xl border border-[#1C1D1E] dark:border-[#F8B033] bg-white/80 dark:bg-white/[0.06] backdrop-blur-md px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-[#1C1D1E] dark:text-white focus:outline-none tabular-nums"
                            />
                            {errors.customBudget && (
                              <p className="mt-1 text-xs font-medium text-red-500">
                                {errors.customBudget}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <label
                      htmlFor="brief-name"
                      className="block text-xs font-bold uppercase tracking-wider text-[#68696A] dark:text-white/55 mb-1.5"
                    >
                      Your Name *
                    </label>
                    <input
                      id="brief-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, name: e.target.value }));
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-black/12 dark:border-white/14 bg-white/70 dark:bg-white/[0.05] backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-[#1C1D1E] dark:text-white focus:outline-none focus:border-[#1C1D1E] dark:focus:border-[#F8B033]"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="brief-email"
                      className="block text-xs font-bold uppercase tracking-wider text-[#68696A] dark:text-white/55 mb-1.5"
                    >
                      Work Email *
                    </label>
                    <input
                      id="brief-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, email: e.target.value }));
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="you@company.com"
                      className="w-full rounded-xl border border-black/12 dark:border-white/14 bg-white/70 dark:bg-white/[0.05] backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-[#1C1D1E] dark:text-white focus:outline-none focus:border-[#1C1D1E] dark:focus:border-[#F8B033]"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="brief-org"
                    className="block text-xs font-bold uppercase tracking-wider text-[#68696A] dark:text-white/55 mb-1.5"
                  >
                    Company / Studio (Optional)
                  </label>
                  <input
                    id="brief-org"
                    type="text"
                    value={form.organization}
                    onChange={(e) => setForm((prev) => ({ ...prev, organization: e.target.value }))}
                    placeholder="Organization name"
                    className="w-full rounded-xl border border-black/12 dark:border-white/14 bg-white/70 dark:bg-white/[0.05] backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-[#1C1D1E] dark:text-white focus:outline-none focus:border-[#1C1D1E] dark:focus:border-[#F8B033]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="brief-details"
                    className="block text-xs font-bold uppercase tracking-wider text-[#68696A] dark:text-white/55 mb-1.5"
                  >
                    Project Notes
                  </label>
                  <textarea
                    id="brief-details"
                    rows={3}
                    value={form.details}
                    onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
                    placeholder="Pages, SKUs, asset count or launch dates..."
                    className="w-full rounded-xl border border-black/12 dark:border-white/14 bg-white/70 dark:bg-white/[0.05] backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-[#1C1D1E] dark:text-white focus:outline-none focus:border-[#1C1D1E] dark:focus:border-[#F8B033]"
                  />
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-t border-black/10 dark:border-white/12">
                  <span className="text-xs text-[#68696A] dark:text-white/55">
                    Reply from {brand.email} within 24h
                  </span>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className="group inline-flex items-center gap-2 rounded-full bg-[#1C1D1E]/90 dark:bg-white/92 backdrop-blur-xl ring-1 ring-inset ring-white/20 dark:ring-black/10 text-white dark:text-[#1C1D1E] px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold hover:bg-[#F8B033] dark:hover:bg-[#F8B033] hover:text-[#1C1D1E] transition-colors duration-350 ease-out cursor-pointer"
                  >
                    <span>Generate Project Brief</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
