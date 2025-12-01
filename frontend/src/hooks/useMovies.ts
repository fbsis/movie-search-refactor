import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movieApi } from '@/lib/api';

const queryOptions = {
  retry: 2, // Retry failed requests up to 2 times
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
  throwOnError: false, // Don't throw errors, return them in the error property
};

const invalidateFavoritesQueryKeys = ['movies', 'favorites'];
const invalidateSearchQueryKeys = ['movies', 'search'];

export const useSearchMovies = (
  query: string,
  page: number = 1,
  enabled: boolean = false,
) => {
  return useQuery({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => movieApi.searchMovies(query, page),
    enabled: enabled && query.trim().length > 0,
    ...queryOptions,
  });
};

export const useFavorites = (page: number = 1) => {
  return useQuery({
    queryKey: ['movies', 'favorites', page],
    queryFn: () => movieApi.getFavorites(page),
    ...queryOptions,
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieApi.addToFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invalidateFavoritesQueryKeys });
      queryClient.invalidateQueries({ queryKey: invalidateSearchQueryKeys });
    },
    ...queryOptions,
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieApi.removeFromFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invalidateFavoritesQueryKeys });
      queryClient.invalidateQueries({ queryKey: invalidateSearchQueryKeys });
    },
    ...queryOptions,
  });
};

