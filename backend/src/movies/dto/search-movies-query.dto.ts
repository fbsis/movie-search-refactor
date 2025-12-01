import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class SearchMoviesQueryDto {
  @IsString({ message: "Query parameter 'q' must be a string" })
  @IsNotEmpty({
    message: "Query parameter 'q' is required and cannot be empty",
  })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === "string" ? value.trim() : (value as string),
  )
  q!: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams): number | undefined => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsInt({ message: "Page parameter must be an integer" })
  @Min(1, {
    message: "Page parameter must be a positive integer (minimum 1)",
  })
  page?: number;
}
