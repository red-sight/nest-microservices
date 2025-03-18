import { OpenAPIObject } from "@nestjs/swagger";

export interface IServiceRecord {
  servers: {
    host: string;
    port: number;
  }[];
  timestamp: number;
  doc: OpenAPIObject;
}

export interface IRegisterOptions {
  host: string;
  port: string;
  name: string;
}
