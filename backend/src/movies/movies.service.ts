import { HttpException, HttpStatus, Injectable, Inject } from "@nestjs/common";
import { MovieDto } from "./dto/movie.dto";
import { SearchMoviesQueryDto } from "./dto/search-movies-query.dto";
import type { IFavoritesRepository } from "./repositories/favorites.repository.interface";
import type { IOmdbRepository } from "./repositories/omdb.repository.interface";
import { parseYear } from "./helpers/movie.helpers";

interface OmdbMovieResponse {
  Title?: string;
  Year?: string;
  imdbID?: string;
  Poster?: string;
}

@Injectable()
export class MoviesService {
  constructor(
    @Inject("IFavoritesRepository")
    private readonly favoritesRepository: IFavoritesRepository,
    @Inject("IOmdbRepository")
    private readonly omdbRepository: IOmdbRepository,
  ) {}

  async searchMovies(queryDto: SearchMoviesQueryDto) {
    const page = queryDto.page ?? 1;

    // Error handling
    try {
      return this.omdbRepository.search(queryDto.q, page);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to search movies from external API",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMovieByTitle(queryDto: SearchMoviesQueryDto) {
    // Error handling
    const response = await this.searchMovies(queryDto);

    // Get current favorites from repository
    const favorites = await this.favoritesRepository.findAll();

    const formattedResponse = (
      response.movies as unknown as OmdbMovieResponse[]
    ).map((movie: OmdbMovieResponse) => {
      // Case-insensitive comparison for imdbID
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

    return {
      data: {
        movies: formattedResponse,
        count: formattedResponse.length,
        totalResults: response.totalResults,
      },
    };
  }

  async addToFavorites(movieToAdd: MovieDto) {
    // BUG: No validation that movieToAdd has required fields
    // BUG: Not checking if movieToAdd has all required fields (poster might be missing)
    try {
      await this.favoritesRepository.create(movieToAdd);
      return {
        data: {
          message: "Movie added to favorites",
        },
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Movie already in favorites"
      ) {
        throw new HttpException(
          "Movie already in favorites",
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  async removeFromFavorites(movieId: string) {
    // BUG: No validation that movieId is provided
    const deleted = await this.favoritesRepository.delete(movieId);
    if (!deleted) {
      throw new HttpException(
        "Movie not found in favorites",
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      data: {
        message: "Movie removed from favorites",
      },
    };
  }

  async getFavorites(page: number = 1, pageSize: number = 10) {
    // BUG: No validation that page is positive
    // BUG: No validation that pageSize is positive
    // BUG: If page is 0 or negative, startIndex becomes negative and slice behaves unexpectedly
    const favorites = await this.favoritesRepository.findAll();

    // BUG: Throwing error when empty instead of returning empty array
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

    // BUG: Inconsistent response structure
    // BUG: totalResults is number but should be string to match search API response
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
