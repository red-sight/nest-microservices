import { ConnectionConfig } from "@keycloak/keycloak-admin-client/lib/client";
import { Credentials } from "@keycloak/keycloak-admin-client/lib/utils/auth";
import { ValidationPipeOptions, VersioningOptions } from "@nestjs/common";
import {
  CustomStrategy,
  GrpcOptions,
  KafkaOptions,
  MqttOptions,
  NatsOptions,
  RmqOptions,
  TcpOptions,
} from "@nestjs/microservices";
import { RedisOptions } from "ioredis";

export interface IConfig<
  T =
    | GrpcOptions
    | TcpOptions
    | RedisOptions
    | NatsOptions
    | MqttOptions
    | RmqOptions
    | KafkaOptions
    | CustomStrategy,
> {
  appDescription: string;

  appTitle: string;

  appVersion: string;

  keycloakAdminClient: {
    config: ConnectionConfig;
    credentials: Credentials;
  };

  microserviceOptions: T;

  microserviceRegistryClientOptions: T;

  redisOptions: RedisOptions;

  validationPipeOptions: ValidationPipeOptions;

  versioning: VersioningOptions;
}
