import { Module } from "@nestjs/common";
import { MoviesController } from "./movies.controller";
import { MoviesService } from "./movies.service";
import { FileFavoritesRepository } from "./repositories/file-favorites.repository";

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
  ],
})
export class MoviesModule {}

