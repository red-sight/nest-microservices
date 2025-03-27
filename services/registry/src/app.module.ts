import { configShared } from "@lib/config-shared";
import { RedisModule } from "@lib/nest";
import { EQueueRegistry } from "@lib/types";
import { BullModule, InjectQueue } from "@nestjs/bullmq";
import { OnApplicationBootstrap } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { Queue } from "bullmq";

import { RegistryRequestsConsumer } from "./consumers";
import {
  ApiDocService,
  KrakendGatewayProvider,
  ServiceRecordService,
} from "./services";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { keyPrefix, ...bullmqRedisOpts } = configShared.data.redisOptions;

@Module({
  imports: [
    RedisModule.register(configShared.data.redisOptions),
    BullModule.forRoot({
      connection: bullmqRedisOpts,
    }),
    BullModule.registerQueue({
      connection: bullmqRedisOpts,
      name: EQueueRegistry.registryRequests,
    }),
    BullModule.registerQueue({
      connection: bullmqRedisOpts,
      name: EQueueRegistry.serviceHealthCheck,
    }),
  ],
  providers: [
    RegistryRequestsConsumer,
    ApiDocService,
    ServiceRecordService,
    KrakendGatewayProvider,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    @InjectQueue(EQueueRegistry.serviceHealthCheck)
    private healthCheckQueue: Queue,
  ) {}

  async onApplicationBootstrap() {
    await this.healthCheckQueue.upsertJobScheduler(
      "health-check",
      { every: 5000 },
      {
        opts: { removeOnComplete: true, removeOnFail: true },
      },
    );
  }
}
