'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, MessageCircle, Minus, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { checkoutSchema, type CheckoutFormData } from '@/lib/data';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CloseButton } from './ui/close-button';
import { escapeHtml, sanitizePhone } from '@/lib/sanitize';

export function PurchaseModal() {
    const { isModalOpen, setModalOpen, cart, clearCart, updateQuantity, removeFromCart } = useStore();
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const [currentDate, setCurrentDate] = useState<Date | null>(null);

    useEffect(() => {
        if (isModalOpen) {
            setCurrentDate(new Date());
        }
    }, [isModalOpen]);

    const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema)
    });

    const onCheckout = async (data: CheckoutFormData) => {
        try {
            // Sanitize user inputs before submission
            const sanitizedName = escapeHtml(data.name.trim());
            const sanitizedPhone = sanitizePhone(data.phone);
            const sanitizedNotes = data.notes ? escapeHtml(data.notes.trim()) : '';

            // Create Order in Backend first (Status: PENDING)
            const orderData = {
                customerName: sanitizedName,
                customerPhone: sanitizedPhone,
                total: cartTotal,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    flavor: item.flavor
                }))
            };

            const { createOrder } = await import('@/lib/api');
            const order = await createOrder(orderData);

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
        } catch (error) {
            console.error(error);
            alert("Failed to process order. Please try again.");
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="w-full max-w-6xl bg-cream receipt-texture border-2 border-black relative shadow-2xl flex flex-col md:flex-row">
                <CloseButton
                    onClick={() => setModalOpen(false)}
                    className="absolute top-4 right-4 z-50"
                />

                <div className="flex-1 p-8 md:p-12 border-b-2 md:border-b-0 md:border-r-2 border-dashed border-black">
                    <div className="text-center border-b-2 border-dashed border-black pb-6 mb-2">
                        <div className="flex justify-center pb-2">
                            <Image
                                src="/logo/VisualBitesLandscapeBlack.svg"
                                alt="VisualBites"
                                width={200}
                                height={60}
                                className="h-12 w-auto"
                            />
                        </div>
                        <div className="font-receipt text-xl text-gray-800 mt-2">Ilmu Komputer 23</div>
                        <div className="font-receipt text-xl text-gray-800">Universitas Negeri Jakarta</div>
                        <div className="font-receipt text-xl text-gray-800 mt-1">WA: (+62) 813-8232-8258</div>
                        <div className="mt-4 pt-3 border-t border-dashed border-gray-400 font-receipt text-2xl flex justify-between h-8">
                            <span>{currentDate ? currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                            <span>REF: #{Math.floor(Math.random() * 999999).toString().padStart(6, '0')}</span>
                            <span>{currentDate ? currentDate.toLocaleDateString() : ''}</span>
                        </div>
                    </div>

                    <div className="mb-2">
                        <div className="font-receipt text-2xl uppercase text-gray-800 mb-2 border-b border-black pb-2">ORDER ITEMS</div>
                        {cart.length === 0 ? (
                            <div className="font-receipt text-3xl text-gray-800 py-6 text-center">-- EMPTY --</div>
                        ) : (
                            cart.map(item => (
                                <div key={item.cartId} className="font-receipt text-2xl mb-4">
                                    <div className="flex justify-between font-bold">
                                        <span className="uppercase">{item.name} {item.flavor}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center select-none font-mono font-bold text-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (item.quantity > 1) updateQuantity(item.cartId, item.quantity - 1);
                                                        else removeFromCart(item.cartId);
                                                    }}
                                                    className="px-2 hover:bg-black hover:text-white transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="mx-1 min-w-[20px] text-center">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.cartId, Math.min(item.stock, item.quantity + 1))}
                                                    disabled={item.quantity >= item.stock}
                                                    className="px-2 hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="text-2xl">@ Rp{item.price.toLocaleString('id-ID')}</span>
                                        </div>
                                        <span>Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t-2 border-black pt-4">
                        <div className="flex justify-between font-receipt text-3xl font-bold">
                            <span>TOTAL</span>
                            <span>Rp{cartTotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="font-receipt text-xl text-center text-gray-800 mt-6 uppercase">
                            Terima Kasih Telah Berbelanja!
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-8 md:p-12 flex flex-col">
                    <div className="font-receipt text-3xl uppercase text-gray-800 mb-6 border-b border-black pb-2">CUSTOMER INFO</div>

                    <form onSubmit={handleSubmit(onCheckout)} id="checkout-form" className="space-y-8 flex-grow">
                        <div>
                            <label className="font-mono text-2xl uppercase text-gray-800 block mb-2">Nama Lengkap</label>
                            <input
                                {...register('name')}
                                className="w-full input-lined font-receipt text-2xl uppercase"
                                placeholder="Nama Anda"
                            />
                            {errors.name && <span className="text-red-600 text-base font-mono block mt-2">{errors.name.message}</span>}
                        </div>
                        <div>
                            <label className="font-mono text-xl uppercase text-gray-800 block mb-2">No. WhatsApp</label>
                            <input
                                {...register('phone')}
                                className="w-full input-lined font-receipt text-2xl"
                                placeholder="0812-XXXX-XXXX"
                            />
                            {errors.phone && <span className="text-red-600 text-base font-mono block mt-2">{errors.phone.message}</span>}
                        </div>
                        <div>
                            <label className="font-mono text-xl uppercase text-gray-800 block mb-2">Catatan (Optional)</label>
                            <textarea
                                {...register('notes')}
                                rows={2}
                                className="w-full input-lined font-receipt text-2xl resize-none"
                                placeholder="Catatan tambahan..."
                            />
                        </div>
                    </form>

                    <div className="mt-8">
                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={cart.length === 0}
                            className="w-full bg-black text-white font-mono text-2xl uppercase py-5 border-2 border-black btn-invert-dark disabled:opacity-50 flex items-center justify-center gap-4"
                        >
                            Pesan via WhatsApp
                            <MessageCircle size={28} />
                        </button>
                    </div>
                </div>

                <div className="receipt-zigzag-bottom" />
            </div>
        </div>
    );
}
