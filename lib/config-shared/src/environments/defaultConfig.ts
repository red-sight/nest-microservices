import { getEnvVar } from "@lib/config";
import { IConfig } from "../config.interface";
import { NatsOptions, Transport } from "@nestjs/microservices";
import { VersioningType } from "@nestjs/common";

const appCode = getEnvVar("APP_CODE") ?? "app-code";
// const packageName = getEnvVarOrThrow("npm_package_name");

// const microserviceOptions: RmqOptions = {
//   transport: Transport.RMQ,
//   options: {
//     urls: ["amqp://localhost:5672"],
//     queue: packageName,
//     queueOptions: {
//       durable: false,
//     },
//   },
// };

const microserviceOptions: NatsOptions = {
  transport: Transport.NATS,
  options: {
    url: "nats://localhost:4222",
    reconnect: true,
    reconnectTimeWait: 500,
    maxReconnectAttempts: 10,
    // For NATS, add ping interval to detect disconnects faster
    pingInterval: 2000,
    // Make client aware of connection issues
    noRandomize: true,
    // These options will make client more resilient to broker restarts
    waitOnFirstConnect: true,
  },
};

export const defaultConfig: IConfig<NatsOptions> = {
  redisOptions: {
    keyPrefix: appCode,
  },

  microserviceOptions,

  // microserviceRegistryClientOptions: {
  //   ...(microserviceOptions.transport && {
  //     transport: microserviceOptions.transport,
  //   }),
  //   options: {
  //     ...microserviceOptions.options,
  //     queue: "registry",
  //   },
  // },

  microserviceRegistryClientOptions: microserviceOptions,

  versioning: {
    type: VersioningType.URI,
    defaultVersion: "1",
  },

  validationPipeOptions: {},
};
