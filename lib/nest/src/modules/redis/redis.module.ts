import { DynamicModule, Module } from "@nestjs/common";
import { RedisOptions } from "ioredis";

import { EInjectionTokens } from "../../types";
import { RedisService } from "./redis.service";

@Module({})
export class RedisModule {
  static register(options: RedisOptions): DynamicModule {
    return {
      exports: [RedisService],
      module: RedisModule,
      providers: [
        {
          provide: EInjectionTokens.CORE_REDIS_OPTIONS,
          useValue: options,
        },
        RedisService,
      ],
    };
  }
}
