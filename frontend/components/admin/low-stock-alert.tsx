'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Package, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getInventoryFlat, Ingredient } from '@/lib/api';
import { useState } from 'react';
import { useStore } from '@/lib/store';

export function LowStockAlert() {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { setAdminTab } = useStore();

    const { data: inventory } = useQuery({
        queryKey: ['inventory-flat'],
        queryFn: getInventoryFlat,
    });

    const lowStockItems = inventory?.filter(
        (item: Ingredient) => item.quantity <= item.minStock
    ) || [];

    if (isDismissed || lowStockItems.length === 0) return null;

    const displayItems = isExpanded ? lowStockItems : lowStockItems.slice(0, 3);

    return (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-4 border-red-500 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.4)] p-4 mb-6 relative">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-red-500 p-2 border-2 border-black">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black uppercase tracking-tight text-red-700 text-sm sm:text-base">
                            ⚠️ Bahan Baku Mendekati Habis!
                        </h3>
                        <p className="text-xs sm:text-sm text-red-600 font-mono">
                            {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} harus di-restock!
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsDismissed(true)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Dismiss"
                >
                    <X className="w-5 h-5 text-red-600" />
                </button>
            </div>

            {/* Item List */}
            <div className="mt-4 space-y-2">
                {displayItems.map((item: Ingredient) => {
                    const percentRemaining = item.minStock > 0
                        ? Math.round((item.quantity / item.minStock) * 100)
                        : item.quantity > 0 ? 100 : 0;

                    return (
                        <div
                            key={item.id}
                            className="flex items-center justify-between bg-white border-2 border-red-300 p-2 sm:p-3 hover:border-red-500 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                                <div>
                                    <span className="font-bold text-xs sm:text-sm uppercase">{item.name}</span>
                                    <div className="text-[10px] sm:text-xs text-gray-500 font-mono">
                                        Stok: {item.quantity} {item.unit} | Min: {item.minStock} {item.unit}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs sm:text-sm font-bold px-2 py-1 border-2 border-black ${percentRemaining <= 50
                                    ? 'bg-red-600 text-white'
                                    : 'bg-orange-400 text-black'
                                    }`}>
                                    {item.quantity <= 0 ? 'HABIS' : 'LOW'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show More / Less Button */}
            {lowStockItems.length > 3 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 flex items-center gap-1 text-xs font-bold uppercase text-red-600 hover:text-red-800 transition-colors"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="w-4 h-4" />
                            Tampilkan Lebih Sedikit
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4" />
                            Lihat {lowStockItems.length - 3} Item Lainnya
                        </>
                    )}
                </button>
            )}

            {/* Action Button */}
            <button
                onClick={() => setAdminTab('IMS')}
                className="mt-4 w-full sm:w-auto bg-red-600 text-white font-bold uppercase px-6 py-2 border-2 border-black hover:bg-red-700 transition-colors shadow-[3px_3px_0px_0px_#000] text-sm"
            >
                Kelola Inventory →
            </button>
        </div>
    );
}
