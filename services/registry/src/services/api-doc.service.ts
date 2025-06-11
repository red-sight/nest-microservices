import { configShared } from "@lib/config-shared";
import { RedisService, RegisterOptionsDto } from "@lib/nest";
import { Injectable } from "@nestjs/common";
import { isErrorResult, merge } from "openapi-merge";
import OpenAPISchemaValidator from "openapi-schema-validator";
import { OpenAPI } from "openapi-types";

import { IServiceListItem } from "./service-record.service";

@Injectable()
export class ApiDocService {
  constructor(private readonly redisService: RedisService) {}

  readonly key = "registry:doc";
  readonly mergedDocKey = "openapidoc";

  readonly generateKey = (service: string): string => `${this.key}:${service}`;

  readonly fetch = async (
    dto: RegisterOptionsDto,
  ): Promise<OpenAPI.Document> => {
    const { host, port, service } = dto;
    const url = `http://${host}:${port}/api-json`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });
    const openApiDoc = (await res.json()) as OpenAPI.Document;

    const validator = new OpenAPISchemaValidator({ version: 3 });
    const { errors } = validator.validate(openApiDoc);
    if (errors.length)
      throw new Error(
        `Failed to parse service ${service} instance ${host}:${port} OpenAPI doc: ${JSON.stringify(errors, null, 2)}`,
      );

    return openApiDoc;
  };

  readonly get = async (
    service: string,
  ): Promise<OpenAPI.Document | undefined> => {
    const key = this.generateKey(service);
    const doc = await this.redisService.get<OpenAPI.Document>(key);
    if (doc && doc.paths) {
      for (const key of Object.keys(doc.paths)) {
        if (doc.paths[key] && typeof doc.paths[key] === "object") {
          for (const method of Object.keys(doc.paths[key])) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            doc.paths[key][method].tags = [service];
          }
        }
      }
    }
    return doc;
  };

  readonly getAll = async (
    services: IServiceListItem[],
  ): Promise<IApiDocMergeItem[]> => {
    const items = await Promise.all(
      services.map(async service => ({
        doc: await this.get(service.service),
        ...service,
      })),
    );
    return items.filter((i): i is IApiDocMergeItem => i.doc !== undefined);
  };

  readonly set = async (
    service: string,
    doc: OpenAPI.Document,
  ): Promise<void> => {
    const key = this.generateKey(service);
    await this.redisService.redis.set(key, JSON.stringify(doc));
  };

  readonly merge = (
    items: IApiDocMergeItem[],
  ): OpenAPI.Document | undefined => {
    const mergeResult = merge(
      items.map(({ doc, service }) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        oas: doc as any,
        pathModification: { prepend: `/${service}` },
      })),
    );

    if (isErrorResult(mergeResult)) {
      console.error("Failed to merge OpenAPI doc", mergeResult);
      return;
    }

    const fullOpenApiDoc = mergeResult.output;

    fullOpenApiDoc.info.title = configShared.data.appTitle;
    fullOpenApiDoc.info.description = configShared.data.appDescription;
    fullOpenApiDoc.info.version = configShared.data.appVersion;

    return fullOpenApiDoc as OpenAPI.Document;
  };

  readonly saveFullOpenApiDoc = async (
    doc: OpenAPI.Document,
  ): Promise<void> => {
    await this.redisService.redis.set(
      this.mergedDocKey,
      JSON.stringify(doc, null, 2),
    );
  };
}

export interface IApiDocMergeItem {
  doc: OpenAPI.Document;
  hosts: string[];
  service: string;
}
