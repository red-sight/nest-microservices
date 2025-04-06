import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPort,
  IsString,
} from "class-validator";

export class RegisterOptionsDto {
  @IsNotEmpty()
  @IsString()
  service: string;

  @IsNotEmpty()
  @IsString()
  host: string;

  @IsNotEmpty()
  @IsPort()
  port: string;

  @IsOptional()
  @IsBoolean()
  alive?: boolean;
}
