import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    cartId: string;
    name: string;
    price: number;
    flavor: string;
    quantity: number;
    image: string;
    stock: number;
}

interface StoreState {
    cart: CartItem[];
    isModalOpen: boolean;
    isMobileMenuOpen: boolean;
    addToCart: (item: Omit<CartItem, 'cartId'>) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    removeFromCart: (cartId: string) => void;
    setModalOpen: (isOpen: boolean) => void;
    setMobileMenuOpen: (isOpen: boolean) => void;
    adminTab: 'CMS' | 'IMS' | 'ORDERS' | 'STATS';
    setAdminTab: (tab: 'CMS' | 'IMS' | 'ORDERS' | 'STATS') => void;
    clearCart: () => void;
    getProductQuantityInCart: (productId: string) => number;
    getRemainingStock: (productId: string, totalStock: number) => number;
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            cart: [],
            isModalOpen: false,
            isMobileMenuOpen: false,

            // Helper: Get total quantity of a product in cart (all flavors)
            getProductQuantityInCart: (productId: string) => {
                return get().cart
                    .filter(item => item.id === productId)
                    .reduce((sum, item) => sum + item.quantity, 0);
            },

            // Helper: Get remaining stock for a product
            getRemainingStock: (productId: string, totalStock: number) => {
                const inCart = get().getProductQuantityInCart(productId);
                return Math.max(0, totalStock - inCart);
            },

            addToCart: (item) => set((state) => {
                // Calculate total quantity of this product already in cart
                const totalInCart = state.cart
                    .filter(i => i.id === item.id)
                    .reduce((sum, i) => sum + i.quantity, 0);

                // Check if adding this would exceed stock
                const maxCanAdd = Math.max(0, item.stock - totalInCart);
                if (maxCanAdd <= 0) {
                    return state; // Can't add more
                }

                const existing = state.cart.find(i => i.id === item.id && i.flavor === item.flavor);
                if (existing) {
                    // Add to existing, but limit to remaining stock
                    const addAmount = Math.min(item.quantity, maxCanAdd);
                    return {
                        cart: state.cart.map(i =>
                            (i.id === item.id && i.flavor === item.flavor)
                                ? { ...i, quantity: i.quantity + addAmount }
                                : i
                        )
                    };
                }

                // New item - limit to remaining stock
                const limitedQuantity = Math.min(item.quantity, maxCanAdd);
                return {
                    cart: [...state.cart, {
                        ...item,
                        quantity: limitedQuantity,
                        cartId: Math.random().toString()
                    }]
                };
            }),

            setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
            setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
            adminTab: 'CMS',
            setAdminTab: (tab) => set({ adminTab: tab }),

            updateQuantity: (cartId, newQuantity) => set((state) => {
                const targetItem = state.cart.find(i => i.cartId === cartId);
                if (!targetItem) return state;

                // Calculate total quantity of other items with same product ID
                const otherItemsQty = state.cart
                    .filter(i => i.id === targetItem.id && i.cartId !== cartId)
                    .reduce((sum, i) => sum + i.quantity, 0);

                // Max allowed for this item
                const maxAllowed = targetItem.stock - otherItemsQty;
                const limitedQuantity = Math.min(Math.max(1, newQuantity), maxAllowed);

                return {
                    cart: state.cart.map(item =>
                        item.cartId === cartId
                            ? { ...item, quantity: limitedQuantity }
                            : item
                    )
                };
            }),

            removeFromCart: (cartId) => set((state) => ({
                cart: state.cart.filter(item => item.cartId !== cartId)
            })),

            clearCart: () => set({ cart: [] }),
        }),
        {
            name: 'vb-cart-storage',
            partialize: (state) => ({ cart: state.cart, adminTab: state.adminTab }),
        }
    )
);
