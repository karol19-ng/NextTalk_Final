import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'purple' | 'dark';
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className,
  variant = 'default',
  hover = false,
  onClick
}) => {
  const variantStyles = {
    default: 'bg-white/5 backdrop-blur-xl border border-white/10',
    purple: 'bg-secure-purple/30 backdrop-blur-xl border border-secure-lilac/20',
    dark: 'bg-black/40 backdrop-blur-xl border border-white/5',
  };

  return (
    <div 
      className={cn(
        'rounded-2xl',
        variantStyles[variant],
        hover && 'transition-all duration-300 hover:bg-white/10 hover:border-white/20 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
