/**
 * Movie interface matching backend MovieResponse
 * Used for displaying movies in search results and favorites
 */
export interface Movie {
  title: string;
  imdbID: string;
  year: number;
  poster: string; // Can be empty string or "N/A" for movies without poster
  isFavorite?: boolean; // Optional, added by frontend for UI state
}

/**
 * Response from search movies endpoint
 * Matches backend SearchMoviesResponse
 */
export interface SearchMoviesResponse {
  data: {
    movies: Movie[];
    count: number;
    totalResults: string;
  };
}

/**
 * Response from get favorites endpoint
 * Matches backend GetFavoritesResponse
 */
export interface FavoritesResponse {
  data: {
    favorites: Movie[];
    count: number;
    totalResults: string; // Backend returns string to match search API
    currentPage: number;
    totalPages: number;
  };
}

