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
  redisOptions: RedisOptions;

  microserviceOptions: T;

  microserviceRegistryClientOptions: T;

  versioning: VersioningOptions;

  validationPipeOptions: ValidationPipeOptions;
}
