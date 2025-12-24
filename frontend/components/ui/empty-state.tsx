import { ShoppingBag } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                {icon || <ShoppingBag className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="font-mono text-lg font-bold uppercase text-gray-800 mb-2">
                {title}
            </h3>
            {description && (
                <p className="font-hand text-gray-600 max-w-sm mb-4">
                    {description}
                </p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}

// Pre-built empty states
export function EmptyCart() {
    return (
        <EmptyState
            title="Keranjang Kosong"
            description="Belum ada item di keranjang. Yuk, mulai belanja!"
        />
    );
}

export function EmptyOrders() {
    return (
        <EmptyState
            title="Belum Ada Pesanan"
            description="Belum ada pesanan masuk. Tunggu pelanggan memesan ya!"
        />
    );
}

export function EmptyProducts() {
    return (
        <EmptyState
            title="Belum Ada Produk"
            description="Tambahkan produk pertama untuk memulai."
        />
    );
}

export function EmptyInventory() {
    return (
        <EmptyState
            title="Inventori Kosong"
            description="Tambahkan bahan baku untuk memulai mengelola stok."
        />
    );
}
