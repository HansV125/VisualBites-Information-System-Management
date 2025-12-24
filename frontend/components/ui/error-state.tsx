import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    type?: 'error' | 'network' | 'notFound';
}

export function ErrorState({
    title,
    message,
    onRetry,
    type = 'error'
}: ErrorStateProps) {
    const icons = {
        error: <AlertTriangle className="w-8 h-8 text-red-500" />,
        network: <WifiOff className="w-8 h-8 text-orange-500" />,
        notFound: <AlertTriangle className="w-8 h-8 text-gray-400" />,
    };

    const defaultTitles = {
        error: 'Terjadi Kesalahan',
        network: 'Koneksi Terputus',
        notFound: 'Tidak Ditemukan',
    };

    const defaultMessages = {
        error: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        network: 'Periksa koneksi internet Anda dan coba lagi.',
        notFound: 'Data yang Anda cari tidak ditemukan.',
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 border-2 border-red-200">
                {icons[type]}
            </div>
            <h3 className="font-mono text-lg font-bold uppercase text-gray-800 mb-2">
                {title || defaultTitles[type]}
            </h3>
            <p className="font-hand text-gray-600 max-w-sm mb-4">
                {message || defaultMessages[type]}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white font-mono text-sm uppercase border-2 border-black hover:bg-white hover:text-black transition-colors"
                >
                    <RefreshCw size={16} />
                    Coba Lagi
                </button>
            )}
        </div>
    );
}
