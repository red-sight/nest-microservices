import { RedisOptions } from "ioredis";
import { CustomStrategy, MicroserviceOptions } from "@nestjs/microservices";

export interface IConfig {
  appCode: string;

  appHost: string;

  serviceName: string;

  httpPort: number;

  redisOptions: RedisOptions;

  microserviceOptions: Exclude<MicroserviceOptions, CustomStrategy>;
}
