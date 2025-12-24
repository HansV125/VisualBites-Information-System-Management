'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CONTACT } from '@/lib/constants';

interface MobileLinksDropdownProps {
    isOpen: boolean;
    isLoggedIn: boolean;
    isAdminRoute: boolean;
}

export function MobileLinksDropdown({ isOpen, isLoggedIn, isAdminRoute }: MobileLinksDropdownProps) {
    if (!isOpen) return null;

    const handleSignOut = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
        window.location.href = '/login';
    };

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-paper border-b-2 border-black overflow-hidden lg:hidden flex-shrink-0"
        >
            <div className="p-4 flex flex-col gap-4">
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

                <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-800 block mb-2">Shop with us</span>
                    <div className="flex gap-2">
                        <a href={CONTACT.tokopedia} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-2 py-1 border-2 border-black btn-tokped">
                            <span className="font-mono text-[10px] uppercase font-bold">Tokopedia</span>
                        </a>
                        <a href={CONTACT.shopee} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-2 py-1 border-2 border-black btn-shopee">
                            <span className="font-mono text-[10px] uppercase font-bold">Shopee</span>
                        </a>
                    </div>
                </div>

                <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-800 block mb-2">Chat with us</span>
                    <div className="flex gap-2">
                        <a href={CONTACT.instagramLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-2 py-1 border-2 border-black btn-instagram">
                            <span className="font-mono text-[10px] uppercase font-bold">Instagram</span>
                        </a>
                        <a href={CONTACT.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-2 py-1 border-2 border-black btn-whatsapp">
                            <span className="font-mono text-[10px] uppercase font-bold">Whatsapp</span>
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
