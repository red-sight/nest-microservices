import { OpenAPIObject } from '@nestjs/swagger';
import { RedisService, RegisterOptionsDto } from '@lib/nest';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  private readonly serviceRegistryKey = 'registry:service';

  private readonly generateServiceRegistryKey = (name: string) => {
    return `${this.serviceRegistryKey}:${name}`;
  };

  private readonly registrationRequestKey = 'registration-request';

  private generateServiceRegistrationRequestKey({
    name,
    host,
    port,
  }: RegisterOptionsDto) {
    return `${this.registrationRequestKey}:${name}:${host}:${port}`;
  }

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

    const openApiDocs = (
      await Promise.all(registryRequests.map(this.processRegistrationRequest))
    ).filter((openApiDoc) => openApiDoc);

    console.log('openApiDocs', openApiDocs);
  }

  private readonly deserializeServiceRegistrationKey = (
    key: string,
  ): TRegistrationRequest => {
    const [, name, host, port] = key.split(':');
    return { name, host, port: parseInt(port, 10) };
  };

  private readonly processRegistrationRequest = async ({
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
      return openApiDoc;
    } catch (e) {
      console.warn(
        `Failed to fetch service ${name} openapi doc by ${serviceOpenApiDocUrl}`,
        e,
      );
      return null;
    }
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
