'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/lib/store';
import { checkoutSchema, type CheckoutFormData } from '@/lib/data';
import { ReceiptItem } from './receipt-item';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseButton } from './ui/close-button';
import { escapeHtml, sanitizePhone } from '@/lib/sanitize';

export function MobilePurchaseModal() {
    const { isModalOpen, setModalOpen, cart, clearCart } = useStore();
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const [showItems, setShowItems] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema)
    });

    const onCheckout = async (data: CheckoutFormData) => {
        // Sanitize inputs
        const sanitizedName = escapeHtml(data.name.trim());
        const sanitizedPhone = sanitizePhone(data.phone);
        const sanitizedNotes = data.notes ? escapeHtml(data.notes.trim()) : '';

        // Create order in backend
        try {
            const { createOrder } = await import('@/lib/api');
            await createOrder({
                customerName: sanitizedName,
                customerPhone: sanitizedPhone,
                total: cartTotal,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    flavor: item.flavor
                }))
            });
        } catch (error) {
            console.error('Failed to create order:', error);
        }

        const productList = cart.map(i => `- ${i.quantity}x ${escapeHtml(i.name)} (${escapeHtml(i.flavor)})`).join('\n');

        const message = `Halo, Visual Bites.

Saya A/N ${sanitizedName} mau beli:
${productList}

Untuk proses selanjutnya bagaimana, ya?
Catatan: ${sanitizedNotes || '-'}

Pertanyaan tambahan:

Terima kasih`;

        const url = `https://wa.me/6281382328258?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        clearCart();
        setModalOpen(false);
    };

    if (!isModalOpen) return null;

    return (
        <AnimatePresence>
            {isModalOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-50 bg-paper flex flex-col lg:hidden"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b-2 border-black bg-cream shrink-0">
                        <h2 className="font-marker text-2xl">Checkout</h2>
                        <CloseButton
                            onClick={() => setModalOpen(false)}
                            className="p-1"
                        />
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-6">
                        {/* Order Summary */}
                        <div className="border-2 border-black bg-cream p-4 shadow-sm relative">
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => setShowItems(!showItems)}
                            >
                                <div className="font-mono text-sm uppercase font-bold">Order Summary</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-display text-xl font-bold">Rp{cartTotal.toLocaleString('id-ID')}</span>
                                    {showItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            <AnimatePresence>
                                {showItems && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-4 mt-2 border-t-2 border-dashed border-black/20 flex flex-col gap-2">
                                            {cart.map((item) => (
                                                <ReceiptItem key={item.cartId} item={item} />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Form */}
                        <form id="mobile-checkout-form" onSubmit={handleSubmit(onCheckout)} className="flex flex-col gap-4">
                            <div>
                                <label className="font-mono text-xs uppercase font-bold text-gray-800 block mb-1">Nama Lengkap</label>
                                <input
                                    {...register('name')}
                                    className="w-full input-lined font-receipt text-base uppercase px-2 py-2 bg-transparent"
                                    placeholder="Nama Anda"
                                />
                                {errors.name && <span className="text-red-600 text-xs font-mono block mt-1">{errors.name.message}</span>}
                            </div>
                            <div>
                                <label className="font-mono text-xs uppercase font-bold text-gray-800 block mb-1">No. WhatsApp</label>
                                <input
                                    {...register('phone')}
                                    type="tel"
                                    className="w-full input-lined font-receipt text-base px-2 py-2 bg-transparent"
                                    placeholder="0812-XXXX-XXXX"
                                />
                                {errors.phone && <span className="text-red-600 text-xs font-mono block mt-1">{errors.phone.message}</span>}
                            </div>
                            <div>
                                <label className="font-mono text-xs uppercase font-bold text-gray-800 block mb-1">Catatan (Optional)</label>
                                <textarea
                                    {...register('notes')}
                                    rows={3}
                                    className="w-full input-lined font-receipt text-base px-2 py-2 bg-transparent resize-none"
                                    placeholder="Catatan tambahan..."
                                />
                            </div>
                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t-2 border-black bg-cream shrink-0">
                        <button
                            type="submit"
                            form="mobile-checkout-form"
                            disabled={cart.length === 0}
                            className="w-full bg-black text-white font-mono text-lg uppercase py-4 border-2 border-black btn-invert-dark disabled:opacity-50 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                        >
                            Pesan via WhatsApp
                            <MessageCircle size={20} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
