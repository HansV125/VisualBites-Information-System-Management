'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface SidebarAuthLinksProps {
    isLoggedIn: boolean;
    isAdminRoute: boolean;
}

export function SidebarAuthLinks({ isLoggedIn, isAdminRoute }: SidebarAuthLinksProps) {
    const handleSignOut = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
        window.location.href = '/login';
    };

    return (
        <div className="p-4 border-t-2 border-black border-dashed flex-shrink-0">
            {isLoggedIn ? (
                isAdminRoute ? (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSignOut}
                        className="w-full h-10 bg-black text-white font-mono font-bold text-xs uppercase flex items-center justify-center border-2 border-transparent btn-invert-dark"
                    >
                        Sign Out
                    </motion.button>
                ) : (
                    <Link href="/admin" className="w-full h-10 bg-black text-white font-mono font-bold text-xs uppercase flex items-center justify-center border-2 border-transparent btn-invert-dark">
                        Admin Dashboard
                    </Link>
                )
            ) : (
                <Link href="/login" className="w-full h-10 bg-black text-white font-mono font-bold text-xs uppercase flex items-center justify-center border-2 border-transparent btn-invert-dark">
                    Sign In
                </Link>
            )}
        </div>
    );
}
