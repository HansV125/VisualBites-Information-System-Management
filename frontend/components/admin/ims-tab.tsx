'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Minus, Check, X, Info } from 'lucide-react';
import { getInventory, createIngredient, updateIngredient, deleteIngredient, adjustIngredientQuantity, IngredientGroup, Ingredient } from '@/lib/api';
import { DeleteConfirmationModal } from '../ui/delete-confirmation-modal';
import { AdminModal } from '../ui/admin-modals';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { LoadingState } from '../ui/loading-state';
import { ErrorState } from '../ui/error-state';
import { EmptyInventory } from '../ui/empty-state';
import { DATE_LOCALE } from '@/lib/constants';

export function IMSTab() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
    const [deleteItem, setDeleteItem] = useState<Ingredient | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [addToGroup, setAddToGroup] = useState<{ name: string; unit: string; minStock: number } | null>(null);
    const [adjustItem, setAdjustItem] = useState<{ item: Ingredient; position: { top: number; left?: number; right?: number } } | null>(null);
    const [editingGroup, setEditingGroup] = useState<IngredientGroup | null>(null);
    const [editingExpiry, setEditingExpiry] = useState<{ item: Ingredient; position: { top: number; left: number } } | null>(null);

    const { data: inventory, isLoading, error, refetch } = useQuery({
        queryKey: ['inventory'],
        queryFn: getInventory,
    });

    const createMutation = useMutation({
        mutationFn: createIngredient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-flat'] });
            setIsModalOpen(false);
            setAddToGroup(null);
            toast.success('Bahan berhasil ditambahkan');
        },
        onError: () => toast.error('Gagal menambahkan bahan')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateIngredient(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-flat'] });
            setEditingItem(null);
            setEditingGroup(null);
            setEditingExpiry(null);
            setIsModalOpen(false);
            toast.success('Bahan berhasil diperbarui');
        },
        onError: () => toast.error('Gagal memperbarui bahan')
    });

    const deleteMutation = useMutation({
        mutationFn: deleteIngredient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-flat'] });
            setDeleteItem(null);
            toast.success('Bahan berhasil dihapus');
        },
        onError: () => toast.error('Gagal menghapus bahan')
    });

    const adjustMutation = useMutation({
        mutationFn: ({ id, amount, operation }: { id: string; amount: number; operation: 'add' | 'subtract' }) =>
            adjustIngredientQuantity(id, amount, operation),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-flat'] });
            setAdjustItem(null);
            toast.success('Stok berhasil disesuaikan');
        },
        onError: () => toast.error('Gagal menyesuaikan stok')
    });

    const toggleGroup = (name: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(name)) {
            newExpanded.delete(name);
        } else {
            newExpanded.add(name);
        }
        setExpandedGroups(newExpanded);
    };

    const [searchTerm, setSearchTerm] = useState('');

    // Memoized: Calculate low stock alerts
    const lowStockAlerts = useMemo(() => {
        if (!inventory) return [];
        return inventory.filter((group: IngredientGroup) =>
            group.totalQuantity <= group.minStock && group.totalQuantity > 0
        );
    }, [inventory]);

    // Memoized: Calculate out of stock items
    const outOfStockItems = useMemo(() => {
        if (!inventory) return [];
        return inventory.filter((group: IngredientGroup) => group.totalQuantity === 0);
    }, [inventory]);

    // Memoized: Filtered inventory
    const filteredInventory = useMemo(() =>
        inventory?.filter((group: IngredientGroup) =>
            group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.unit.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [inventory, searchTerm]
    );

    if (isLoading) return <LoadingState text="Memuat inventaris..." />;
    if (error) return <ErrorState type="error" onRetry={() => refetch()} />;


    const formatDate = (date: string | null | undefined) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getExpiryStatus = (date: string | null | undefined, warningDays: number = 7): 'expired' | 'soon' | 'ok' | 'none' => {
        if (!date) return 'none';
        const expiry = new Date(date);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'expired';
        if (diffDays <= warningDays) return 'soon';
        return 'ok';
    };

    const getExpiryPillClass = (status: string) => {
        switch (status) {
            case 'expired': return 'bg-red-600 text-white';
            case 'soon': return 'bg-orange-500 text-white';
            case 'ok': return 'bg-green-500 text-white';
            default: return 'bg-gray-300 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Stock Alert Banner */}
            {(lowStockAlerts.length > 0 || outOfStockItems.length > 0) && (
                <div className="flex items-center gap-4 bg-black text-white px-4 py-2 border-4 border-black">
                    <span className="font-bold uppercase text-xs tracking-wider">Perhatian:</span>
                    <div className="flex items-center gap-4 flex-wrap">
                        {outOfStockItems.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="font-mono text-sm">
                                    <span className="font-bold text-red-400">{outOfStockItems.length}</span> habis
                                </span>
                            </div>
                        )}
                        {lowStockAlerts.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                                <span className="font-mono text-sm">
                                    <span className="font-bold text-orange-400">{lowStockAlerts.length}</span> stok rendah
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="hidden sm:block text-2xl sm:text-4xl font-black uppercase italic tracking-tighter">Kontrol Inventaris</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input
                        placeholder="Cari bahan..."
                        className="h-10 sm:h-12 border-4 border-black px-4 font-mono uppercase focus:outline-none focus:bg-yellow-50 min-w-[200px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={() => { setEditingItem(null); setAddToGroup(null); setIsModalOpen(true); }}
                        className="flex-grow sm:flex-grow-0 h-10 sm:h-12 bg-black text-white px-4 sm:px-6 font-bold uppercase hover:bg-white hover:text-black border-4 border-transparent hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        <span className="text-sm sm:text-base">Tambah Bahan</span>
                    </button>
                </div>
            </div>

            {/* Inventory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {filteredInventory?.length === 0 ? (
                    <div className="bg-white border-4 border-black p-12 text-center">
                        <span className="text-gray-500 font-bold uppercase tracking-widest font-mono">
                            {inventory?.length === 0 ? "Tidak ada bahan ditemukan." : "Tidak ada yang cocok."}
                        </span>
                    </div>
                ) : (
                    filteredInventory?.map((group: IngredientGroup) => {
                        const isExpanded = expandedGroups.has(group.name);
                        const hasBatches = group.batches.length > 1;
                        const isLowStock = group.totalQuantity <= group.minStock;

                        return (
                            <div key={group.name} className={`border-4 border-black shadow-[4px_4px_0px_0px_#000] ${isLowStock ? 'bg-red-50' : 'bg-white'}`}>
                                {/* Group Header */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Left: Name & Info */}
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-base uppercase tracking-tight truncate">{group.name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-gray-500">
                                                    <span>{group.batches.length} paket</span>
                                                    <span>•</span>
                                                    <span>min {group.minStock}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Center: Stock Display */}
                                        <div className="text-right shrink-0">
                                            <div className={`text-2xl font-black font-mono ${isLowStock ? 'text-red-600' : 'text-black'}`}>
                                                {group.totalQuantity}
                                            </div>
                                            <div className="text-xs font-mono text-gray-500">{group.unit}</div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => {
                                                    setAddToGroup({ name: group.name, unit: group.unit, minStock: group.minStock });
                                                    setEditingItem(null);
                                                    setIsModalOpen(true);
                                                }}
                                                className="h-8 sm:h-9 px-2 bg-black text-white font-bold uppercase hover:bg-gray-800 border-2 border-black transition-all flex items-center justify-center"
                                                title="Tambah Stok"
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                onClick={() => setEditingGroup(group)}
                                                className="h-8 sm:h-9 px-2 bg-yellow-400 text-black font-bold uppercase hover:bg-yellow-500 border-2 border-black transition-all flex items-center justify-center"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Batch List - Always show first batch, show rest when expanded */}
                                {group.batches.length > 0 && (
                                    <div className="border-t-2 border-black bg-white">
                                        {group.batches.map((batch: Ingredient, index: number) => {
                                            // Always show first batch, show rest only when expanded
                                            if (index > 0 && !isExpanded) return null;

                                            const warningDays = batch.expiryWarningDays ?? 7;
                                            const expiryStatus = getExpiryStatus(batch.expiryDate, warningDays);
                                            const isExpired = expiryStatus === 'expired';
                                            const isSoon = expiryStatus === 'soon';

                                            return (
                                                <div key={batch.id} className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 last:border-b-0 ${isExpired ? 'bg-red-50' : isSoon ? 'bg-yellow-50' : ''}`}>
                                                    {/* Expiry */}
                                                    <button
                                                        onClick={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setEditingExpiry({ item: batch, position: { top: rect.bottom + 5, left: rect.left } });
                                                        }}
                                                        className={`text-xs font-mono px-2 py-1 border-2 border-black cursor-pointer transition-colors ${isExpired ? 'bg-red-500 text-white font-bold' : isSoon ? 'bg-yellow-400 text-black font-bold' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                                                        title={`Peringatan: ${warningDays} hari`}
                                                    >
                                                        {formatDate(batch.expiryDate)}
                                                    </button>

                                                    {/* Quantity & Actions */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setAdjustItem({ item: batch, position: { top: rect.bottom + 5, right: window.innerWidth - rect.right } });
                                                            }}
                                                            className="font-mono text-sm font-bold px-3 py-1 bg-white hover:bg-gray-100 border-2 border-black cursor-pointer transition-colors"
                                                            title="Klik untuk menyesuaikan"
                                                        >
                                                            {batch.quantity} {batch.unit}
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteItem(batch)}
                                                            className="h-8 sm:h-9 px-2 bg-red-600 text-white font-bold uppercase hover:bg-red-700 border-2 border-black transition-all flex items-center justify-center"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Footer: expand/collapse or single batch indicator */}
                                        {hasBatches ? (
                                            <button
                                                onClick={() => toggleGroup(group.name)}
                                                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 border-t border-gray-200 flex items-center justify-center gap-2 text-xs font-mono font-bold text-gray-600 transition-colors"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronDown size={14} />
                                                        Sembunyikan {group.batches.length - 1} paket lainnya
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronRight size={14} />
                                                        Lihat {group.batches.length - 1} paket lainnya
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="w-full py-2 px-4 bg-gray-50 border-t border-gray-200 text-center text-xs font-mono text-gray-400 italic">
                                                ~ Hanya ada 1 paket ~
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add/Edit Modal */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setAddToGroup(null); }}
                title={editingItem ? "Edit Batch" : addToGroup ? `Tambah Stok: ${addToGroup.name}` : "Tambah Bahan Baru"}
            >
                <IngredientForm
                    initialData={editingItem}
                    prefillGroup={addToGroup}
                    onSubmit={(data) => {
                        if (editingItem) updateMutation.mutate({ id: editingItem.id, data });
                        else createMutation.mutate(data);
                    }}
                />
            </AdminModal>

            {/* Edit Group Modal */}
            <AdminModal
                isOpen={!!editingGroup}
                onClose={() => setEditingGroup(null)}
                title="Edit Bahan"
            >
                {editingGroup && (
                    <GroupEditForm
                        group={editingGroup}
                        onSubmit={(data) => {
                            // Update all batches with new name, unit, minStock
                            Promise.all(editingGroup.batches.map(batch =>
                                updateMutation.mutateAsync({ id: batch.id, data })
                            )).then(() => setEditingGroup(null));
                        }}
                    />
                )}
            </AdminModal>

            {/* Quantity Adjustment Tooltip */}
            {adjustItem && (
                <QuantityTooltip
                    item={adjustItem.item}
                    position={adjustItem.position}
                    onSubmit={(amount, operation) => {
                        adjustMutation.mutate({ id: adjustItem.item.id, amount, operation });
                    }}
                    onClose={() => setAdjustItem(null)}
                    isLoading={adjustMutation.isPending}
                />
            )}

            {/* Expiry Date Tooltip */}
            {editingExpiry && (
                <ExpiryTooltip
                    item={editingExpiry.item}
                    position={editingExpiry.position}
                    onSubmit={(data) => {
                        updateMutation.mutate({ id: editingExpiry.item.id, data });
                    }}
                    onClose={() => setEditingExpiry(null)}
                />
            )}

            <DeleteConfirmationModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
                itemName={deleteItem?.name || ''}
                description="Apakah anda yakin ingin menghapus paket ini:"
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
}

import React from 'react';

function QuantityTooltip({ item, position, onSubmit, onClose, isLoading }: {
    item: Ingredient;
    position: { top: number; left?: number; right?: number };
    onSubmit: (amount: number, operation: 'add' | 'subtract') => void;
    onClose: () => void;
    isLoading: boolean;
}) {
    const [operation, setOperation] = useState<'add' | 'subtract'>('add');
    const [amount, setAmount] = useState<number>(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleSubmit = () => {
        if (amount <= 0) return;
        if (operation === 'subtract' && amount > item.quantity) {
            alert(`Tidak dapat mengurangi lebih dari stok saat ini (${item.quantity})`);
            return;
        }
        onSubmit(amount, operation);
    };

    return (
        <div
            ref={ref}
            className="fixed bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-3 z-50"
            style={{ top: position.top, ...(position.right !== undefined ? { right: position.right } : { left: position.left }), minWidth: '200px' }}
        >
            <div className="flex items-center gap-2">
                <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value as 'add' | 'subtract')}
                    className="border-2 border-black p-1 font-mono text-sm"
                >
                    <option value="add">+</option>
                    <option value="subtract">-</option>
                </select>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="border-2 border-black p-1 font-mono text-sm w-20"
                    placeholder="0"
                    step="0.1"
                    autoFocus
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || amount <= 0}
                    className="bg-black text-white p-1 border-2 border-black hover:bg-gray-800 disabled:opacity-50"
                >
                    <Check size={16} />
                </button>
                <button
                    onClick={onClose}
                    className="p-1 border-2 border-black hover:bg-gray-100"
                >
                    <X size={16} />
                </button>
            </div>
            <div className="text-[10px] text-gray-500 mt-1 font-mono">
                Stok: {item.quantity} → {operation === 'add' ? item.quantity + amount : Math.max(0, item.quantity - amount)} {item.unit}
            </div>
        </div>
    );
}

function ExpiryTooltip({ item, position, onSubmit, onClose }: {
    item: Ingredient;
    position: { top: number; left: number };
    onSubmit: (data: { expiryDate: string | null; expiryWarningDays: number }) => void;
    onClose: () => void;
}) {
    const [date, setDate] = useState(item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '');
    const [warningDays, setWarningDays] = useState(item.expiryWarningDays ?? 7);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="fixed bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-3 z-50"
            style={{ top: position.top, left: position.left, minWidth: '220px' }}
        >
            <div className="space-y-2">
                <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Tanggal Kadaluwarsa</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border-2 border-black p-1 font-mono text-sm w-full"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Peringatan (hari sebelum)</label>
                    <input
                        type="number"
                        min={1}
                        max={365}
                        value={warningDays}
                        onChange={(e) => setWarningDays(Math.max(1, parseInt(e.target.value) || 7))}
                        className="border-2 border-black p-1 font-mono text-sm w-full"
                    />
                </div>
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={() => onSubmit({ expiryDate: date || null, expiryWarningDays: warningDays })}
                        className="flex-1 bg-black text-white py-1 px-2 border-2 border-black hover:bg-gray-800 font-bold text-xs uppercase"
                    >
                        Simpan
                    </button>
                    <button
                        onClick={onClose}
                        className="px-2 py-1 border-2 border-black hover:bg-gray-100"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function GroupEditForm({ group, onSubmit }: { group: IngredientGroup; onSubmit: (data: any) => void }) {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            name: group.name,
            unit: group.unit,
            minStock: group.minStock
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block font-bold uppercase mb-1">Nama</label>
                <input {...register('name')} className="w-full border-2 border-black p-2 font-mono" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-bold uppercase mb-1">Satuan</label>
                    <input {...register('unit')} className="w-full border-2 border-black p-2 font-mono" required />
                </div>
                <div>
                    <label className="block font-bold uppercase mb-1">Stok Minimum</label>
                    <input type="number" step="0.1" {...register('minStock', { valueAsNumber: true })} className="w-full border-2 border-black p-2 font-mono" required />
                </div>
            </div>
            <button type="submit" className="w-full bg-black text-white font-bold uppercase py-3 hover:bg-gray-800 transition-colors">
                Simpan Perubahan
            </button>
        </form>
    );
}

function IngredientForm({ initialData, prefillGroup, onSubmit }: {
    initialData?: Ingredient | null,
    prefillGroup?: { name: string; unit: string; minStock: number } | null,
    onSubmit: (data: any) => void
}) {
    const defaultValues = initialData || (prefillGroup ? {
        name: prefillGroup.name,
        unit: prefillGroup.unit,
        minStock: prefillGroup.minStock,
        quantity: 0,
        expiryDate: ''
    } : {});

    const { register, handleSubmit } = useForm({ defaultValues });

    // Simplified form when adding stock to existing group
    if (prefillGroup) {
        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input type="hidden" {...register('name')} />
                <input type="hidden" {...register('unit')} />
                <input type="hidden" {...register('minStock', { valueAsNumber: true })} />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold uppercase mb-1">Jumlah</label>
                        <input
                            type="number"
                            step="0.1"
                            {...register('quantity', { valueAsNumber: true })}
                            className="w-full border-2 border-black p-2 font-mono"
                            placeholder="0"
                            autoFocus
                            required
                        />
                        <span className="text-xs text-gray-500 font-mono mt-1">{prefillGroup.unit}</span>
                    </div>
                    <div>
                        <label className="block font-bold uppercase mb-1">Tanggal Kadaluwarsa</label>
                        <input
                            type="date"
                            {...register('expiryDate')}
                            className="w-full border-2 border-black p-2 font-mono"
                        />
                    </div>
                </div>

                <button type="submit" className="w-full bg-black text-white font-bold uppercase py-3 mt-4 hover:bg-gray-800 transition-colors">
                    Tambah Paket Stok
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block font-bold uppercase mb-1">Nama</label>
                <input
                    {...register('name')}
                    className="w-full border-2 border-black p-2 font-mono"
                    placeholder="Nama Bahan"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-bold uppercase mb-1">Jumlah</label>
                    <input type="number" step="0.1" {...register('quantity', { valueAsNumber: true })} className="w-full border-2 border-black p-2 font-mono" required />
                </div>
                <div>
                    <label className="block font-bold uppercase mb-1">Satuan</label>
                    <input
                        {...register('unit')}
                        className="w-full border-2 border-black p-2 font-mono"
                        placeholder="kg, L, pcs"
                        required
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-bold uppercase mb-1">Stok Minimum</label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('minStock', { valueAsNumber: true })}
                        className="w-full border-2 border-black p-2 font-mono"
                        required
                    />
                </div>
                <div>
                    <label className="block font-bold uppercase mb-1">Tanggal Kadaluwarsa</label>
                    <input
                        type="date"
                        {...register('expiryDate')}
                        className="w-full border-2 border-black p-2 font-mono"
                    />
                </div>
            </div>

            <button type="submit" className="w-full bg-black text-white font-bold uppercase py-3 mt-4 hover:bg-gray-800 transition-colors">
                {initialData ? 'Simpan Perubahan' : 'Tambah Bahan'}
            </button>
        </form>
    );
}
