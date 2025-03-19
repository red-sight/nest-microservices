import { OnApplicationBootstrap } from '@nestjs/common';
import { configShared } from '@lib/config-shared';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from '@lib/nest';
import { BullModule } from '@nestjs/bullmq';
import { EQueueRegistry } from '@lib/types';
import { RegistryRequestsConsumer } from './registry-requests.consumer';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { keyPrefix, ...bullmqRedisOpts } = configShared.data.redisOptions;

@Module({
  imports: [
    RedisModule.register(configShared.data.redisOptions),
    BullModule.forRoot({
      connection: bullmqRedisOpts,
    }),
    BullModule.registerQueue({
      name: EQueueRegistry.registryRequests,
      connection: bullmqRedisOpts,
    }),
    // BullModule.registerQueue({
    //   name: 'registry',
    //   connection: bullmqRedisOpts,
    // }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RegistryRequestsConsumer,
    // RegistryConsumer
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor() {}

  async onApplicationBootstrap() {
    // await this.registryQueue.upsertJobScheduler(
    //   'registry-scheduler',
    //   { every: 5000 },
    //   {
    //     opts: { removeOnComplete: true, removeOnFail: true },
    //   },
    // );
  }
}
