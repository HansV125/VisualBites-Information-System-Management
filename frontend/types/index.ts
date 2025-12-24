// Product types
export interface Product {
    id: string;
    name: string;
    tag: string;
    badge?: string;
    description: string;
    price: number;
    stock: number;
    flavors: string[];
    image: string;
    sticker?: string;
    status: ProductStatus;
    soldCount?: number;
    createdAt?: string;
    updatedAt?: string;
    recipe?: ProductIngredient[];
    hasOutOfStock?: boolean;
}

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface ProductIngredient {
    id: string;
    productId: string;
    ingredientId: string;
    quantity: number;
    ingredient: Ingredient;
    availableStock?: number;
    isOutOfStock?: boolean;
}

// Ingredient types
export interface Ingredient {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    minStock: number;
    expiryDate?: string;
    updatedAt: string;
}

export interface GroupedIngredient {
    name: string;
    unit: string;
    minStock: number;
    totalQuantity: number;
    batches: Ingredient[];
}

// Order types
export interface Order {
    id: string;
    customerName: string;
    customerPhone: string;
    total: number;
    status: OrderStatus;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'READY'
    | 'SHIPPED'
    | 'COMPLETED'
    | 'CANCELLED';

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    flavor?: string;
    product?: Product;
}

// User types
export interface User {
    id: string;
    email: string;
    name?: string;
}

// Cart types
export interface CartItem {
    cartId: string;
    id: string;
    name: string;
    price: number;
    flavor: string;
    quantity: number;
    image: string;
    stock: number;
}

// Form types
export interface AddToCartFormData {
    flavor: string;
    quantity: number;
}

export interface PurchaseFormData {
    customerName: string;
    customerPhone: string;
    deliveryMethod: 'pickup' | 'delivery';
    address?: string;
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

// Statistics types
export interface OrderStatistics {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    averageOrderValue: number;
    topProducts: Array<{
        productId: string;
        name: string;
        count: number;
    }>;
}
