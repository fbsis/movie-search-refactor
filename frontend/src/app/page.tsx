'use client';

import { useState, useMemo, useRef } from 'react';
import { useSearchMovies, useAddToFavorites, useRemoveFromFavorites } from '@/hooks/useMovies';
import { Movie } from '@/types/movie';
import SearchBar from '@/components/searchBar';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/pagination';


export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: searchResults, isLoading } = useSearchMovies(searchQuery, currentPage, searchEnabled);
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  
  // Track which movie is currently being processed to prevent race conditions
  // Using ref for immediate updates without causing re-renders during processing
  const processingMovieIdRef = useRef<string | null>(null);
  // Using state to trigger re-render when processing starts/ends
  const [processingMovieId, setProcessingMovieId] = useState<string | null>(null);

  // Default page size for OMDb API (can be overridden by API response)
  const DEFAULT_PAGE_SIZE = 10;

  // Memoized calculation: only recalculates when searchResults changes
  // Uses count from API response if available, otherwise falls back to default
  // This makes pagination resilient to API page size changes
  const totalPages = useMemo(() => {
    if (!searchResults?.data.totalResults) {
      return 0;
    }

    const totalResults = parseInt(searchResults.data.totalResults, 10);
    if (isNaN(totalResults) || totalResults <= 0) {
      return 0;
    }

    // Use count from current page if available, otherwise use default
    const pageSize = searchResults.data.count > 0 
      ? searchResults.data.count 
      : DEFAULT_PAGE_SIZE;

    return Math.ceil(totalResults / pageSize);
  }, [searchResults?.data.totalResults, searchResults?.data.count]);

  // Calculate display state for empty/no results scenarios
  const displayState = useMemo(() => {
    if (isLoading) return 'loading';
    
    const hasResults = (searchResults?.data.movies.length ?? 0) > 0;
    const hasSearchQuery = searchQuery.trim().length > 0;

    if (hasResults) return 'results';
    if (hasSearchQuery) return 'no-results';
    return 'empty';
  }, [isLoading, searchResults?.data.movies.length, searchQuery]);

  const handleSearch = (query: string) => {
    // Validate query parameter
    if (!query || typeof query !== 'string') {
      console.warn('handleSearch: Invalid query parameter, expected non-empty string');
      return;
    }

    // Trim whitespace and validate length
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length === 0) {
      // Reset search if query is empty
      setSearchQuery('');
      setSearchEnabled(false);
      setCurrentPage(1);
      return;
    }

    // Validate maximum length to prevent excessively long queries
    const MAX_QUERY_LENGTH = 200;
    if (trimmedQuery.length > MAX_QUERY_LENGTH) {
      console.warn(`handleSearch: Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`);
      // Truncate to max length instead of rejecting
      const truncatedQuery = trimmedQuery.substring(0, MAX_QUERY_LENGTH);
      setSearchQuery(truncatedQuery);
      setSearchEnabled(true);
      setCurrentPage(1);
      return;
    }

    // All validations passed, proceed with search
    setSearchQuery(trimmedQuery);
    setSearchEnabled(true);
    setCurrentPage(1);
  };

  const handleToggleFavorite = async (movie: Movie) => {
    // Prevent race conditions: if this specific movie is already being processed, ignore new requests
    if (processingMovieIdRef.current === movie.imdbID) {
      return;
    }

    // Mark this movie as being processed (both ref and state)
    processingMovieIdRef.current = movie.imdbID;
    setProcessingMovieId(movie.imdbID);

    try {
      if (movie.isFavorite) {
        await removeFromFavorites.mutateAsync(movie.imdbID);
      } else {
        await addToFavorites.mutateAsync(movie);
      }

      // The mutations already handle optimistic updates and cache invalidation
      // No need to manually invalidate - React Query handles this automatically
    } catch (error) {
      // Error handling: mutations already handle rollback via onError callbacks
      // The rollback will restore the UI state automatically
      // Log error for debugging and user feedback
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update favorites. Please try again.';
      
      console.error('Failed to toggle favorite:', errorMessage, error);
      
      // In a production app, you might want to show a toast notification here
      // The rollback in the mutation hooks (onError) will restore the UI state
    } finally {
      // Clear processing flag after operation completes (success or error)
      // Only clear if this is still the movie being processed (handles edge cases)
      if (processingMovieIdRef.current === movie.imdbID) {
        processingMovieIdRef.current = null;
        setProcessingMovieId(null);
      }
    }
  };

  const handlePageChange = (page: number) => {
    // Validate input type
    if (typeof page !== 'number' || !Number.isInteger(page)) {
      console.warn('handlePageChange: Page must be an integer');
      return;
    }

    // Validate page bounds
    if (page < 1) {
      console.warn(`handlePageChange: Page ${page} is less than minimum (1)`);
      return;
    }

    if (totalPages > 0 && page > totalPages) {
      console.warn(`handlePageChange: Page ${page} exceeds maximum (${totalPages})`);
      return;
    }

    // Prevent unnecessary state updates if page hasn't changed
    if (page === currentPage) {
      return;
    }

    // Update page state
    setCurrentPage(page);

    // Scroll to top only if we're in a browser environment
    if (typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-hero">
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text">
            Movie Finder
          </h1>
        </div>
        <SearchBar onSearch={handleSearch} />
      </div>

      {displayState === 'loading' && (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Searching for movies...</p>
        </div>
      )}

      {displayState === 'empty' && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Start Your Search</h2>
          <p className="text-muted-foreground">
            Search for your favorite movies and add them to your favorites
          </p>
        </div>
      )}

      {displayState === 'no-results' && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            No movies found for &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {displayState === 'results' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* BUG: No error boundary */}
            {searchResults?.data.movies.map((movie) => {
              // Determine if this specific movie is currently being processed
              const isMovieLoading = processingMovieId === movie.imdbID ||
                (movie.isFavorite && removeFromFavorites.isPending) ||
                (!movie.isFavorite && addToFavorites.isPending);

              return (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  isFavorite={movie.isFavorite ?? false}
                  onToggleFavorite={handleToggleFavorite}
                  isLoading={isMovieLoading}
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  </div>
);
}

