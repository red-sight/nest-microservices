import { Inject, Injectable } from "@nestjs/common";
import Redis, { RedisOptions } from "ioredis";

import { EInjectionTokens } from "../../types";
import { getMappedRedisKeys, mapRedisOptions } from "./redis-utils";

@Injectable()
export class RedisService {
  readonly redis: Redis;
  private readonly options: RedisOptions;

  constructor(
    @Inject(EInjectionTokens.CORE_REDIS_OPTIONS) options: RedisOptions,
  ) {
    this.options = mapRedisOptions(options);
    this.redis = new Redis(this.options);
  }

  readonly keys = async (searchStr: string): Promise<string[]> => {
    return await getMappedRedisKeys(this.redis, searchStr);
  };
}
