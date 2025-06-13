import { getEnvVar, getEnvVarOrThrow } from "@lib/config";
import { VersioningType } from "@nestjs/common";
import { RmqOptions, Transport } from "@nestjs/microservices";

import { IConfig } from "../config.interface";

const appCode = getEnvVar("APP_CODE") ?? "app-code";
const packageName = getEnvVarOrThrow("npm_package_name");
const appTitle = getEnvVar("APP_TITLE") ?? "Nest microservices application";
const appDescription = getEnvVar("APP_DESCRIPTION") ?? "App description";
const appVersion = getEnvVar("APP_VERSION") ?? "1";

const microserviceOptions: RmqOptions = {
  options: {
    queue: packageName,
    queueOptions: {
      durable: true,
      // autoDelete: true,
    },
    urls: ["amqp://localhost:5672"],
  },
  transport: Transport.RMQ,
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
  appDescription,
  appTitle,
  appVersion,

  keycloakAdminClient: {
    config: {
      baseUrl: "http://localhost:7080",
      realmName: "master",
    },
    credentials: {
      clientId: "admin-cli",
      // clientSecret: getEnvVarOrThrow("KEYCLOAK_ADMIN_CLIENT_SECRET"),
      grantType: "password",
      password: getEnvVarOrThrow("KEYCLOAK_ADMIN_PASSWORD"),
      username: getEnvVarOrThrow("KEYCLOAK_ADMIN_USERNAME"),
    },
  },

  microserviceOptions,

  // microserviceRegistryClientOptions: microserviceOptions,

  microserviceRegistryClientOptions: {
    ...(microserviceOptions.transport && {
      transport: microserviceOptions.transport,
    }),
    options: {
      ...microserviceOptions.options,
      queue: "registry",
    },
  },

  redisOptions: {
    host: "localhost",
    keyPrefix: appCode,
    port: 6378,
  },

  validationPipeOptions: {},

  versioning: {
    defaultVersion: appVersion,
    type: VersioningType.URI,
  },
};
