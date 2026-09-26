import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer';

  const variants = {
    primary:
      'bg-terracotta-600 hover:bg-terracotta-700 text-white focus:ring-terracotta-500 shadow-warm hover:shadow-glow',
    secondary:
      'bg-white hover:bg-cream-200 text-cocoa-800 border border-biscuit-300 focus:ring-biscuit-400 shadow-soft hover:border-biscuit-400',
    accent:
      'bg-olive-600 hover:bg-olive-700 text-white focus:ring-olive-500 shadow-sm hover:shadow-olive-glow',
    danger:
      'bg-rust-600 hover:bg-rust-700 text-white focus:ring-rust-500 shadow-sm',
    amber:
      'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400 shadow-sm',
    ghost:
      'bg-transparent hover:bg-biscuit-100/70 text-cocoa-700 hover:text-cocoa-950 shadow-none border-none',
    dark:
      'bg-cocoa-900 hover:bg-cocoa-800 text-white focus:ring-cocoa-600 border border-cocoa-700 shadow-sm'
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-4.5 py-2.5 text-xs sm:text-sm gap-2',
    lg: 'px-6 py-3.5 text-sm sm:text-base gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

