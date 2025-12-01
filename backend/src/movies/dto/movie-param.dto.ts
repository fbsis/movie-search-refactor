import { IsString, IsNotEmpty } from "class-validator";

export class MovieParamDto {
  @IsString({ message: "imdbID parameter must be a string" })
  @IsNotEmpty({ message: "imdbID parameter is required and cannot be empty" })
  imdbID!: string;
}
