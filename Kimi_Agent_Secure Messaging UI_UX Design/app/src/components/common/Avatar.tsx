import React from 'react';
import { cn } from '@/lib/utils';
import { StatusIndicator } from './StatusIndicator';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'away' | 'busy' | 'offline';
  showStatus?: boolean;
  className?: string;
  fallback?: string;
}

const sizeClasses = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md',
  status,
  showStatus = false,
  className,
  fallback
}) => {
  const [error, setError] = React.useState(false);
  
  const initials = fallback || alt.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={cn('relative inline-block', className)}>
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className={cn(
            'rounded-full object-cover border-2 border-secure-purple/30',
            sizeClasses[size]
          )}
        />
      ) : (
        <div 
          className={cn(
            'rounded-full bg-gradient-to-br from-secure-lilac/30 to-secure-purple/50',
            'flex items-center justify-center text-white font-semibold',
            'border-2 border-secure-purple/30',
            sizeClasses[size]
          )}
        >
          {initials}
        </div>
      )}
      {showStatus && status && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <StatusIndicator status={status} size={size === 'xs' ? 'sm' : 'md'} />
        </div>
      )}
    </div>
  );
};

export default Avatar;
