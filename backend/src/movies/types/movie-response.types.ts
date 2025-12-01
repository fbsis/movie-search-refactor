/**
 * Movie response with favorite status
 */
export interface MovieResponse {
  title: string;
  imdbID: string;
  year: number;
  poster: string;
  isFavorite: boolean;
}

