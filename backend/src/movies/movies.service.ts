import { HttpException, HttpStatus, Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MovieDto } from "./dto/movie.dto";
import axios from "axios";
import type { IFavoritesRepository } from "./repositories/favorites.repository.interface";

@Injectable()
export class MoviesService {
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject("IFavoritesRepository")
    private readonly favoritesRepository: IFavoritesRepository,
  ) {
    const apiKey = this.configService.get<string>("OMDB_API_KEY");
    if (!apiKey) {
      throw new Error(
        "OMDB_API_KEY environment variable is required. Please set it in your .env file.",
      );
    }
    this.baseUrl = `http://www.omdbapi.com/?apikey=${apiKey}`;
  }

  async searchMovies(title: string, page: number = 1): Promise<any> {
    // BUG: No input validation, no error handling
    const response = await axios.get(
      `${this.baseUrl}&s=${title}&plot=full&page=${page}`, // BUG: Missing encodeURIComponent
    );

    // BUG: OMDb API returns Response: "False" (string) when no results, not a boolean
    // This check will fail silently - Response field is always a string
    if (response.data.Response === false || response.data.Error) {
      return { movies: [], totalResults: "0" };
    }

    return {
      movies: response.data.Search || [],
      totalResults: response.data.totalResults || "0",
    };
  }

  async getMovieByTitle(title: string, page: number = 1) {
    // BUG: No try-catch, will crash on API errors
    const response = await this.searchMovies(title, page);

    // Get current favorites from repository
    const favorites = await this.favoritesRepository.findAll();

    const formattedResponse = response.movies.map((movie: any) => {
      // BUG: Case-sensitive comparison - some IDs might have different casing
      const isFavorite = favorites.some(
        (fav) => fav.imdbID === movie.imdbID,
      );
      return {
        title: movie.Title,
        imdbID: movie.imdbID,
        year: movie.Year, // BUG: Should parse to number, also handles "1999-2000" format incorrectly
        poster: movie.Poster,
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
      if (error instanceof Error && error.message === "Movie already in favorites") {
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
