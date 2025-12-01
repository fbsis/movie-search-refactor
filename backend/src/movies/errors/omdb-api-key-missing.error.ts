import { HttpException, HttpStatus } from "@nestjs/common";

export class OmdbApiKeyMissingError extends HttpException {
  constructor() {
    super(
      "OMDB_API_KEY environment variable is required. Please set it in your .env file.",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

