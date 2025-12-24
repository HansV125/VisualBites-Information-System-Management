import { z } from 'zod';

export interface Product {
    id: string;
    name: string;
    tag: string;
    badge: string | null;
    description: string;
    price: number;
    stock: number;
    flavors: string[];
    image: string;
    sticker: string | null;
    status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
    soldCount: number;
    updatedAt?: string;
    recipe?: any[];
    hasOutOfStock?: boolean;
}

export interface Ingredient {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    minStock: number;
    expiryDate?: string | null;
    expiryWarningDays?: number; // Days before expiry to show warning (default 7)
    updatedAt: string;
}

export interface IngredientGroup {
    name: string;
    unit: string;
    minStock: number;
    totalQuantity: number;
    batches: Ingredient[];
}

export const addToCartSchema = z.object({
    flavor: z.string().min(1, "Select a flavor"),
    quantity: z.number().min(1, "At least 1 item required"),
});

export const checkoutSchema = z.object({
    name: z.string().min(2, "Name required").max(100),
    notes: z.string().optional(),
    phone: z.string()
        .min(10, "Number too short")
        .max(15, "Number too long")
        .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Invalid Indonesian WhatsApp Format (e.g. 0812...)"),
});

export type AddToCartFormData = z.infer<typeof addToCartSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
