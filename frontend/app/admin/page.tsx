'use client';

import dynamic from 'next/dynamic';
import { useStore } from '@/lib/store';
import { Package, Grid, ClipboardList, BarChart3, LogOut } from 'lucide-react';
import { Footer } from '@/components/footer';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { LowStockAlert } from '@/components/admin/low-stock-alert';

// Lazy load admin tabs for better initial load performance
const CMSTab = dynamic(() => import('@/components/admin/cms-tab').then(m => ({ default: m.CMSTab })), {
    loading: () => <TabSkeleton />
});
const IMSTab = dynamic(() => import('@/components/admin/ims-tab').then(m => ({ default: m.IMSTab })), {
    loading: () => <TabSkeleton />
});
const OrdersTab = dynamic(() => import('@/components/admin/orders-tab').then(m => ({ default: m.OrdersTab })), {
    loading: () => <TabSkeleton />
});
const StatsTab = dynamic(() => import('@/components/admin/stats-tab').then(m => ({ default: m.StatsTab })), {
    loading: () => <TabSkeleton />
});

// Skeleton loader for tabs
function TabSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-48 bg-gray-200 rounded border-2 border-gray-300"></div>
                ))}
            </div>
        </div>
    );
}

export default function AdminPage() {
    const { adminTab, setAdminTab } = useStore();

    const handleMobileNav = async (value: string) => {
        if (value === 'SIGNOUT') {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
            window.location.href = '/login';
        } else {
            setAdminTab(value as any);
        }
    };

    const navOptions = [
        { value: 'CMS', label: 'Product Manager (CMS)', icon: Grid },
        { value: 'IMS', label: 'Inventory (IMS)', icon: Package },
        { value: 'ORDERS', label: 'Orders', icon: ClipboardList },
        { value: 'STATS', label: 'Statistics', icon: BarChart3 },
        { value: 'SIGNOUT', label: 'Sign Out', icon: LogOut, action: true }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 lg:pl-72">

            {/* Mobile Tab Control */}
            <div className="lg:hidden bg-white border-b-4 border-black sticky top-0 z-30">
                <CustomDropdown
                    value={adminTab}
                    onChange={handleMobileNav}
                    options={navOptions}
                    className="w-full"
                />
            </div>

            {/* Main Content Area */}
            <main className="flex-grow p-4 lg:p-10 space-y-8 bg-noise min-h-[calc(100vh-80px)]">

                {/* Low Stock Notification */}
                <LowStockAlert />

                {/* CMS TAB */}
                {adminTab === 'CMS' && <CMSTab />}

                {/* IMS TAB */}
                {adminTab === 'IMS' && <IMSTab />}

                {/* ORDERS TAB */}
                {adminTab === 'ORDERS' && <OrdersTab />}

                {/* STATS TAB */}
                {adminTab === 'STATS' && <StatsTab />}

            </main>

            <div className="fixed bottom-0 w-full lg:w-[calc(100%-18rem)] z-40 bg-gray-100 border-t-2 border-black left-0 lg:left-72">
                <Footer />
            </div>
        </div>
    );
}
