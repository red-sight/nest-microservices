import { getEnvVar, getEnvVarOrThrow } from "@lib/config";
import { IConfig } from "../config.interface";
import { Transport } from "@nestjs/microservices";

const appCode = getEnvVar("APP_CODE") ?? "app-code";

export const defaultConfig: IConfig = {
  appCode,

  serviceName: getEnvVarOrThrow("npm_package_name"),

  appHost: getEnvVar("HOST") ?? "localhost",

  httpPort: parseInt(getEnvVarOrThrow("HTTP_PORT")),

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
};
