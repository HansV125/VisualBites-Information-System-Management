'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface SmokeBatch {
    id: number;
    x: number;
    y: number;
}

export function ClickSmoke() {
    const [smokeBatches, setSmokeBatches] = useState<SmokeBatch[]>([]);
    const pathname = usePathname();

    // Only show smoke on user pages, not admin or login
    const isUserPage = pathname === '/';

    useEffect(() => {
        if (!isUserPage) return;

        const handleClick = (e: MouseEvent) => {
            // Only trigger on specific elements (add button, quantity buttons)
            const target = e.target as HTMLElement;
            const clickableParent = target.closest('button[type="submit"], button[type="button"]');

            // Only trigger on buttons in user page
            if (!clickableParent) return;

            const batchId = Date.now();
            setSmokeBatches(prev => [...prev, { id: batchId, x: e.clientX, y: e.clientY }]);
            setTimeout(() => {
                setSmokeBatches(prev => prev.filter(b => b.id !== batchId));
            }, 1000);
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [isUserPage]);

    if (!isUserPage) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {smokeBatches.flatMap(batch =>
                [...Array(8)].map((_, i) => (
                    <motion.div
                        key={`${batch.id}-${i}`}
                        className="absolute rounded-full"
                        style={{
                            left: batch.x,
                            top: batch.y,
                            width: 8 + Math.random() * 14,
                            height: 8 + Math.random() * 14,
                            background: 'radial-gradient(circle, rgba(50,50,50,0.85) 0%, rgba(20,20,20,0.6) 100%)',
                        }}
                        initial={{
                            opacity: 0,
                            y: 0,
                            x: 0,
                            scale: 0.2,
                        }}
                        animate={{
                            opacity: [0, 0.9, 0.5, 0],
                            y: -(window.innerHeight * 0.1) - Math.random() * 30,
                            x: (Math.random() - 0.5) * 80,
                            scale: [0.2, 1, 1.6],
                        }}
                        transition={{
                            duration: 0.8 + Math.random() * 0.3,
                            delay: i * 0.02,
                            ease: 'easeOut'
                        }}
                    />
                ))
            )}
        </div>
    );
}
