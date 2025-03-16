import { EInjectionTokens, RedisService } from '@lib/nest';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private readonly redisService: RedisService,
    @Inject(EInjectionTokens.REGISTRY_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  async getHello(): Promise<unknown> {
    const res = await this.redisService.keys('*');
    console.log(res);

    // return { success: 'hey' };

    return await firstValueFrom(
      this.client.send<unknown>('REGISTER', { message: 'hi' }),
    );
  }
}
