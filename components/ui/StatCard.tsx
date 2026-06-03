import React from 'react';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, icon, trend, trendValue, className = '', ...props }, ref) => {
    const trendStyles = {
      up: 'text-green-fresh',
      down: 'text-alert',
      neutral: 'text-text-muted',
    };

    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg p-6 shadow-card ${className}`}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-text-muted text-sm font-medium">{label}</p>
            <p className="text-3xl font-bold text-forest mt-2">{value}</p>
            {trend && trendValue && (
              <p className={`text-sm font-medium mt-2 ${trendStyles[trend]}`}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '-'} {trendValue}
              </p>
            )}
          </div>
          {icon && (
            <div className="text-green-primary opacity-20">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
