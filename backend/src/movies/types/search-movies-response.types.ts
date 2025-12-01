import type { MovieResponse } from "./movie-response.types";

/**
 * Response for search movies endpoint
 */
export interface SearchMoviesResponse {
  data: {
    movies: MovieResponse[];
    count: number;
    totalResults: string;
  };
}

