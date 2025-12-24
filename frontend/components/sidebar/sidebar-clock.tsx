'use client';

import { useEffect, useState } from 'react';
import { DATE_LOCALE } from '@/lib/constants';

export function SidebarClock() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    if (!time) return null;

    return (
        <div className="text-right font-mono text-xs text-gray-600">
            <div className="font-semibold">
                {time.toLocaleTimeString(DATE_LOCALE, { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[10px]">
                {time.toLocaleDateString(DATE_LOCALE, { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
        </div>
    );
}
