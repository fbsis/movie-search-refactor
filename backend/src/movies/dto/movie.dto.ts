import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
} from "class-validator";

export class MovieDto {
  @IsString({ message: "Title must be a string" })
  @IsNotEmpty({ message: "Title is required and cannot be empty" })
  title!: string;

  @IsString({ message: "imdbID must be a string" })
  @IsNotEmpty({ message: "imdbID is required and cannot be empty" })
  imdbID!: string;

  @IsNumber({}, { message: "Year must be a number" })
  @Min(1888, { message: "Year must be a valid year (minimum 1888)" })
  year!: number;

  @IsString({ message: "Poster must be a string" })
  @IsOptional()
  poster?: string;

  @IsBoolean({ message: "isFavorite must be a boolean" })
  @IsOptional()
  isFavorite?: boolean;
}
