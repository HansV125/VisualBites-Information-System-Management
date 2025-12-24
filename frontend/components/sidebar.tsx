'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Grid, Package, ClipboardList, BarChart3 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Header } from './header';
import { ReceiptItem } from './receipt-item';
import Image from 'next/image';
import Link from 'next/link';
import { MobileReceipt } from './mobile-receipt';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/lib/api';
import { usePathname } from 'next/navigation';
import { VisualBitesLandscape } from './ui/logo';
import { EmptyCart } from './ui/empty-state';

export function Sidebar() {
    const { isMobileMenuOpen, setMobileMenuOpen } = useStore();

    return (
        <>
            {/* Desktop Sidebar - Always visible on lg */}
            <aside className="hidden lg:flex fixed left-0 top-0 w-72 h-screen z-40 border-r-2 border-black bg-cream receipt-texture shadow-xl flex-col transition-all duration-300">
                <SidebarContent />
            </aside>

            {/* Mobile Overlay - AnimatePresence */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full bg-cream receipt-texture border-t-2 border-black rounded-t-xl flex flex-col max-h-[90vh] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <SidebarContent isMobile />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function SidebarContent({ isMobile = false }: { isMobile?: boolean }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    // Check login status
    const { data: user } = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        retry: false,
        refetchOnWindowFocus: false
    });
    const isLoggedIn = !!user;

    const { cart, setModalOpen, setMobileMenuOpen, adminTab, setAdminTab } = useStore();
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const [time, setTime] = useState<Date | null>(null);
    const [isLinksOpen, setIsLinksOpen] = useState(false);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const adminTabs = [
        { id: 'CMS', label: 'Products', icon: Grid },
        { id: 'IMS', label: 'Inventory', icon: Package },
        { id: 'ORDERS', label: 'Orders', icon: ClipboardList },
        { id: 'STATS', label: 'Statistics', icon: BarChart3 }
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Mobile Links Dropdown */}
            <AnimatePresence>
                {isLinksOpen && isMobile && (
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
                                        onClick={async () => {
                                            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
                                            window.location.href = '/login';
                                        }}
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
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full h-10 bg-black text-white font-mono font-bold text-xs uppercase flex items-center justify-center border-2 border-transparent btn-invert-dark"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Handle */}
            <div
                className="lg:hidden flex w-full items-center justify-center py-3 border-b-2 border-black bg-paper cursor-pointer active:bg-gray-200 relative shrink-0"
            >
                <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-mono text-xs uppercase font-bold hover:underline"
                >
                    Tutup Menu
                </button>
                <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-black/5 rounded-full transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsLinksOpen(!isLinksOpen);
                    }}
                >
                    {isLinksOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
            </div>

            <div className="lg:hidden flex-grow flex flex-col min-h-0 overflow-y-auto">
                {/* Reorganized Mobile Links (Chat & Other Store) */}
                {!isAdminRoute && (
                    <div className="p-4 space-y-4 border-b-2 border-black border-dashed">
                        <div>
                            <span className="font-mono text-xs uppercase tracking-widest text-gray-800 block mb-2">Check out our other store</span>
                            <div className="flex gap-2">
                                <a href="https://tokopedia.link/visualbites" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-2 py-1 border-2 border-black btn-tokopedia">
                                    <span className="font-mono text-[10px] uppercase font-bold">Tokopedia</span>
                                </a>
                                <a href="https://shopee.co.id/visualbites" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-2 py-1 border-2 border-black btn-shopee">
                                    <span className="font-mono text-[10px] uppercase font-bold">Shopee</span>
                                </a>
                            </div>
                        </div>

                        <div>
                            <span className="font-mono text-xs uppercase tracking-widest text-gray-800 block mb-2">Chat with us</span>
                            <div className="flex gap-2">
                                <a href="https://instagram.com/visualbites25" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-2 py-1 border-2 border-black btn-instagram">
                                    <span className="font-mono text-[10px] uppercase font-bold">Instagram</span>
                                </a>
                                <a href="https://wa.me/6281382328258" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-2 py-1 border-2 border-black btn-whatsapp">
                                    <span className="font-mono text-[10px] uppercase font-bold">Whatsapp</span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {!isAdminRoute && <MobileReceipt />}
            </div>

            <div className="hidden lg:block shrink-0">
                <Header />
            </div>

            <div className="hidden lg:flex flex-grow flex-col overflow-y-auto relative">
                {isAdminRoute ? (
                    <div className="flex-grow p-4 space-y-2">
                        {adminTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = adminTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setAdminTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase transition-all border-2 ${isActive
                                        ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                                        : 'bg-white text-gray-500 border-transparent hover:border-black hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col justify-end p-4 pb-4">
                        {/* Standard Receipt View */}
                        <div className="bg-cream border-2 border-black border-b-0 relative shadow-md flex flex-col shrink-0 mb-2">
                            <div className="p-4 text-center border-b-2 border-black border-dashed">
                                <div className="flex justify-center pb-1">
                                    <VisualBitesLandscape className="h-8 w-auto text-black" />
                                </div>
                                <div className="font-receipt text-lg text-gray-800 mt-1">WA: (+62) 813-8232-8258</div>
                                <div className="mt-2 border-t border-dashed border-gray-400 pt-2 font-receipt text-sm sm:text-lg flex justify-between h-6">
                                    <span>{time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                    <span>{time ? time.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '--/--/----'}</span>
                                </div>
                            </div>

                            <div className="px-4 py-2">
                                {cart.map((item) => <ReceiptItem key={item.cartId} item={item} />)}
                                {cart.length === 0 && <EmptyCart />}
                            </div>

                            <div className="px-4 py-2 border-t-2 border-black border-dashed mt-auto bg-cream">
                                <div className="flex justify-between font-receipt text-2xl font-bold mb-2">
                                    <span>TOTAL</span>
                                    <span>Rp{cartTotal.toLocaleString('id-ID')}</span>
                                </div>
                                <button
                                    onClick={() => setModalOpen(true)}
                                    disabled={cart.length === 0}
                                    className="w-full bg-black mb-2 text-white font-mono text-xs py-3 uppercase tracking-wider border-2 border-black btn-invert-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Beli Sekarang
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="receipt-zigzag-bottom" />
                        </div>
                    </div>
                )}
            </div>

            {!isAdminRoute && (
                <div className="hidden lg:block px-4 py-3 border-t-2 border-black shrink-0">
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-800 block mb-2">Chat with us</span>
                    <div className="flex gap-3">
                        <a href="https://instagram.com/visualbites25" target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-1 border-2 border-black btn-instagram">
                            <span className="font-mono text-xs uppercase font-bold">Instagram</span>
                        </a>
                        <a href="https://wa.me/6281382328258" target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-1 border-2 border-black btn-whatsapp">
                            <span className="font-mono text-xs uppercase font-bold">Whatsapp</span>
                        </a>
                    </div>
                </div>
            )}

            {!isAdminRoute && (
                <div className="hidden lg:block px-4 py-3 border-t-2 border-black shrink-0">
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-800 block mb-2">Check out our other store</span>
                    <div className="flex gap-3">
                        <a href="https://tokopedia.link/visualbites" target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-1 border-2 border-black btn-tokopedia">
                            <span className="font-mono text-xs uppercase font-bold">Tokopedia</span>
                        </a>
                        <a href="https://shopee.co.id/visualbites" target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-1 border-2 border-black btn-shopee">
                            <span className="font-mono text-xs uppercase font-bold">Shopee</span>
                        </a>
                    </div>
                </div>
            )}

            <div className="hidden lg:block border-t-2 border-black shrink-0 z-30 relative">
                <div className="px-3 flex justify-between items-center h-[64px]">
                    <div className="font-mono text-2xl font-bold leading-none tracking-tighter">
                        {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </div>
                    <div className="font-mono text-xs uppercase text-gray-800">
                        {time ? time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) : 'Loading...'}
                    </div>
                </div>
            </div>

            {isLoggedIn ? (
                isAdminRoute ? (
                    <button
                        onClick={async () => {
                            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
                            window.location.href = '/login';
                        }}
                        className="hidden lg:flex w-full h-12 lg:h-8 bg-black text-white font-mono font-bold text-xs uppercase items-center justify-center border-t-2 border-black hover:bg-gray-800 transition-colors btn-invert-dark"
                    >
                        Sign Out
                    </button>
                ) : (
                    <Link href="/admin" className="hidden lg:flex w-full h-12 lg:h-8 bg-black text-white font-mono font-bold text-xs uppercase items-center justify-center border-t-2 border-black btn-invert-dark">
                        Admin Dashboard
                    </Link>
                )
            ) : (
                <Link href="/login" className="hidden lg:flex w-full h-12 lg:h-8 bg-black text-white font-mono font-bold text-xs uppercase items-center justify-center border-t-2 border-black btn-invert-dark">
                    Sign In
                </Link>
            )}
        </div>
    );
}
