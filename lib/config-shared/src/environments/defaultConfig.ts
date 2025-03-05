import { getEnvVar } from "@lib/config";
import { IConfig } from "../config.interface";
import { Transport } from "@nestjs/microservices";
import { VersioningType } from "@nestjs/common";

const appCode = getEnvVar("APP_CODE") ?? "app-code";

export const defaultConfig: IConfig = {
  redisOptions: {
    keyPrefix: appCode,
  },

  microserviceOptions: {
    transport: Transport.RMQ,
    options: {
      urls: ["amqp://localhost:5672"],
      queue: "main_queue",
      queueOptions: {
        durable: false,
      },
    },
  },

  versioning: {
    type: VersioningType.URI,
    defaultVersion: "1",
  },

  validationPipeOptions: {},
};
