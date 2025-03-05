import { RedisOptions } from "ioredis";
import { MicroserviceOptions, TcpOptions } from "@nestjs/microservices";
import { ValidationPipeOptions, VersioningOptions } from "@nestjs/common";

export type AppMicroserviceOptions = Exclude<MicroserviceOptions, TcpOptions>;

export interface IConfig {
  redisOptions: RedisOptions;

  microserviceOptions: AppMicroserviceOptions;

  versioning: VersioningOptions;

  validationPipeOptions: ValidationPipeOptions;
}
