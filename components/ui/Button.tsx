import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cyan' | 'magenta';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseStyles =
    'font-mono uppercase font-bold tracking-wider transition-all duration-200 border border-swiss-black active:translate-y-0.5 focus:outline-none';

  const variants = {
    primary: 'bg-swiss-black text-swiss-offwhite hover:bg-y2k-cyan hover:text-swiss-black',
    secondary: 'bg-swiss-offwhite text-swiss-black hover:bg-swiss-black hover:text-swiss-offwhite',
    cyan: 'bg-y2k-cyan text-swiss-black hover:bg-swiss-black hover:text-y2k-cyan',
    magenta: 'bg-y2k-magenta text-swiss-offwhite hover:bg-swiss-black hover:text-y2k-magenta',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3.5',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
};
