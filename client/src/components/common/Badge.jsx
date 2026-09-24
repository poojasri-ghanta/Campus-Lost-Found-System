import React from 'react';
import { ITEM_STATUSES, CLAIM_STATUSES, CONFIDENCE_TIERS } from '../../utils/constants';

export const StatusBadge = ({ status, type = 'item', className = '' }) => {
  let config = { label: status || 'Unknown', color: 'bg-slate-100 text-slate-700 border-slate-300' };

  if (type === 'item' && ITEM_STATUSES[status]) {
    config = ITEM_STATUSES[status];
  } else if (type === 'claim' && CLAIM_STATUSES[status]) {
    config = CLAIM_STATUSES[status];
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {config.label}
    </span>
  );
};

export const ConfidenceBadge = ({ rating, score, className = '' }) => {
  let tier = CONFIDENCE_TIERS[rating] || CONFIDENCE_TIERS.NEEDS_REVIEW;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${tier.badge} shadow-sm ${className}`}
    >
      <span>{tier.label}</span>
      {score !== undefined && (
        <span className="bg-black/20 px-1.5 py-0.2 rounded font-mono text-[11px]">
          {score}%
        </span>
      )}
    </span>
  );
};
