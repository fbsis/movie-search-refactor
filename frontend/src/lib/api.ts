import { Movie, SearchMoviesResponse, FavoritesResponse } from '@/types/movie';

// BUG: Hardcoded API URL, should use env var
const API_BASE_URL = 'http://localhost:3001/movies';

/**
 * Movie data that can come in different formats
 * Frontend uses lowercase: { title, year, poster }
 * Backend expects lowercase: { title, year, poster }
 * This function ensures the data is in the correct format
 */
interface MovieDataInput {
  title?: string;
  Title?: string;
  year?: number;
  Year?: number;
  poster?: string;
  Poster?: string;
  imdbID: string;
  isFavorite?: boolean;
}

/**
 * Transforms movie data to backend format (lowercase)
 * Handles both lowercase and uppercase input for compatibility
 */
function transformMovieToBackendFormat(movie: MovieDataInput): {
  title: string;
  imdbID: string;
  year: number;
  poster: string;
} {
  return {
    title: movie.title || movie.Title || '',
    imdbID: movie.imdbID,
    year: movie.year || movie.Year || 0,
    poster: movie.poster || movie.Poster || '',
  };
}

export const movieApi = {
  searchMovies: async (query: string, page: number = 1): Promise<SearchMoviesResponse> => {
    // Validate input parameters
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Query is required and must be a non-empty string');
    }
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page must be a positive integer');
    }

    try {
      // Encode query to handle special characters
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await fetch(`${API_BASE_URL}/search?q=${encodedQuery}&page=${page}`);

      // Check if response is ok (status 200-299) before parsing
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to search movies (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Verify response body doesn't contain error structure
      // NestJS returns { message, error, statusCode } for errors
      if (data.statusCode && data.statusCode >= 400) {
        throw new Error(data.message || 'Failed to search movies');
      }

      // Verify data structure is correct
      if (!data.data || !Array.isArray(data.data.movies)) {
        throw new Error('Invalid response format from server');
      }

      return data;
    } catch (error) {
      // Re-throw if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      // Handle network errors
      throw new Error('Network error: Failed to search movies');
    }
  },

  getFavorites: async (page: number = 1): Promise<FavoritesResponse> => {
    // Validate page parameter
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page must be a positive integer');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/favorites/list?page=${page}`);

      // Handle 404 specifically - empty favorites list should return empty array, not error
      if (response.status === 404) {
        return {
          data: {
            favorites: [],
            count: 0,
            totalResults: 0,
            currentPage: page,
            totalPages: 0,
          },
        };
      }

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to get favorites (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Verify response body doesn't contain error structure
      // NestJS returns { message, error, statusCode } for errors
      if (data.statusCode && data.statusCode >= 400) {
        throw new Error(data.message || 'Failed to get favorites');
      }

      return data;
    } catch (error) {
      // Re-throw if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      // Handle network errors
      throw new Error('Network error: Failed to get favorites');
    }
  },

  addToFavorites: async (movie: Movie): Promise<void> => {
    // Validate required fields
    if (!movie.imdbID || !movie.title || !movie.year) {
      throw new Error('Movie must have imdbID, title, and year');
    }

    // Transform movie data to backend format (uppercase)
    const movieToSend = transformMovieToBackendFormat(movie);

    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieToSend),
      });

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to add movie to favorites (${response.status})`;
        throw new Error(errorMessage);
      }

      // Verify response body doesn't contain error structure
      // NestJS returns { message, error, statusCode } for errors
      const data = await response.json();
      if (data.statusCode && data.statusCode >= 400) {
        throw new Error(data.message || 'Failed to add movie to favorites');
      }
    } catch (error) {
      // Re-throw if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      // Handle network errors
      throw new Error('Network error: Failed to add movie to favorites');
    }
  },

  removeFromFavorites: async (imdbID: string): Promise<void> => {
    // Validate imdbID
    if (!imdbID || typeof imdbID !== 'string' || imdbID.trim().length === 0) {
      throw new Error('imdbID is required and must be a non-empty string');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/favorites/${encodeURIComponent(imdbID)}`, {
        method: 'DELETE',
      });

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to remove movie from favorites (${response.status})`;
        throw new Error(errorMessage);
      }

      // Verify response body doesn't contain error structure
      // NestJS returns { message, error, statusCode } for errors
      const data = await response.json().catch(() => null);
      if (data && data.statusCode && data.statusCode >= 400) {
        throw new Error(data.message || 'Failed to remove movie from favorites');
      }
    } catch (error) {
      // Re-throw if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      // Handle network errors
      throw new Error('Network error: Failed to remove movie from favorites');
    }
  },
};

