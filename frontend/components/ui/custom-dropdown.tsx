'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, LogOut } from 'lucide-react';

interface DropdownItem {
    value: string;
    label: string;
    icon?: React.ComponentType<{ size?: number }>;
    action?: boolean; // If true, clicking this triggers onChange but maybe handled differently (e.g. sign out)
}

interface CustomDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: DropdownItem[];
    className?: string;
}

export function CustomDropdown({ value, onChange, options, className }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: DropdownItem) => {
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-9 lg:h-9 bg-white lg:border-2 lg:border-black px-3 py-2 flex items-center justify-between font-black uppercase text-xs focus:outline-none"
            >
                <span className="flex items-center gap-2 truncate">
                    {selectedOption.icon && <selectedOption.icon size={14} />}
                    {selectedOption.label}
                </span>
                <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] z-50 animate-in fade-in zoom-in-95 duration-100">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className={`w-full text-left px-3 py-2 text-xs font-bold uppercase flex items-center gap-2 hover:bg-black hover:text-white transition-colors ${option.action ? 'border-t-2 border-black border-dashed mt-1 pt-2 text-red-600 hover:bg-red-600 hover:text-white' : ''
                                }`}
                        >
                            {option.icon && <option.icon size={14} />}
                            <span className="flex-grow">{option.label}</span>
                            {value === option.value && !option.action && <Check size={12} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
