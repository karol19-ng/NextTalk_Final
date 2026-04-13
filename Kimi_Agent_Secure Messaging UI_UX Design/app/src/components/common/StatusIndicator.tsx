import React from 'react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'online' | 'away' | 'busy' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  showBorder?: boolean;
  className?: string;
}

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-500',
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  size = 'md',
  showBorder = true,
  className 
}) => {
  return (
    <span 
      className={cn(
        'rounded-full inline-block',
        statusColors[status],
        sizeClasses[size],
        showBorder && 'border-2 border-secure-black',
        className
      )}
    />
  );
};

export default StatusIndicator;
