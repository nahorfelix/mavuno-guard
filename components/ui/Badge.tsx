import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'warning' | 'danger' | 'success' | 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-green-100 text-green-primary',
      warning: 'bg-yellow-100 text-gold',
      danger: 'bg-red-100 text-alert',
      success: 'bg-green-100 text-green-primary',
      primary: 'bg-green-primary text-white',
      secondary: 'bg-gray-200 text-forest',
      ghost: 'bg-transparent text-forest border border-forest',
    };

    return (
      <span
        ref={ref}
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
