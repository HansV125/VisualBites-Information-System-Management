'use client';

import { CartItem } from '@/lib/store';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface ReceiptItemProps {
    item: CartItem;
}

export function ReceiptItem({ item }: ReceiptItemProps) {
    const { updateQuantity, removeFromCart } = useStore();
    const [showConfirm, setShowConfirm] = useState(false);

    if (showConfirm) {
        return (
            <div className="font-receipt text-xl bg-gray-100 p-2 border-2 border-black border-dashed flex flex-col items-center justify-center gap-2 animate-in zoom-in duration-200">
                <div className="font-bold text-center text-sm uppercase">Hapus item ini?</div>
                <div className="flex gap-2 w-full">
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 bg-white text-black text-xs font-bold uppercase py-1 border-2 border-black hover:bg-gray-200"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="flex-1 bg-black text-white text-xs font-bold uppercase py-1 border-2 border-black hover:bg-gray-800"
                    >
                        Ya
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="font-receipt text-base leading-tight mb-3 group relative">
            <div className="flex justify-between items-start">
                <div className="uppercase font-bold flex-1">{item.name}</div>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 text-red-600"
                    title="Hapus"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            <div className="flex justify-between text-gray-800 text-base items-center">
                <div className="flex flex-col items-start">
                    <span className="uppercase text-base">{item.flavor}</span>
                    <div className="flex justify-start items-center select-none mt-1">
                        <span>Qty: </span>
                        <button
                            className="font-bold px-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (item.quantity > 1) updateQuantity(item.cartId, item.quantity - 1);
                                else setShowConfirm(true);
                            }}
                        >
                            -
                        </button>
                        <span className="font-bold mx-2">{item.quantity}</span>
                        <button
                            className="font-bold px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity >= item.stock}
                            onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.cartId, Math.min(item.stock, item.quantity + 1));
                            }}
                        >
                            +
                        </button>
                    </div>
                </div>
                <span className="font-bold">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
        </div>
    );
}
