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

  microserviceOptions: T;

  microserviceRegistryClientOptions: T;

  redisOptions: RedisOptions;

  validationPipeOptions: ValidationPipeOptions;

  versioning: VersioningOptions;
}
