import { IsNotEmpty, IsPort, IsString } from "class-validator";

export class RegisterOptionsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  host: string;

  @IsNotEmpty()
  @IsPort()
  port: string;
}
