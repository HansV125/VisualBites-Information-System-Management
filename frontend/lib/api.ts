import { Product, Ingredient, IngredientGroup } from './data';
export type { Product, Ingredient, IngredientGroup };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getProducts(): Promise<Product[]> {
    // For server-side fetching in Next.js, we might need absolute URL. 
    // Browsers can use relative if proxied, but here we go direct to 4000.
    const res = await fetch(`${API_URL}/products`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

// Returns grouped inventory
export async function getInventory(): Promise<IngredientGroup[]> {
    const res = await fetch(`${API_URL}/inventory`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
}

// Returns flat inventory (for low stock alerts)
export async function getInventoryFlat(): Promise<Ingredient[]> {
    const res = await fetch(`${API_URL}/inventory?flat=true`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
}

// --- PRODUCTS ---
export async function createProduct(data: any) {
    const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
}

export async function updateProduct(id: string, data: any) {
    const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
}

export async function deleteProduct(id: string) {
    const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
}

export async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/products/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) throw new Error('Failed to upload image');
    return res.json();
}


// --- INVENTORY ---
export async function createIngredient(data: any) {
    const res = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create ingredient');
    return res.json();
}

export async function updateIngredient(id: string, data: any) {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update ingredient');
    return res.json();
}

export async function deleteIngredient(id: string) {
    const res = await fetch(`${API_URL}/inventory/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete ingredient');
    return res.json();
}

export async function adjustIngredientQuantity(id: string, amount: number, operation: 'add' | 'subtract') {
    const res = await fetch(`${API_URL}/inventory/${id}/adjust`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, operation }),
    });
    if (!res.ok) throw new Error('Failed to adjust quantity');
    return res.json();
}

// --- ORDERS ---
export async function createOrder(data: any) {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
}

export async function getOrders(status?: string) {
    const url = status ? `${API_URL}/orders?status=${status}` : `${API_URL}/orders`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
}

export async function updateOrderStatus(id: string, status: string) {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
}

export async function getStats() {
    const res = await fetch(`${API_URL}/orders/stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}

export async function deleteOrder(id: string) {
    const res = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete order');
    return res.json();
}

export async function updateOrder(id: string, data: any) {
    const res = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
}

// --- RECIPE ---
export async function setProductRecipe(productId: string, items: { ingredientId: string; quantity: number }[]) {
    const res = await fetch(`${API_URL}/products/${productId}/recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error('Failed to set product recipe');
    return res.json();
}

export async function getMe() {
    // include credentials to send cookie
    const res = await fetch(`${API_URL}/auth/me`, { cache: 'no-store', credentials: 'include' });
    if (!res.ok) throw new Error('Not logged in');
    return res.json();
}
