import { RedisService } from "@lib/nest";
import { ERegistryStoreKey } from "@lib/types";
import { Injectable } from "@nestjs/common";
import { OpenAPIObject } from "@nestjs/swagger";

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  getHello(): string {
    return "Hello World!";
  }

  async getOpenApiDoc(): Promise<OpenAPIObject> {
    const defaultDoc = {
      components: {
        schemas: {},
      },
      info: {
        title: "",
        version: "1",
      },
      openapi: "3.0.0",
      paths: {},
      servers: [],
      tags: [],
    };
    const stored = await this.redisService.redis.get(
      ERegistryStoreKey.openApiDoc,
    );
    return stored ? (JSON.parse(stored) as OpenAPIObject) : defaultDoc;
  }
}
