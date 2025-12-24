'use client';

import { ArrowRight, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ReceiptItem } from './receipt-item';

export function MobileReceipt() {
    const { cart, setModalOpen, setMobileMenuOpen } = useStore();
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="flex flex-col flex-grow w-full bg-cream receipt-texture p-4">
            <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-black pb-2">
                <h3 className="font-receipt text-xl">Current Order</h3>
            </div>

            <div className="flex-grow mb-4 overflow-y-auto pr-2">
                {cart.length === 0 ? (
                    <div className="text-center py-8 font-receipt text-lg text-gray-500">No items yet</div>
                ) : (
                    cart.map((item) => <ReceiptItem key={item.cartId} item={item} />)
                )}
            </div>

            <div className="pt-4 border-t-2 border-dashed border-black mt-auto">
                <div className="flex justify-between font-receipt text-xl font-bold mb-4">
                    <span>TOTAL</span>
                    <span>Rp{cartTotal.toLocaleString('id-ID')}</span>
                </div>
                <button
                    onClick={() => {
                        setMobileMenuOpen(false);
                        setModalOpen(true);
                    }}
                    disabled={cart.length === 0}
                    className="w-full bg-black text-white font-mono text-xs h-10 uppercase tracking-wider border-2 border-black btn-invert-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    Checkout
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
