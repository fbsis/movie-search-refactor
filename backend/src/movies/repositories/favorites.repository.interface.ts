import { MovieDto } from "../dto/movie.dto";

export interface IFavoritesRepository {
  findAll(): Promise<MovieDto[]>;
  findById(id: string): Promise<MovieDto | null>;
  create(movie: MovieDto): Promise<MovieDto>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
