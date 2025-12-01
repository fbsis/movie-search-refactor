import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { MovieDto } from "./dto/movie.dto";
import { SearchMoviesQueryDto } from "./dto/search-movies-query.dto";
import { GetFavoritesQueryDto } from "./dto/get-favorites-query.dto";
import { MovieParamDto } from "./dto/movie-param.dto";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("movies")
@Controller("movies")
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get("search")
  @ApiOperation({
    summary: "Search movies by title",
    description:
      "Searches for movies using the OMDb API and returns results enriched with favorite status.",
  })
  @ApiQuery({
    name: "q",
    type: String,
    description: "Search query for the movie title",
    required: true,
  })
  @ApiQuery({
    name: "page",
    type: Number,
    description: "Page number for paginated results (default: 1)",
    required: false,
  })
  @ApiOkResponse({
    description: "List of movies matching the search criteria.",
  })
  async searchMovies(@Query() queryDto: SearchMoviesQueryDto) {
    return await this.moviesService.getMovieByTitle(queryDto);
  }

  @Post("favorites")
  @ApiOperation({
    summary: "Add a movie to favorites",
    description:
      "Adds a movie to the favorites list. The movie must include title, imdbID, year and optional poster.",
  })
  @ApiBody({
    type: MovieDto,
    description: "Movie data to be added to favorites",
  })
  @ApiOkResponse({
    description: "Movie successfully added to favorites.",
  })
  async addToFavorites(@Body() movieToAdd: MovieDto) {
    return this.moviesService.addToFavorites(movieToAdd);
  }

  @Delete("favorites/:imdbID")
  @ApiOperation({
    summary: "Remove a movie from favorites",
    description: "Removes a movie from the favorites list by its imdbID.",
  })
  @ApiParam({
    name: "imdbID",
    type: String,
    description: "IMDB identifier of the movie to remove from favorites",
  })
  @ApiOkResponse({
    description: "Movie successfully removed from favorites.",
  })
  async removeFromFavorites(@Param() params: MovieParamDto) {
    return this.moviesService.removeFromFavorites(params.imdbID);
  }

  @Get("favorites/list")
  @ApiOperation({
    summary: "Get paginated list of favorite movies",
    description: "Returns a paginated list of movies from the favorites list.",
  })
  @ApiQuery({
    name: "page",
    type: Number,
    description: "Page number for paginated results (default: 1)",
    required: false,
  })
  @ApiOkResponse({
    description: "Paginated list of favorite movies.",
  })
  async getFavorites(@Query() queryDto: GetFavoritesQueryDto) {
    return this.moviesService.getFavorites(queryDto);
  }
}
