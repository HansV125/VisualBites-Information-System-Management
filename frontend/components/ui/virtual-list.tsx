'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, ReactNode } from 'react';

interface VirtualListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    estimateSize?: number;
    overscan?: number;
    className?: string;
    gap?: number;
}

export function VirtualList<T>({
    items,
    renderItem,
    estimateSize = 80,
    overscan = 5,
    className = '',
    gap = 0,
}: VirtualListProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimateSize,
        overscan,
        gap,
    });

    const virtualItems = virtualizer.getVirtualItems();

    if (items.length === 0) {
        return null;
    }

    return (
        <div
            ref={parentRef}
            className={`overflow-auto ${className}`}
            style={{ contain: 'strict' }}
        >
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualItems.map((virtualItem) => (
                    <div
                        key={virtualItem.key}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                        }}
                    >
                        {renderItem(items[virtualItem.index], virtualItem.index)}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Grid variant for product grids
interface VirtualGridProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    columns?: number;
    rowHeight?: number;
    overscan?: number;
    className?: string;
}

export function VirtualGrid<T>({
    items,
    renderItem,
    columns = 3,
    rowHeight = 300,
    overscan = 2,
    className = '',
}: VirtualGridProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowCount = Math.ceil(items.length / columns);

    const virtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan,
    });

    const virtualRows = virtualizer.getVirtualItems();

    if (items.length === 0) {
        return null;
    }

    return (
        <div
            ref={parentRef}
            className={`overflow-auto ${className}`}
            style={{ contain: 'strict' }}
        >
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualRows.map((virtualRow) => {
                    const startIndex = virtualRow.index * columns;
                    const rowItems = items.slice(startIndex, startIndex + columns);

                    return (
                        <div
                            key={virtualRow.key}
                            className="grid gap-4"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                            }}
                        >
                            {rowItems.map((item, i) => (
                                <div key={startIndex + i}>
                                    {renderItem(item, startIndex + i)}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
