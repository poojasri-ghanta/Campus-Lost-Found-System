import React from 'react';
import {
  Laptop,
  Smartphone,
  CreditCard,
  Briefcase,
  Key,
  BookOpen,
  Watch,
  Shirt,
  Dumbbell,
  Package,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const Item3DIcon = ({ category = '', size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10'
  };

  const getCategoryConfig = () => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('laptop') || cat.includes('electronic')) {
      return {
        bg: 'from-terracotta-500/15 via-terracotta-500/10 to-biscuit-200/50',
        border: 'border-terracotta-300/40',
        text: 'text-terracotta-600',
        glow: 'shadow-terracotta-500/10',
        icon: Laptop
      };
    }
    if (cat.includes('id') || cat.includes('card') || cat.includes('identification')) {
      return {
        bg: 'from-olive-500/15 via-olive-500/10 to-biscuit-200/50',
        border: 'border-olive-300/40',
        text: 'text-olive-700',
        glow: 'shadow-olive-500/10',
        icon: CreditCard
      };
    }
    if (cat.includes('wallet') || cat.includes('bag') || cat.includes('backpack')) {
      return {
        bg: 'from-cocoa-500/15 via-cocoa-500/10 to-biscuit-200/50',
        border: 'border-cocoa-300/40',
        text: 'text-cocoa-700',
        glow: 'shadow-cocoa-500/10',
        icon: Briefcase
      };
    }
    if (cat.includes('key')) {
      return {
        bg: 'from-amber-500/15 via-amber-500/10 to-biscuit-200/50',
        border: 'border-amber-300/40',
        text: 'text-amber-700',
        glow: 'shadow-amber-500/10',
        icon: Key
      };
    }
    if (cat.includes('book') || cat.includes('study')) {
      return {
        bg: 'from-terracotta-600/15 via-cocoa-500/10 to-biscuit-200/50',
        border: 'border-terracotta-300/40',
        text: 'text-terracotta-700',
        glow: 'shadow-terracotta-500/10',
        icon: BookOpen
      };
    }
    if (cat.includes('watch') || cat.includes('jewelry') || cat.includes('access')) {
      return {
        bg: 'from-amber-600/15 via-amber-500/10 to-biscuit-200/50',
        border: 'border-amber-400/40',
        text: 'text-amber-800',
        glow: 'shadow-amber-500/10',
        icon: Watch
      };
    }
    if (cat.includes('cloth') || cat.includes('apparel')) {
      return {
        bg: 'from-olive-600/15 via-olive-500/10 to-biscuit-200/50',
        border: 'border-olive-300/40',
        text: 'text-olive-800',
        glow: 'shadow-olive-500/10',
        icon: Shirt
      };
    }
    if (cat.includes('sport')) {
      return {
        bg: 'from-rust-500/15 via-rust-500/10 to-biscuit-200/50',
        border: 'border-rust-300/40',
        text: 'text-rust-700',
        glow: 'shadow-rust-500/10',
        icon: Dumbbell
      };
    }
    if (cat.includes('phone')) {
      return {
        bg: 'from-terracotta-500/15 via-terracotta-500/10 to-biscuit-200/50',
        border: 'border-terracotta-300/40',
        text: 'text-terracotta-600',
        glow: 'shadow-terracotta-500/10',
        icon: Smartphone
      };
    }
    return {
      bg: 'from-biscuit-200/60 via-cream-200/60 to-parchment-200/40',
      border: 'border-biscuit-300',
      text: 'text-cocoa-700',
      glow: 'shadow-cocoa-500/5',
      icon: Package
    };
  };

  const config = getCategoryConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} flex items-center justify-center ${config.text} ${config.glow} shadow-md backdrop-blur-xs transition-transform duration-300 hover:scale-105 hover:-translate-y-0.5 ${sizeMap[size] || sizeMap.md} ${className}`}
    >
      <IconComponent className={iconSizes[size] || iconSizes.md} />
      {/* 3D Glass curvature sheen */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
    </div>
  );
};
