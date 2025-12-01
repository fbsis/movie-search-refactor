import { Injectable, Inject } from "@nestjs/common";
import { MovieDto } from "./dto/movie.dto";
import { SearchMoviesQueryDto } from "./dto/search-movies-query.dto";
import { GetFavoritesQueryDto } from "./dto/get-favorites-query.dto";
import type { IFavoritesRepository } from "./repositories/favorites.repository.interface";
import type { IOmdbRepository } from "./repositories/omdb.repository.interface";
import { parseYear } from "./helpers/movie.helpers";
import type { OmdbMovieResponse } from "./types/omdb.types";
import type {
  MovieResponse,
  SearchMoviesResponse,
  MessageResponse,
  GetFavoritesResponse,
} from "./types/api-responses.types";
import { MovieNotFoundInFavoritesError } from "./errors";

@Injectable()
export class MoviesService {
  constructor(
    @Inject("IFavoritesRepository")
    private readonly favoritesRepository: IFavoritesRepository,
    @Inject("IOmdbRepository")
    private readonly omdbRepository: IOmdbRepository,
  ) {}

  /**
   * Transforms OMDb API movies to response format and enriches with favorite status
   */
  private enrichMoviesWithFavoriteStatus(
    omdbMovies: OmdbMovieResponse[],
    favorites: MovieDto[],
  ): MovieResponse[] {
    return omdbMovies.map((movie: OmdbMovieResponse): MovieResponse => {
      const movieImdbID = movie.imdbID || "";
      const isFavorite = favorites.some(
        (fav: MovieDto) =>
          fav.imdbID.toLowerCase() === movieImdbID.toLowerCase(),
      );

      return {
        title: movie.Title || "",
        imdbID: movieImdbID,
        year: parseYear(movie.Year),
        poster: movie.Poster || "",
        isFavorite,
      };
    });
  }

  async getMovieByTitle(
    queryDto: SearchMoviesQueryDto,
  ): Promise<SearchMoviesResponse> {
    const page = queryDto.page ?? 1;
    const response = await this.omdbRepository.search(queryDto.q, page);
    const favorites = await this.favoritesRepository.findAll();

    const omdbMovies = response.movies as unknown as OmdbMovieResponse[];
    const movies = this.enrichMoviesWithFavoriteStatus(omdbMovies, favorites);

    return {
      data: {
        movies,
        count: movies.length,
        totalResults: response.totalResults,
      },
    };
  }

  async addToFavorites(movieToAdd: MovieDto): Promise<MessageResponse> {
    await this.favoritesRepository.create(movieToAdd);
    return {
      data: {
        message: "Movie added to favorites",
      },
    };
  }

  async removeFromFavorites(movieId: string): Promise<MessageResponse> {
    const deleted = await this.favoritesRepository.delete(movieId);
    if (!deleted) {
      throw new MovieNotFoundInFavoritesError();
    }

    return {
      data: {
        message: "Movie removed from favorites",
      },
    };
  }

  async getFavorites(
    queryDto: GetFavoritesQueryDto,
  ): Promise<GetFavoritesResponse> {
    const page = queryDto.page ?? 1;
    const pageSize = queryDto.pageSize ?? 10;

    const favorites = await this.favoritesRepository.findAll();

    if (favorites.length === 0) {
      return {
        data: {
          favorites: [],
          count: 0,
          totalResults: "0",
          currentPage: page,
          totalPages: 0,
        },
      };
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFavorites = favorites.slice(startIndex, endIndex);

    return {
      data: {
        favorites: paginatedFavorites,
        count: paginatedFavorites.length,
        totalResults: String(favorites.length),
        currentPage: page,
        totalPages: Math.ceil(favorites.length / pageSize),
      },
    };
  }
}
