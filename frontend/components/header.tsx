'use client';

import { Menu, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { VisualBitesLandscape } from './ui/logo';

interface HeaderProps {
    showMenuButton?: boolean;
}

export function Header({ showMenuButton = false }: HeaderProps) {
    const { isMobileMenuOpen, setMobileMenuOpen, cart } = useStore();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="p-4 border-b-2 border-black flex justify-between items-center w-full bg-cream receipt-texture relative">
            <Link href="/" prefetch={true}>
                <VisualBitesLandscape className="h-8 w-auto text-black" />
            </Link>
            {showMenuButton && (
                <div className="relative">
                    <button
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                        className="w-10 h-10 flex items-center justify-center border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors relative z-10"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    {cartCount > 0 && !isMobileMenuOpen && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border border-black shadow-sm z-20 font-mono pointer-events-none">
                            {cartCount}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
