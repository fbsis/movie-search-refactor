import { HttpException, HttpStatus } from "@nestjs/common";

export class MovieAlreadyInFavoritesError extends HttpException {
  constructor() {
    super("Movie already in favorites", HttpStatus.BAD_REQUEST);
  }
}

