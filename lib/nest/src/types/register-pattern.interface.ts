import { OpenAPIObject } from "@nestjs/swagger";

export interface IServiceRecord {
  servers: {
    host: string;
    port: number;
  }[];
  timestamp: number;
  doc: OpenAPIObject;
}
