import { RegisterOptionsDto } from "@lib/nest";
import { IsBoolean, IsOptional } from "class-validator";

export class ServiceRecordDto extends RegisterOptionsDto {
  @IsBoolean()
  @IsOptional()
  alive?: boolean;
}
