import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from "class-validator";

export class MovieDto {
  @IsString({ message: "Title must be a string" })
  @IsNotEmpty({ message: "Title is required and cannot be empty" })
  Title!: string;

  @IsString({ message: "imdbID must be a string" })
  @IsNotEmpty({ message: "imdbID is required and cannot be empty" })
  imdbID!: string;

  @IsNumber({}, { message: "Year must be a number" })
  @Min(1888, { message: "Year must be a valid year (minimum 1888)" })
  Year!: number;

  @IsString({ message: "Poster must be a string" })
  @IsOptional()
  Poster?: string;
}
