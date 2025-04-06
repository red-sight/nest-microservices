import { getEnvVar, getEnvVarOrThrow } from "@lib/config";
import { configShared } from "@lib/config-shared";
import { EQueueRegistry, IRegistryRequest } from "@lib/types";
import { BullModule, InjectQueue } from "@nestjs/bullmq";
import { Module, OnModuleInit } from "@nestjs/common";
import { Queue } from "bullmq";

import { RegistryClientController } from "./registry-client.controller";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { keyPrefix, ...bullmqRedisOpts } = configShared.data.redisOptions;

@Module({})
export class RegistryClientModule implements OnModuleInit {
  constructor(
    @InjectQueue(EQueueRegistry.registryRequests)
    private registryRequestsQueue: Queue,
  ) {}

  static register() {
    return {
      controllers: [RegistryClientController],
      exports: [],
      imports: [
        BullModule.forRoot({
          connection: bullmqRedisOpts,
        }),
        BullModule.registerQueue({
          connection: bullmqRedisOpts,
          name: EQueueRegistry.registryRequests,
        }),
      ],
      module: RegistryClientModule,
      providers: [],
    };
  }

  async onModuleInit() {
    console.log("In registry client OnModuleInit");

    const registerOptions: IRegistryRequest = {
      host: getEnvVar("HOST") ?? "localhost",
      port: getEnvVarOrThrow("HTTP_PORT"),
      service: getEnvVarOrThrow("npm_package_name"),
    };

    await this.registryRequestsQueue.add(
      `${registerOptions.host}:${registerOptions.port}`,
      registerOptions,
      {
        attempts: 5,
        backoff: {
          delay: 1000,
          type: "exponential",
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    console.log("Registry queue is added");
  }
}
