import { ERegistryStoreKey } from '@lib/types';
import { OpenAPIObject } from '@nestjs/swagger';
import { RedisService } from '@lib/nest';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getOpenApiDoc(): Promise<OpenAPIObject> {
    const defaultDoc = {
      openapi: '3.0.0',
      paths: {},
      info: {
        title: '',
        version: '1',
      },
      tags: [],
      servers: [],
      components: {
        schemas: {},
      },
    };
    const stored = await this.redisService.redis.get(
      ERegistryStoreKey.openApiDoc,
    );
    return stored ? (JSON.parse(stored) as OpenAPIObject) : defaultDoc;
  }
}
