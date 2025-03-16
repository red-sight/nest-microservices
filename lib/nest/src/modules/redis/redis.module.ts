import { DynamicModule, Module } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RedisOptions } from "ioredis";
import { EInjectionTokens } from "../../types";

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RedisModule {
  static register(options: RedisOptions): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: EInjectionTokens.CORE_REDIS_OPTIONS,
          useValue: options,
        },
        RedisService,
      ],
      exports: [RedisService],
    };
  }
}
