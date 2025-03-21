import { RedisOptions } from "ioredis";
import {
  CustomStrategy,
  GrpcOptions,
  KafkaOptions,
  MqttOptions,
  NatsOptions,
  RmqOptions,
  TcpOptions,
} from "@nestjs/microservices";
import { ValidationPipeOptions, VersioningOptions } from "@nestjs/common";

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
  appTitle: string;

  appDescription: string;

  appVersion: string;

  redisOptions: RedisOptions;

  microserviceOptions: T;

  microserviceRegistryClientOptions: T;

  versioning: VersioningOptions;

  validationPipeOptions: ValidationPipeOptions;
}
