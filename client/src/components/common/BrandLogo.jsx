import React from 'react';
import { Link } from 'react-router-dom';

export const BrandLogo = ({ size = 'md', to = '/', showTagline = true, light = false }) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs'
  };

  const content = (
    <div className="flex items-center gap-3 group">
      {/* 3D-styled Emblem (Magnifying Glass + Location Pin + Checkmark) */}
      <div
        className={`${iconSizes[size] || iconSizes.md} rounded-2xl bg-gradient-to-br from-terracotta-500 via-terracotta-600 to-cocoa-800 flex items-center justify-center text-cream-50 shadow-warm group-hover:scale-105 group-hover:shadow-glow transition-all duration-300 relative shrink-0 border border-terracotta-400/30`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-cream-50 drop-shadow-sm"
        >
          {/* Location Pin Head / Lens */}
          <circle cx="11" cy="10" r="6" />
          {/* Handle */}
          <path d="m21 21-5.2-5.2" />
          {/* Verification Check inside lens */}
          <path d="m8.5 10 1.8 1.8 3.5-3.5" strokeWidth="2.5" stroke="currentColor" />
        </svg>
        {/* Subtle 3D glossy highlight */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/25 pointer-events-none" />
      </div>

      <div>
        <span
          className={`${textSizes[size] || textSizes.md} font-extrabold tracking-tight font-heading flex items-center gap-1 ${
            light ? 'text-cream-50' : 'text-cocoa-950'
          }`}
        >
          Campus<span className="text-terracotta-600">Find</span>
        </span>
        {showTagline && (
          <span
            className={`${taglineSizes[size] || taglineSizes.md} font-bold uppercase tracking-widest block -mt-0.5 ${
              light ? 'text-parchment-300' : 'text-cocoa-400'
            }`}
          >
            Find. Verify. Return.
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-flex items-center">{content}</Link>;
  }

  return content;
};
