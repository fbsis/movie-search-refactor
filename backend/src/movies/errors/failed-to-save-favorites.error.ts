import { HttpException, HttpStatus } from "@nestjs/common";

export class FailedToSaveFavoritesError extends HttpException {
  constructor() {
    super("Failed to save favorites to file", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

