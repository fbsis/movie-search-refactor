import { MovieDto } from "../dto/movie.dto";

/**
 * Response for get favorites endpoint
 */
export interface GetFavoritesResponse {
  data: {
    favorites: MovieDto[];
    count: number;
    totalResults: string;
    currentPage: number;
    totalPages: number;
  };
}

