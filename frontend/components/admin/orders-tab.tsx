'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Check, X, MessageCircle, Plus, Trash2, Edit, ChevronDown } from 'lucide-react';
import { getOrders, updateOrderStatus, createOrder, getProducts, deleteOrder, updateOrder } from '@/lib/api';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AdminModal } from '../ui/admin-modals';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { CustomDropdown } from '../ui/custom-dropdown';
import { DeleteConfirmationModal } from '../ui/delete-confirmation-modal';
import { toast } from 'sonner';
import { ORDER_STATUS_CONFIG, ORDER_STATUS_FLOW, type OrderStatus } from '@/lib/constants';
import { LoadingState } from '../ui/loading-state';
import { EmptyOrders } from '../ui/empty-state';

export function OrdersTab() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
    const [orderToEdit, setOrderToEdit] = useState<any | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [flavorError, setFlavorError] = useState<string | null>(null);

    const { data: allOrders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: () => getOrders(),
        refetchInterval: 10000
    });

    // Memoize filtered orders to prevent recalculation on every render
    const pendingOrders = useMemo(() =>
        allOrders?.filter((o: any) => o.status === 'PENDING') || [],
        [allOrders]
    );

    const activeOrders = useMemo(() =>
        allOrders?.filter((o: any) => o.status !== 'PENDING') || [],
        [allOrders]
    );

    const filteredActiveOrders = useMemo(() =>
        statusFilter === 'ALL'
            ? activeOrders
            : activeOrders.filter((o: any) => o.status === statusFilter),
        [activeOrders, statusFilter]
    );

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-flat'] });
            toast.success('Status pesanan diperbarui');
        },
        onError: () => {
            toast.error('Gagal memperbarui status');
        }
    });

    const createMutation = useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setIsCreateOpen(false);
            toast.success('Pesanan berhasil dibuat');
        },
        onError: () => {
            toast.error('Gagal membuat pesanan');
        }
    });

    const editMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateOrder(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setOrderToEdit(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setOrderToDelete(null);
        }
    });

    const handleAccept = (order: any) => {
        statusMutation.mutate({ id: order.id, status: 'CONFIRMED' });
    };

    const handleReject = (order: any) => {
        statusMutation.mutate({ id: order.id, status: 'CANCELLED' });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="hidden sm:block text-2xl sm:text-4xl font-black uppercase italic tracking-tighter">Manajemen Pesanan</h2>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="w-full sm:w-auto h-9 sm:h-12 text-xs sm:text-base bg-black text-white px-3 sm:px-6 font-bold uppercase hover:bg-white hover:text-black border-4 border-transparent hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2"
                >
                    <Plus size={16} className="sm:hidden" />
                    <Plus size={20} className="hidden sm:block" />
                    Buat Pesanan Manual
                </button>
            </div>

            {/* PENDING ORDERS */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-black rounded-full animate-pulse" />
                    <h3 className="text-2xl font-black uppercase text-black">Menunggu Konfirmasi ({pendingOrders?.length || 0})</h3>
                </div>

                {isLoading && <LoadingState text="Memuat pesanan..." size="sm" />}

                {!isLoading && pendingOrders?.length === 0 ? (
                    <EmptyOrders />
                ) : (
                    <div className="grid gap-4">
                        {pendingOrders?.map((order: any) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onAccept={() => handleAccept(order)}
                                onReject={() => handleReject(order)}
                                isPending={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            <hr className="border-2 border-black border-dashed" />

            {/* ACTIVE / HISTORY */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-2xl font-black uppercase text-gray-700">Aktif & Riwayat</h3>
                    <div className="flex flex-wrap gap-2">
                        {['ALL', 'CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1 text-xs font-bold uppercase border-2 border-black transition-all ${statusFilter === status
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black hover:bg-gray-100'
                                    }`}
                            >
                                {status === 'ALL' ? 'Semua' : ORDER_STATUS_CONFIG[status as OrderStatus]?.label || status}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading && <LoadingState text="Memuat riwayat..." size="sm" />}

                {filteredActiveOrders?.length === 0 ? (
                    <div className="bg-white border-4 border-black p-8 text-center shadow-[4px_4px_0px_0px_#000]">
                        <span className="text-gray-500 font-bold uppercase">Tidak ada pesanan ditemukan</span>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredActiveOrders?.map((order: any) => (
                            <div key={order.id} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:translate-y-[-1px] transition-all">
                                {/* Card Header */}
                                <div className="p-4 border-b-2 border-black flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="font-black text-base uppercase">{order.customerName}</h4>
                                            <span className="text-xs font-mono text-gray-500">{order.customerPhone}</span>
                                        </div>
                                        <StatusDropdown
                                            currentStatus={order.status}
                                            onStatusChange={(newStatus) => statusMutation.mutate({ id: order.id, status: newStatus })}
                                            isLoading={statusMutation.isPending}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('id-ID')}
                                        </span>
                                        <button
                                            onClick={() => setOrderToEdit(order)}
                                            className="h-8 sm:h-9 px-2 bg-yellow-400 text-black font-bold uppercase hover:bg-yellow-500 border-2 border-black transition-all flex items-center justify-center"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => setOrderToDelete(order)}
                                            className="h-8 sm:h-9 px-2 bg-red-600 text-white font-bold uppercase hover:bg-red-700 border-2 border-black transition-all flex items-center justify-center"
                                            title="Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Card Body - Items */}
                                <div className="p-4 bg-gray-50">
                                    <div className="space-y-1 font-mono text-sm">
                                        {order.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between">
                                                <span>{item.quantity}x {item.product?.name} {item.flavor && `(${item.flavor})`}</span>
                                                <span className="text-gray-500">Rp{item.price.toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t-2 border-black mt-3 pt-2 flex justify-between font-black">
                                        <span>TOTAL</span>
                                        <span>Rp{order.total.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Order Modal */}
            <AdminModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Pesanan Manual">
                <CreateOrderForm
                    onSubmit={(data) => createMutation.mutate(data)}
                    onFlavorError={(msg) => setFlavorError(msg)}
                />
            </AdminModal>

            {/* Edit Order Modal */}
            <AdminModal isOpen={!!orderToEdit} onClose={() => setOrderToEdit(null)} title="Edit Pesanan">
                {orderToEdit && (
                    <EditOrderForm
                        order={orderToEdit}
                        onSubmit={(data) => editMutation.mutate({ id: orderToEdit.id, data })}
                    />
                )}
            </AdminModal>

            {/* Flavor Error Modal */}
            <AdminModal isOpen={!!flavorError} onClose={() => setFlavorError(null)} title="Peringatan">
                <div className="text-center py-4">
                    <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <p className="text-lg font-bold mb-4">{flavorError}</p>
                    <button
                        onClick={() => setFlavorError(null)}
                        className="bg-black text-white px-6 py-2 font-bold uppercase border-2 border-black hover:bg-white hover:text-black transition-all"
                    >
                        OK
                    </button>
                </div>
            </AdminModal>

            <DeleteConfirmationModal
                isOpen={!!orderToDelete}
                onClose={() => setOrderToDelete(null)}
                onConfirm={() => orderToDelete && deleteMutation.mutate(orderToDelete.id)}
                itemName={orderToDelete ? `#${orderToDelete.id.slice(0, 8)} - ${orderToDelete.customerName}` : ''}
                description="Apakah anda yakin ingin menghapus pesanan ini:"
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
}

function StatusDropdown({ currentStatus, onStatusChange, isLoading }: {
    currentStatus: OrderStatus;
    onStatusChange: (status: OrderStatus) => void;
    isLoading: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const config = ORDER_STATUS_CONFIG[currentStatus];
    const availableStatuses = ORDER_STATUS_FLOW[currentStatus] || [];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (availableStatuses.length === 0) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-black border-2 border-black ${config.bgColor} ${config.textColor}`}>
                {config.label}
            </span>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-black border-2 border-black ${config.bgColor} ${config.textColor} cursor-pointer hover:opacity-80 transition-opacity`}
            >
                {config.label}
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] z-50 min-w-[140px]">
                    {availableStatuses.map((status) => {
                        const statusConfig = ORDER_STATUS_CONFIG[status];
                        return (
                            <button
                                key={status}
                                onClick={() => {
                                    onStatusChange(status);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-xs font-bold uppercase hover:bg-gray-100 border-b border-gray-200 last:border-b-0 flex items-center gap-2`}
                            >
                                <span className={`w-3 h-3 rounded-full ${statusConfig.color}`}></span>
                                {statusConfig.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function OrderCard({ order, onAccept, onReject, isPending }: { order: any, onAccept?: () => void, onReject?: () => void, isPending?: boolean }) {
    return (
        <div className="bg-white border-4 border-black p-6 flex flex-col md:flex-row justify-between gap-6 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden group hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#000] transition-all">
            {isPending && <div className="absolute top-0 right-0 w-24 h-24 bg-black -mr-12 -mt-12 transform rotate-45" />}

            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-xl font-black uppercase">{order.customerName}</h4>
                        <div className="flex items-center gap-2 text-gray-600 font-mono text-sm">
                            <MessageCircle size={14} /> {order.customerPhone}
                        </div>
                    </div>
                    <div className="text-right md:hidden">
                        <span className="font-mono text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString('id-ID')}</span>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 border-2 border-black border-dashed mt-4">
                    <ul className="space-y-1 font-mono text-sm">
                        {order.items?.map((item: any) => (
                            <li key={item.id} className="flex justify-between">
                                <span>{item.quantity}x {item.product?.name || 'Produk tidak diketahui'} {item.flavor ? `(${item.flavor})` : ''}</span>
                                <span>Rp{item.price.toLocaleString('id-ID')}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t-2 border-black mt-2 pt-2 flex justify-between font-black text-lg">
                        <span>TOTAL</span>
                        <span>Rp{order.total.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>

            {isPending && (
                <div className="flex flex-col justify-center gap-3 md:w-48 shrink-0">
                    <button onClick={onAccept} className="bg-white text-black border-4 border-black py-3 font-black uppercase hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000]">
                        <Check size={20} /> Terima
                    </button>
                    <button onClick={onReject} className="bg-gray-800 text-white border-4 border-black py-3 font-black uppercase hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000]">
                        <X size={20} /> Tolak
                    </button>
                </div>
            )}
        </div>
    );
}

function EditOrderForm({ order, onSubmit }: { order: any; onSubmit: (data: any) => void }) {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            total: order.total,
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block font-bold uppercase mb-1">Nama Pelanggan</label>
                <input {...register('customerName')} className="w-full border-2 border-black p-2 font-mono" required />
            </div>
            <div>
                <label className="block font-bold uppercase mb-1">No. WhatsApp</label>
                <input {...register('customerPhone')} className="w-full border-2 border-black p-2 font-mono" required />
            </div>
            <div>
                <label className="block font-bold uppercase mb-1">Total (Rp)</label>
                <input type="number" {...register('total', { valueAsNumber: true })} className="w-full border-2 border-black p-2 font-mono" required />
            </div>
            <button type="submit" className="w-full bg-black text-white font-bold uppercase py-3 hover:bg-gray-800 transition-colors">
                Simpan Perubahan
            </button>
        </form>
    );
}

function CreateOrderForm({ onSubmit, onFlavorError }: { onSubmit: (data: any) => void; onFlavorError: (msg: string) => void }) {
    const { register, control, handleSubmit, setValue, watch, reset, formState: { isSubmitSuccessful } } = useForm({
        defaultValues: {
            customerName: '',
            customerPhone: '',
            items: [{ productId: '', quantity: 1, price: 0, flavor: '' }]
        }
    });

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset({
                customerName: '',
                customerPhone: '',
                items: [{ productId: '', quantity: 1, price: 0, flavor: '' }]
            });
        }
    }, [isSubmitSuccessful, reset]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const { data: products } = useQuery({ queryKey: ['products'], queryFn: getProducts });

    const handleProductChange = (index: number, productId: string) => {
        const product = products?.find((p: any) => p.id === productId);
        if (product) {
            setValue(`items.${index}.price`, product.price);
            setValue(`items.${index}.flavor`, '');
        }
    };

    const submitHandler = (data: any) => {
        // Validate flavors with modal
        for (const item of data.items) {
            const product = products?.find((p: any) => p.id === item.productId);
            if (product && product.flavors?.length > 0 && !item.flavor) {
                onFlavorError(`Silakan pilih rasa untuk ${product.name}`);
                return;
            }
        }

        const orderData = {
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            total: data.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
            items: data.items.map((item: any) => ({
                productId: item.productId,
                quantity: Number(item.quantity),
                price: Number(item.price),
                flavor: item.flavor || ''
            }))
        };
        onSubmit(orderData);
    };

    const watchedItems = watch('items');

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div>
                <label className="block font-bold uppercase mb-1">Nama Pelanggan</label>
                <input {...register('customerName')} className="w-full border-2 border-black p-2 font-mono" required />
            </div>
            <div>
                <label className="block font-bold uppercase mb-1">No. WhatsApp</label>
                <input
                    {...register('customerPhone')}
                    className="w-full border-2 border-black p-2 font-mono"
                    type="tel"
                    pattern="[0-9]*"
                    onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                    }}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="block font-bold uppercase mb-1">Item</label>
                {fields.map((field, index) => {
                    const selectedProductId = watchedItems[index]?.productId;
                    const selectedProduct = products?.find((p: any) => p.id === selectedProductId);

                    return (
                        <div key={field.id} className="flex gap-2 items-start border-2 border-black p-3 bg-gray-50 border-dashed">
                            <div className="flex-1 space-y-2">
                                <Controller
                                    control={control}
                                    name={`items.${index}.productId` as const}
                                    render={({ field }) => (
                                        <CustomDropdown
                                            value={field.value}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                handleProductChange(index, val);
                                            }}
                                            options={[
                                                { value: '', label: 'Pilih Produk...' },
                                                ...(products?.map((p: any) => ({ value: p.id, label: p.name })) || [])
                                            ]}
                                            className="w-full"
                                        />
                                    )}
                                />

                                {selectedProduct?.flavors && selectedProduct.flavors.length > 0 && (
                                    <Controller
                                        control={control}
                                        name={`items.${index}.flavor` as const}
                                        render={({ field }) => (
                                            <CustomDropdown
                                                value={field.value}
                                                onChange={field.onChange}
                                                options={[
                                                    { value: '', label: 'Pilih Rasa...' },
                                                    ...selectedProduct.flavors.map((f: string) => ({ value: f, label: f }))
                                                ]}
                                                className="w-full"
                                            />
                                        )}
                                    />
                                )}

                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        {...register(`items.${index}.quantity` as const)}
                                        className="w-20 border-2 border-black p-1 text-sm font-mono"
                                        min="1"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Harga"
                                        {...register(`items.${index}.price` as const)}
                                        className="w-full border-2 border-black p-1 text-sm font-mono bg-gray-200"
                                        readOnly
                                        required
                                    />
                                </div>
                            </div>
                            <button type="button" onClick={() => remove(index)} className="text-black hover:text-red-600 font-bold p-1">
                                <X size={20} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <button type="button" onClick={() => append({ productId: '', quantity: 1, price: 0, flavor: '' })} className="text-sm underline font-bold uppercase tracking-wider">
                + Tambah Item Lain
            </button>

            <button type="submit" className="w-full bg-black text-white font-bold uppercase py-3 mt-4 hover:bg-gray-800 transition-colors border-2 border-transparent hover:border-black shadow-[4px_4px_0px_0px_#000]">
                Buat Pesanan
            </button>
        </form>
    );
}
