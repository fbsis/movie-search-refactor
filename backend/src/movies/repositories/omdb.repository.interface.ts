import { MovieDto } from "../dto/movie.dto";

export interface SearchMoviesResult {
  movies: MovieDto[];
  totalResults: string;
}

export interface IOmdbRepository {
  search(title: string, page: number): Promise<SearchMoviesResult>;
}
