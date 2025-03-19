import { OpenAPIObject } from '@nestjs/swagger';
import { RedisService, RegisterOptionsDto } from '@lib/nest';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  private readonly serviceRegistryKey = 'registry:service';

  private readonly registrationRequestKey = 'registration-request';

  private readonly openApiDocKey = 'openapi-doc';

  private readonly generateServiceRegistryKey = (name: string) => {
    return `${this.serviceRegistryKey}:${name}`;
  };

  private generateServiceRegistrationRequestKey({
    name,
    host,
    port,
  }: RegisterOptionsDto) {
    return `${this.registrationRequestKey}:${name}:${host}:${port}`;
  }

  private readonly generateOpenApiDocKey = (name: string) => {
    return `${this.openApiDocKey}:${name}`;
  };

  private readonly openApiDoc = {
    get: async (name: string) => {
      const stored = await this.redisService.redis.get(
        this.generateOpenApiDocKey(name),
      );
      return stored ? (JSON.parse(stored) as OpenAPIObject) : null;
    },
    set: async (name: string, openApiDoc: OpenAPIObject) => {
      await this.redisService.redis.set(
        this.generateOpenApiDocKey(name),
        JSON.stringify(openApiDoc),
      );
    },
  };

  private readonly serviceRegistryRecord = {
    get: async ({ name }: TRegistrationRequest) => {
      const stored = await this.redisService.redis.get(
        this.generateServiceRegistryKey(name),
      );
      return stored ? (JSON.parse(stored) as IServiceRecord) : null;
    },
  };

  getHello(): string {
    return 'Hello World!';
  }

  async registrationRequest(opts: RegisterOptionsDto) {
    await this.redisService.redis.set(
      this.generateServiceRegistrationRequestKey(opts),
      'true',
    );
  }

  async processRegistrationRequests() {
    const registryRequests = (
      await this.redisService.keys(`${this.registrationRequestKey}:*`)
    )
      .map(this.deserializeServiceRegistrationKey)
      .filter(({ name, host, port }) => name && host && port);

    const openApiDocs = await Promise.all(
      registryRequests.map(this.fetchServiceOpenApiDoc),
    );

    const uniqueOpenApiDocs = Array.from(
      new Map(
        openApiDocs
          .filter((doc) => doc !== null)
          .map((doc) => [doc.service, doc]),
      ).values(),
    );

    await Promise.all(
      uniqueOpenApiDocs.map(({ service, doc }) =>
        this.openApiDoc.set(service, doc),
      ),
    );

    console.log('openApiDocs', uniqueOpenApiDocs);
  }

  private readonly deserializeServiceRegistrationKey = (
    key: string,
  ): TRegistrationRequest => {
    const [, name, host, port] = key.split(':');
    return { name, host, port: parseInt(port, 10) };
  };

  private readonly fetchServiceOpenApiDoc = async ({
    name,
    host,
    port,
  }: TRegistrationRequest) => {
    const serviceOpenApiDocUrl = `http://${host}:${port}/api-json`;
    console.log(serviceOpenApiDocUrl);
    try {
      const res = await fetch(serviceOpenApiDocUrl, {
        signal: AbortSignal.timeout(5000),
      });
      const openApiDoc = (await res.json()) as OpenAPIObject;

      return { service: name, doc: openApiDoc };
    } catch (e) {
      console.warn(
        `Failed to fetch service ${name} openapi doc by ${serviceOpenApiDocUrl}`,
        e,
      );
      return null;
    }
  };

  private readonly processOpenApiDocs = async () => {
    const openApiDocs = await this.redisService.keys(`${this.openApiDocKey}:*`);
    console.log(openApiDocs);
  };
}

interface IServiceRecord {
  name: string;
  host: string;
  port: number;
  alive: boolean;
  registered: boolean;
}

type TRegistrationRequest = Omit<IServiceRecord, 'alive' | 'registered'>;
