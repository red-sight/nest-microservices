import { getEnvVar, getEnvVarOrThrow } from "@lib/config";
import { IConfig } from "../config.interface";
import { RmqOptions, Transport } from "@nestjs/microservices";
import { VersioningType } from "@nestjs/common";

const appCode = getEnvVar("APP_CODE") ?? "app-code";
const packageName = getEnvVarOrThrow("npm_package_name");

const microserviceOptions: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: ["amqp://localhost:5672"],
    queue: packageName,
    queueOptions: {
      durable: true,
      // autoDelete: true,
    },
  },
};
// const microserviceOptions: NatsOptions = {
//   transport: Transport.NATS,
//   options: {
//     url: "nats://localhost:4223",
//     // reconnect: true,
//     // reconnectTimeWait: 500,
//     // maxReconnectAttempts: 10,
//     // pingInterval: 2000,
//     // noRandomize: true,
//     // waitOnFirstConnect: true,
//   },
// };

export const defaultConfig: IConfig<RmqOptions> = {
  redisOptions: {
    keyPrefix: appCode,
  },

  microserviceOptions,

  microserviceRegistryClientOptions: {
    ...(microserviceOptions.transport && {
      transport: microserviceOptions.transport,
    }),
    options: {
      ...microserviceOptions.options,
      queue: "registry",
    },
  },

  // microserviceRegistryClientOptions: microserviceOptions,

  versioning: {
    type: VersioningType.URI,
    defaultVersion: "1",
  },

  validationPipeOptions: {},
};
