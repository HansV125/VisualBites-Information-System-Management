'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProducts, Product } from '@/lib/api';
import { CACHE_DURATION } from '@/lib/constants';

export function useProducts() {
    const queryClient = useQueryClient();

    const {
        data: products = [],
        isLoading,
        error,
        refetch,
    } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: getProducts,
        staleTime: CACHE_DURATION.products,
    });

    const activeProducts = products.filter(p => p.status === 'ACTIVE');
    const draftProducts = products.filter(p => p.status === 'DRAFT');
    const archivedProducts = products.filter(p => p.status === 'ARCHIVED');

    const invalidateProducts = () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
    };

    return {
        products,
        activeProducts,
        draftProducts,
        archivedProducts,
        isLoading,
        error,
        refetch,
        invalidateProducts,
    };
}
