'use client';

import { useCallback } from 'react';
import { useStore, CartItem } from '@/lib/store';

export function useCart() {
    const {
        cart,
        addToCart: storeAddToCart,
        removeFromCart: storeRemoveFromCart,
        updateQuantity: storeUpdateQuantity,
        clearCart: storeClearCart
    } = useStore();

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const isEmpty = cart.length === 0;

    const addToCart = useCallback((item: Omit<CartItem, 'cartId'>) => {
        storeAddToCart(item);
    }, [storeAddToCart]);

    const removeFromCart = useCallback((cartId: string) => {
        storeRemoveFromCart(cartId);
    }, [storeRemoveFromCart]);

    const updateQuantity = useCallback((cartId: string, quantity: number) => {
        storeUpdateQuantity(cartId, quantity);
    }, [storeUpdateQuantity]);

    const clearCart = useCallback(() => {
        storeClearCart();
    }, [storeClearCart]);

    const getItemQuantity = useCallback((productId: string, flavor?: string) => {
        const item = cart.find(i => i.id === productId && (!flavor || i.flavor === flavor));
        return item?.quantity || 0;
    }, [cart]);

    return {
        cart,
        cartTotal,
        cartCount,
        isEmpty,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
    };
}
