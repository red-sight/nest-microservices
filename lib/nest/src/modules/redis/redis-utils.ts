import Redis, { RedisOptions } from "ioredis";

export const mapRedisOptions = (options: RedisOptions): RedisOptions => {
  return {
    ...options,
    ...(options.keyPrefix && { keyPrefix: `${options.keyPrefix}:` }),
  };
};

export const getMappedRedisKeys = async (
  redis: Redis,

  pattern: string,
): Promise<string[]> => {
  return (await redis.keys(`${redis.options.keyPrefix ?? ""}${pattern}`)).map(
    key => key.split(":").splice(1).join(":"),
  );
};
