import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configShared } from '@lib/config-shared';
import { RedisModule, RegistryClientModule } from '@lib/nest';

const options = configShared.data.redisOptions;

@Module({
  imports: [RedisModule.register(options), RegistryClientModule.register()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
