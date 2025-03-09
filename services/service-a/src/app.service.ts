import { RedisService } from '@lib/nest-base';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  async getHello(): Promise<string> {
    const res = await this.redisService.keys('*');
    console.log(res);

    return 'Hello World!';
  }
}
