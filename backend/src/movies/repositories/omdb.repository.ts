import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import type {
  IOmdbRepository,
  SearchMoviesResult,
} from "./omdb.repository.interface";
import { MovieDto } from "../dto/movie.dto";
import { OmdbApiKeyMissingError, FailedToSearchMoviesError } from "../errors";

@Injectable()
export class OmdbRepository implements IOmdbRepository {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("OMDB_API_KEY");
    if (!apiKey) {
      throw new OmdbApiKeyMissingError();
    }
    this.baseUrl = `http://www.omdbapi.com/?apikey=${apiKey}`;
  }

  async search(title: string, page: number = 1): Promise<SearchMoviesResult> {
    try {
      const encodedTitle = encodeURIComponent(title);
      const response = await axios.get(
        `${this.baseUrl}&s=${encodedTitle}&plot=full&page=${page}`,
      );

      // OMDb API returns Response: "False" (string) when no results, not a boolean
      // Check if response indicates an error or no results
      const responseData = response.data as {
        Response?: string;
        Error?: string;
        Search?: unknown[];
        totalResults?: string;
      };

      if (
        responseData.Response === "False" ||
        responseData.Error ||
        !Array.isArray(responseData.Search)
      ) {
        return { movies: [], totalResults: "0" };
      }

      return {
        movies: (responseData.Search as unknown as MovieDto[]) || [],
        totalResults: responseData.totalResults || "0",
      };
    } catch (error) {
      console.error("Error searching movies from OMDb API:", error);
      throw new FailedToSearchMoviesError();
    }
  }
}
