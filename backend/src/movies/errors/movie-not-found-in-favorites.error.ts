import { HttpException, HttpStatus } from "@nestjs/common";

export class MovieNotFoundInFavoritesError extends HttpException {
  constructor() {
    super("Movie not found in favorites", HttpStatus.NOT_FOUND);
  }
}
