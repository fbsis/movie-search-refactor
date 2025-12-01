import { Module } from "@nestjs/common";
import { MoviesController } from "./movies.controller";
import { MoviesService } from "./movies.service";
import { FileFavoritesRepository } from "./repositories/file-favorites.repository";
import { OmdbRepository } from "./repositories/omdb.repository";

@Module({
  imports: [],
  controllers: [MoviesController],
  providers: [
    MoviesService,
    {
      provide: "IFavoritesRepository",
      useClass: FileFavoritesRepository,
    },
    FileFavoritesRepository,
    {
      provide: "IOmdbRepository",
      useClass: OmdbRepository,
    },
    OmdbRepository,
  ],
})
export class MoviesModule {}

