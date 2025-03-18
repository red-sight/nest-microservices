import { configShared } from '@lib/config-shared';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from '@lib/nest';

@Module({
  imports: [RedisModule.register(configShared.data.redisOptions)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
