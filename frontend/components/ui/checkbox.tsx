'use client';

import * as React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
    return (
        <label className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group">
            <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center bg-white border-2 border-black transition-all active:translate-y-[1px]">
                <input
                    type="checkbox"
                    className="peer appearance-none absolute inset-0 w-full h-full cursor-pointer z-10"
                    {...props}
                />
                <div className="hidden peer-checked:block pointer-events-none">
                    <Check size={12} strokeWidth={4} className="sm:hidden" />
                    <Check size={16} strokeWidth={4} className="hidden sm:block" />
                </div>
            </div>
            {label && <span className={`font-mono text-xs sm:text-sm font-medium ${className}`}>{label}</span>}
        </label>
    );
}
