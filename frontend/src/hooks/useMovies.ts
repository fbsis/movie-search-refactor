import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { movieApi } from "@/lib/api";
import type {
  Movie,
  SearchMoviesResponse,
  FavoritesResponse,
} from "@/types/movie";

const queryOptions = {
  retry: 2,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  throwOnError: false,
};

const favoritesQueryKeyRoot = ["movies", "favorites"] as const;
const searchQueryKeyRoot = ["movies", "search"] as const;

type SearchCacheEntry = [unknown, SearchMoviesResponse | undefined];
type FavoritesCacheEntry = [unknown, FavoritesResponse | undefined];

interface OptimisticContext {
  previousSearch: SearchCacheEntry[];
  previousFavorites: FavoritesCacheEntry[];
}

const cancelMoviesQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.cancelQueries({ queryKey: searchQueryKeyRoot });
  await queryClient.cancelQueries({ queryKey: favoritesQueryKeyRoot });
};

const snapshotMoviesCache = (queryClient: ReturnType<typeof useQueryClient>): OptimisticContext => ({
  previousSearch: queryClient.getQueriesData<SearchMoviesResponse>({
    queryKey: searchQueryKeyRoot,
  }),
  previousFavorites: queryClient.getQueriesData<FavoritesResponse>({
    queryKey: favoritesQueryKeyRoot,
  }),
});

const rollbackMoviesCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  context?: OptimisticContext | null,
) => {
  if (!context) return;

  context.previousSearch.forEach(([key, data]) => {
    queryClient.setQueryData(key as readonly unknown[], data);
  });
  context.previousFavorites.forEach(([key, data]) => {
    queryClient.setQueryData(key as readonly unknown[], data);
  });
};

export const useSearchMovies = (
  query: string,
  page: number = 1,
  enabled: boolean = false,
) => {
  return useQuery({
    queryKey: ["movies", "search", query, page],
    queryFn: () => movieApi.searchMovies(query, page),
    enabled: enabled && query.trim().length > 0,
    ...queryOptions,
  });
};

export const useFavorites = (page: number = 1) => {
  return useQuery({
    queryKey: ["movies", "favorites", page],
    queryFn: () => movieApi.getFavorites(page),
    ...queryOptions,
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: movieApi.addToFavorites,
    // Optimistic update: update search and favorites cache without refetching
    onMutate: async (movieToAdd: Movie): Promise<OptimisticContext> => {
      await cancelMoviesQueries(queryClient);

      // Snapshot previous state for potential rollback
      const context = snapshotMoviesCache(queryClient);

      // In search results: mark movie as favorite in all queries
      queryClient.setQueriesData<SearchMoviesResponse>(
        { queryKey: searchQueryKeyRoot },
        (old) => {
          if (!old?.data?.movies) return old;
          return {
            ...old,
            data: {
              ...old.data,
              movies: old.data.movies.map((movie) =>
                movie.imdbID === movieToAdd.imdbID
                  ? { ...movie, isFavorite: true }
                  : movie,
              ),
            },
          };
        },
      );

      // In favorites: add movie to the current page (typically page 1)
      queryClient.setQueriesData<FavoritesResponse>(
        { queryKey: favoritesQueryKeyRoot },
        (old) => {
          if (!old?.data) return old;

          const isPageOne = old.data.currentPage === 1;
          const existingFavorites = old.data.favorites ?? [];

          // Avoid duplicates
          const filtered = existingFavorites.filter(
            (fav) => fav.imdbID !== movieToAdd.imdbID,
          );
          const newFavorites = isPageOne
            ? [movieToAdd, ...filtered]
            : existingFavorites;

          const currentTotal = Number(old.data.totalResults ?? 0);

          return {
            ...old,
            data: {
              ...old.data,
              favorites: newFavorites,
              count: newFavorites.length,
              totalResults: String(currentTotal + 1),
            },
          };
        },
      );

      return context;
    },
    // Roll back in case of error
    onError: (_error, _variables, context) => {
      rollbackMoviesCache(queryClient, context);
    },
    // Do not refetch here to avoid extra network calls
    ...queryOptions,
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: movieApi.removeFromFavorites,
    // Simple approach: after a successful removal, refetch favorites so UI matches backend
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoritesQueryKeyRoot });
    },
    ...queryOptions,
  });
};

