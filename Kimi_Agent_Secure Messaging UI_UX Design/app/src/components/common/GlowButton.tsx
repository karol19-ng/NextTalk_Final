import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const GlowButton: React.FC<GlowButtonProps> = ({ 
  variant = 'primary',
  size = 'md',
  glow = true,
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'relative font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-secure-lilac to-secure-lilac-dim text-secure-black hover:shadow-glow-lilac',
    secondary: 'bg-secure-purple/50 border border-secure-lilac/30 text-white hover:bg-secure-purple/70',
    ghost: 'bg-transparent text-secure-lilac hover:bg-secure-lilac/10',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <Button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        glow && variant === 'primary' && 'hover:shadow-glow-lilac-lg',
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </Button>
  );
};

export default GlowButton;
