'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function AdminModal({ isOpen, onClose, title, children }: AdminModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                        className="w-full max-w-2xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_#fff] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">{title}</h2>
                            <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 max-h-[80vh] overflow-y-auto bg-noise">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
