import { X } from 'lucide-react';
import React from 'react';

interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

export function CloseButton({ className = '', ...props }: CloseButtonProps) {
    return (
        <button
            type="button"
            className={`bg-black text-white p-1 sm:p-2 border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-colors ${className}`}
            {...props}
        >
            <X size={20} className="sm:hidden" />
            <X size={24} className="hidden sm:block" />
        </button>
    );
}
