import { IsDefined, IsNotEmpty, IsOptional } from "class-validator";

export class QueryParamsDto {
  @IsOptional()
  page?: number;

  @IsDefined()
  @IsNotEmpty()
  pageSize?: number;
}
