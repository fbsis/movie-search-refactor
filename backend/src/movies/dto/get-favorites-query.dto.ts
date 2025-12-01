import { IsOptional, IsInt, Min } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class GetFavoritesQueryDto {
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

  @IsOptional()
  @Transform(({ value }: TransformFnParams): number | undefined => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsInt({ message: "PageSize parameter must be an integer" })
  @Min(1, {
    message: "PageSize parameter must be a positive integer (minimum 1)",
  })
  pageSize?: number;
}
