interface LoadingStateProps {
    text?: string;
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
}

export function LoadingState({
    text = 'Memuat...',
    size = 'md',
    fullScreen = false
}: LoadingStateProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-lg',
    };

    const content = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizeClasses[size]} relative`}>
                <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
            <span className={`font-mono ${textSizes[size]} uppercase text-gray-600 animate-pulse`}>
                {text}
            </span>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            {content}
        </div>
    );
}

// Skeleton loader components
export function SkeletonBox({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
    );
}

export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-gray-200 animate-pulse rounded"
                    style={{ width: i === lines - 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="border-2 border-gray-200 p-4 space-y-3">
            <SkeletonBox className="h-32 w-full" />
            <SkeletonText lines={2} />
            <div className="flex justify-between">
                <SkeletonBox className="h-6 w-20" />
                <SkeletonBox className="h-8 w-24" />
            </div>
        </div>
    );
}
