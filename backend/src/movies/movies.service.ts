import { HttpException, HttpStatus, Injectable, Inject } from "@nestjs/common";
import { MovieDto } from "./dto/movie.dto";
import type { IFavoritesRepository } from "./repositories/favorites.repository.interface";
import type { IOmdbRepository } from "./repositories/omdb.repository.interface";

@Injectable()
export class MoviesService {
  constructor(
    @Inject("IFavoritesRepository")
    private readonly favoritesRepository: IFavoritesRepository,
    @Inject("IOmdbRepository")
    private readonly omdbRepository: IOmdbRepository,
  ) {}

  async searchMovies(title: string, page: number = 1) {
    // BUG: No input validation, no error handling
    return await this.omdbRepository.search(title, page);
  }

  async getMovieByTitle(title: string, page: number = 1) {
    // BUG: No try-catch, will crash on API errors
    const response = await this.searchMovies(title, page);

    // Get current favorites from repository
    const favorites = await this.favoritesRepository.findAll();

    const formattedResponse = response.movies.map((movie: MovieDto) => {
      // BUG: Case-sensitive comparison - some IDs might have different casing
      const isFavorite = favorites.some(
        (fav: MovieDto) => fav.imdbID === movie.imdbID,
      );
      return {
        title: movie.title,
        imdbID: movie.imdbID,
        year: movie.year, // BUG: Should parse to number, also handles "1999-2000" format incorrectly
        poster: movie.poster,
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
