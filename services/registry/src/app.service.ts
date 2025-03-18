import { RedisService, RegisterOptionsDto } from '@lib/nest';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  private readonly serviceRegistryKey = 'registry:service';

  private generateServiceRegistryKey(name: string) {
    return `${this.serviceRegistryKey}:${name}`;
  }

  getHello(): string {
    return 'Hello World!';
  }

  async register({ name, host, port }: RegisterOptionsDto) {
    // const serviceOpenApiDocUrl = `http://${host}:${port}/api-json`;
    // console.log(serviceOpenApiDocUrl);
    // const res = await fetch(serviceOpenApiDocUrl, {
    //   signal: AbortSignal.timeout(5000),
    // });
    // console.dir(await res.json(), { depth: null, colors: true });
    await this.redisService.redis.set(
      this.generateServiceRegistryKey(name),
      JSON.stringify({ name, host, port, alive: false, registered: false }),
    );
  }
}
