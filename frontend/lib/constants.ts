// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Application Constants
export const APP_NAME = 'VisualBites';
export const APP_DESCRIPTION = 'Frozen Food Specialist';

// Contact Information
export const CONTACT = {
    whatsapp: '+6281382328258',
    whatsappLink: 'https://wa.me/6281382328258',
    instagram: 'visualbites25',
    instagramLink: 'https://instagram.com/visualbites25',
    tokopedia: 'https://tokopedia.link/visualbites',
    shopee: 'https://shopee.co.id/visualbites',
} as const;

// Order Status Type
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

// Order Status Configuration (complete)
export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
}> = {
    PENDING: { label: 'Menunggu', color: 'bg-yellow-400', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
    CONFIRMED: { label: 'Dikonfirmasi', color: 'bg-blue-500', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
    PROCESSING: { label: 'Diproses', color: 'bg-purple-500', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    READY: { label: 'Siap Dikirim', color: 'bg-orange-500', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
    SHIPPED: { label: 'Terkirim', color: 'bg-cyan-600', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800' },
    COMPLETED: { label: 'Selesai', color: 'bg-green-600', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    CANCELLED: { label: 'Dibatalkan', color: 'bg-red-500', bgColor: 'bg-red-100', textColor: 'text-red-800' },
};

// Order Status Labels (simple)
export const ORDER_STATUS_LABELS: Record<string, string> = {
    PENDING: 'Menunggu',
    CONFIRMED: 'Dikonfirmasi',
    PROCESSING: 'Diproses',
    READY: 'Siap',
    SHIPPED: 'Dikirim',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
};

// Order Status Workflow
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['READY', 'CONFIRMED'],
    READY: ['SHIPPED', 'PROCESSING'],
    SHIPPED: ['COMPLETED', 'READY'],
    COMPLETED: ['SHIPPED'],
    CANCELLED: [],
};

// Product Status Labels
export const PRODUCT_STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Aktif',
    DRAFT: 'Draft',
    ARCHIVED: 'Diarsipkan',
};

// Admin Tab IDs
export const ADMIN_TABS = {
    CMS: 'CMS',
    IMS: 'IMS',
    ORDERS: 'ORDERS',
    STATS: 'STATS',
} as const;

export type AdminTabId = (typeof ADMIN_TABS)[keyof typeof ADMIN_TABS];

// Pagination defaults
export const PAGINATION = {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
} as const;

// Date formatting
export const DATE_LOCALE = 'id-ID';
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
};

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
    products: 5 * 60 * 1000, // 5 minutes
    inventory: 2 * 60 * 1000, // 2 minutes
    orders: 1 * 60 * 1000, // 1 minute
    user: 10 * 60 * 1000, // 10 minutes
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
} as const;

// Validation
export const VALIDATION = {
    minNameLength: 2,
    maxNameLength: 100,
    phonePattern: /^(\+62|62|0)8[1-9][0-9]{6,10}$/,
} as const;
