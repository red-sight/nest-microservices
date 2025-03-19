import { OnApplicationBootstrap } from '@nestjs/common';
import { configShared } from '@lib/config-shared';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from '@lib/nest';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { RegistryConsumer } from './registry.consumer';
import { Queue } from 'bullmq';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { keyPrefix, ...bullmqRedisOpts } = configShared.data.redisOptions;

@Module({
  imports: [
    RedisModule.register(configShared.data.redisOptions),
    BullModule.forRoot({
      connection: bullmqRedisOpts,
    }),
    BullModule.registerQueue({
      name: 'registry',
      connection: bullmqRedisOpts,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, RegistryConsumer],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(@InjectQueue('registry') private registryQueue: Queue) {}

  async onApplicationBootstrap() {
    await this.registryQueue.upsertJobScheduler(
      'registry-scheduler',
      { every: 5000 },
      {
        opts: { removeOnComplete: true, removeOnFail: true },
      },
    );
  }
}
