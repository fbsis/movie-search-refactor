import { HttpException, HttpStatus } from "@nestjs/common";

export class FailedToSearchMoviesError extends HttpException {
  constructor() {
    super("Failed to search movies from external API", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

