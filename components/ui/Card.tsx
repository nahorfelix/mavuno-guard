import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-white rounded-lg p-6 shadow-card ${className}`}
      {...props}
    />
  )
);

Card.displayName = 'Card';
