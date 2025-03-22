import { OpenAPIObject } from "@nestjs/swagger";

export interface IRegisterOptions {
  host: string;
  name: string;
  port: string;
}

export interface IServiceRecord {
  doc: OpenAPIObject;
  servers: {
    host: string;
    port: number;
  }[];
  timestamp: number;
}
