import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

export interface User {
  id: number;
  username: string;
  name?: string;
  isAdmin: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
    error,
  };
}