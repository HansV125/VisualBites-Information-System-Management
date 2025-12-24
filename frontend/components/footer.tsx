'use client';

import Link from 'next/link';

export function Footer() {
    return (
        <footer className="w-full h-12 lg:h-8 border-t-2 border-black shrink-0 relative z-30">
            <Link href="https://automatease.pages.dev" target="_blank" className="w-full h-full bg-black text-white font-mono font-bold text-xs uppercase flex items-center justify-center hover:bg-white hover:text-black hover:border-black transition-colors">
                <span>© 2025 Automatease x VisualBites</span>
            </Link>
        </footer>
    );
}
