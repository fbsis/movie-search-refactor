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

@Controller("movies")
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get("search")
  async searchMovies(@Query() queryDto: SearchMoviesQueryDto) {
    return await this.moviesService.getMovieByTitle(queryDto);
  }

  @Post("favorites")
  async addToFavorites(@Body() movieToAdd: MovieDto) {
    return this.moviesService.addToFavorites(movieToAdd);
  }

  @Delete("favorites/:imdbID")
  async removeFromFavorites(@Param() params: MovieParamDto) {
    return this.moviesService.removeFromFavorites(params.imdbID);
  }

  @Get("favorites/list")
  async getFavorites(@Query() queryDto: GetFavoritesQueryDto) {
    const pageNumber = queryDto.page || 1;
    return this.moviesService.getFavorites(pageNumber);
  }
}
