import { getEnvVar, getEnvVarOrThrow } from "@lib/config";
import { configShared } from "@lib/config-shared";
import { EQueueRegistry, IRegistryRequest } from "@lib/types";
import { BullModule, InjectQueue } from "@nestjs/bullmq";
import { Module, OnModuleInit } from "@nestjs/common";
import { Queue } from "bullmq";

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
      module: RegistryClientModule,
      imports: [
        BullModule.forRoot({
          connection: bullmqRedisOpts,
        }),
        BullModule.registerQueue({
          name: EQueueRegistry.registryRequests,
          connection: bullmqRedisOpts,
        }),
      ],
      providers: [],
      exports: [],
    };
  }

  async onModuleInit() {
    console.log("In registry client OnModuleInit");

    const registerOptions: IRegistryRequest = {
      service: getEnvVarOrThrow("npm_package_name"),
      port: getEnvVarOrThrow("HTTP_PORT"),
      host: getEnvVar("HOST") ?? "localhost",
    };

    await this.registryRequestsQueue.add(
      `${registerOptions.host}:${registerOptions.port}`,
      registerOptions,
      {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    console.log("Registry queue is added");
  }
}
