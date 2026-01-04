import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-mana-accent focus:ring-offset-2 focus:ring-offset-surface-dark disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        primary: 'bg-mana-primary text-white hover:bg-opacity-90 shadow-lg shadow-mana-primary/20',
        secondary: 'bg-surface-lighter text-white hover:bg-surface-card border border-surface-lighter hover:border-surface-lighter/80',
        ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-surface-lighter/50',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-8 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
