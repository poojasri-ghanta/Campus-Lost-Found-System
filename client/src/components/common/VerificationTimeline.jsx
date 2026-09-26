import React from 'react';
import { Check, Clock, ShieldCheck, ArrowRight, CheckCircle2, KeyRound, Sparkles } from 'lucide-react';

export const VerificationTimeline = ({ currentStep = 'REPORT', className = '' }) => {
  // Steps: 'REPORT', 'MATCH', 'VERIFICATION', 'HANDOVER', 'RETURNED'
  const steps = [
    { key: 'REPORT', label: 'Report', sub: 'Registered' },
    { key: 'MATCH', label: 'Match', sub: 'Correlated' },
    { key: 'VERIFICATION', label: 'Verification', sub: 'Quiz Evaluated' },
    { key: 'HANDOVER', label: 'Handover', sub: '6-Digit PIN' },
    { key: 'RETURNED', label: 'Returned', sub: 'Case Closed' }
  ];

  const getStepIndex = (key) => {
    switch (key) {
      case 'REPORT':
      case 'REPORTED':
      case 'ACTIVE':
        return 0;
      case 'MATCH':
      case 'POTENTIAL_MATCH':
        return 1;
      case 'VERIFICATION':
      case 'CLAIM_REQUESTED':
      case 'UNDER_VERIFICATION':
      case 'UNDER_REVIEW':
      case 'MORE_INFORMATION_REQUIRED':
      case 'APPROVED':
        return 2;
      case 'HANDOVER':
      case 'HANDOVER_SCHEDULED':
      case 'SCHEDULED':
        return 3;
      case 'RETURNED':
      case 'CLOSED':
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = typeof currentStep === 'number' ? currentStep : getStepIndex(currentStep);

  return (
    <div className={`w-full py-4 px-2 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-biscuit-200 -z-0" />
        {/* Active progress bar line */}
        <div
          className="absolute top-1/2 left-4 h-1 -translate-y-1/2 bg-gradient-to-r from-terracotta-500 via-amber-500 to-olive-500 -z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 90}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              {/* Node Circle */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                  isDone
                    ? 'bg-olive-600 text-white shadow-olive-glow scale-100'
                    : isCurrent
                    ? 'bg-terracotta-500 text-white ring-4 ring-terracotta-100 shadow-warm scale-110'
                    : 'bg-cream-100 text-cocoa-400 border border-biscuit-300'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-biscuit-400" />
                )}
              </div>

              {/* Labels */}
              <span
                className={`text-[11px] font-bold mt-2 text-center tracking-tight ${
                  isCurrent
                    ? 'text-terracotta-600 font-extrabold'
                    : isDone
                    ? 'text-olive-700'
                    : 'text-cocoa-400'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[9px] text-cocoa-400 hidden sm:block">
                {step.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
