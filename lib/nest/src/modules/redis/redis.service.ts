import { Inject, Injectable } from "@nestjs/common";
import {
  ClassConstructor,
  ClassTransformOptions,
  plainToInstance,
} from "class-transformer";
import { validate, ValidatorOptions } from "class-validator";
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

  readonly keys = async (mask: string): Promise<string[]> => {
    return await getMappedRedisKeys(this.redis, mask);
  };

  readonly get = async <T extends object>(
    key: string,
    opts: IGetStorageOptions<T> = {},
  ): Promise<T | undefined> => {
    const {
      classTransformOptions = {},
      dto,
      throwOnInvalid = false,
      throwOnMissing = false,
      validatorOptions = {},
    } = opts;

    const stored = await this.redis.get(key);
    if (!stored) {
      if (throwOnMissing) throw new Error(`Key ${key} not found in storage`);
      return;
    }

    const parsed = JSON.parse(stored) as T;
    if (!dto) return parsed;

    const instance = plainToInstance(dto, parsed, classTransformOptions);
    const errors = await validate(instance, validatorOptions);
    if (errors.length) {
      const errorString = `Failed to parse storage data ${key}: ${JSON.stringify(errors, null, 2)}`;
      if (throwOnInvalid) throw new Error(errorString);
      else console.warn(errorString);
      return;
    }
    return instance;
  };

  readonly getAll = async <T extends object>(
    mask: string,
    opts: IGetStorageOptions<T> = {},
  ): Promise<T[]> => {
    const keys = await this.keys(mask);
    return (await Promise.all(keys.map(key => this.get<T>(key, opts)))).filter(
      i => i !== undefined,
    );
  };
}

export interface IGetStorageOptions<T> {
  classTransformOptions?: ClassTransformOptions;
  dto?: ClassConstructor<T>;
  throwOnInvalid?: boolean;
  throwOnMissing?: boolean;
  validatorOptions?: ValidatorOptions;
}
