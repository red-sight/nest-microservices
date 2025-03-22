import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from '@lib/nest';
import { configShared } from '@lib/config-shared';

@Module({
  imports: [RedisModule.register(configShared.data.redisOptions)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
