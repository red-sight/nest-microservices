import { configShared } from "@lib/config-shared";
import { RedisModule } from "@lib/nest";
import { EQueueRegistry } from "@lib/types";
import { BullModule } from "@nestjs/bullmq";
import { OnApplicationBootstrap } from "@nestjs/common";
import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RegistryRequestsConsumer } from "./registry-requests.consumer";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { keyPrefix, ...bullmqRedisOpts } = configShared.data.redisOptions;

@Module({
  controllers: [AppController],
  imports: [
    RedisModule.register(configShared.data.redisOptions),
    BullModule.forRoot({
      connection: bullmqRedisOpts,
    }),
    BullModule.registerQueue({
      connection: bullmqRedisOpts,
      name: EQueueRegistry.registryRequests,
    }),
    // BullModule.registerQueue({
    //   name: 'registry',
    //   connection: bullmqRedisOpts,
    // }),
  ],
  providers: [
    AppService,
    RegistryRequestsConsumer,
    // RegistryConsumer
  ],
})
export class AppModule implements OnApplicationBootstrap {
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
