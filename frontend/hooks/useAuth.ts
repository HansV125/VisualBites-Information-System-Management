'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe } from '@/lib/api';
import { API_URL } from '@/lib/constants';

interface User {
    id: string;
    email: string;
    name?: string;
}

export function useAuth() {
    const queryClient = useQueryClient();

    const { data: user, isLoading, error, refetch } = useQuery<User | null>({
        queryKey: ['me'],
        queryFn: getMe,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const isLoggedIn = !!user;

    const logout = async () => {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        queryClient.setQueryData(['me'], null);
        queryClient.invalidateQueries({ queryKey: ['me'] });
    };

    return {
        user,
        isLoggedIn,
        isLoading,
        error,
        logout,
        refetch,
    };
}
