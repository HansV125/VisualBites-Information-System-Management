'use client';

import { Grid, Package, ClipboardList, BarChart3 } from 'lucide-react';
import { useStore } from '@/lib/store';

const ADMIN_TABS = [
    { id: 'CMS', label: 'Products', icon: Grid },
    { id: 'IMS', label: 'Inventory', icon: Package },
    { id: 'ORDERS', label: 'Orders', icon: ClipboardList },
    { id: 'STATS', label: 'Statistics', icon: BarChart3 }
] as const;

export function AdminSidebarNav() {
    const { adminTab, setAdminTab } = useStore();

    return (
        <div className="flex-grow p-4 space-y-2">
            {ADMIN_TABS.map((tab) => {
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
                        <span className="text-sm">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
