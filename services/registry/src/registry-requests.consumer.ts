import { getEnvVarOrThrow } from "@lib/config";
import { configShared } from "@lib/config-shared";
import { RedisService } from "@lib/nest";
import {
  EKrakendHttpMethod,
  EQueueRegistry,
  ERegistryStoreKey,
  IKrakendEndpoint,
  IRegistryRequest,
  IServiceRecord,
} from "@lib/types";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { OpenAPIObject } from "@nestjs/swagger";
import { Job } from "bullmq";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { isErrorResult, merge } from "openapi-merge";

@Processor(EQueueRegistry.registryRequests)
export class RegistryRequestsConsumer extends WorkerHost {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  private readonly openApiDocKey = "registry:doc";
  private readonly genOpenApiDocKey = (service: string): string =>
    `${this.openApiDocKey}:${service}`;
  private readonly openApiDoc = {
    get: async (service: string): Promise<OpenAPIObject | null> => {
      const stored = await this.redisService.redis.get(
        this.genOpenApiDocKey(service),
      );
      return stored ? (JSON.parse(stored) as OpenAPIObject) : null;
    },
    set: async (service: string, openApiDoc: OpenAPIObject): Promise<void> => {
      console.log("In set", service, openApiDoc);
      await this.redisService.redis.set(
        this.genOpenApiDocKey(service),
        JSON.stringify(openApiDoc),
      );
    },
  };

  private readonly serviceRecordKey = "registry:service";
  private readonly genServiceRecordKey = ({
    host,
    port,
    service,
  }: IServiceRecord): string =>
    `${this.serviceRecordKey}:${service}:${host}:${port}`;
  private readonly serviceRecord = {
    getAll: async (opts: {
      alive?: boolean;
      host?: string;
      port?: string;
      service?: string;
    }): Promise<IServiceRecord[]> => {
      // const stored = await this.redisService.redis.get(
      //   this.genServiceRecordKey(service),
      // );
      // return stored ? (JSON.parse(stored) as IServiceRecord) : null;
      const { alive, host, port, service } = opts;
      const keys = await this.redisService.keys(
        `${this.serviceRecordKey}:${service ?? "*"}:${host ?? "*"}:${port ?? "*"}`,
      );

      const records = (
        await Promise.all(
          keys.map(async key => {
            const record = await this.redisService.redis.get(key);
            if (record) return JSON.parse(record) as IServiceRecord;
          }),
        )
      ).filter(record => record !== undefined);

      if (alive) return records.filter(({ alive }) => !!alive);

      return records;
    },
    set: async (record: IServiceRecord): Promise<void> => {
      const key = this.genServiceRecordKey(record);
      await this.redisService.redis.set(key, JSON.stringify(record));
    },
  };

  async process(job: Job<IRegistryRequest>): Promise<void> {
    try {
      const { host, port, service } = job.data;
      console.log("In process", job.data);
      const serviceOpenApiDocUrl = `http://${host}:${port}/api-json`;

      const res = await fetch(serviceOpenApiDocUrl, {
        signal: AbortSignal.timeout(5000),
      });

      const openApiDoc = (await res.json()) as OpenAPIObject;
      await this.openApiDoc.set(service, openApiDoc);

      await this.serviceRecord.set({
        ...job.data,
        alive: true,
      });
    } catch (e) {
      console.error(e);
    }
  }

  @OnWorkerEvent("drained")
  async onCompleted() {
    const allServiceRecords = (
      await this.redisService.keys(`${this.serviceRecordKey}:*`)
    ).map(key => {
      const [, , service, host, port] = key.split(":");
      return { host, port, service };
    });

    const servicesList = Array.from(
      new Map(allServiceRecords.map(i => [i.service, i])).values(),
    );

    const docs = (
      await Promise.all(
        servicesList.map(async record => {
          const { service } = record;
          const doc = await this.openApiDoc.get(service);
          if (!doc) return null;
          return { doc, service };
        }),
      )
    ).filter(d => d !== null);

    console.log(docs);

    const mergeResult = merge(
      docs.map(({ doc, service }) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        oas: doc as any,
        pathModification: { prepend: `/${service}` },
      })),
    );

    if (isErrorResult(mergeResult)) {
      console.error("Failed to merge OpenAPI doc");
      return;
    }

    const fullOpenApiDoc = mergeResult.output;

    fullOpenApiDoc.info.title = configShared.data.appTitle;
    fullOpenApiDoc.info.description = configShared.data.appDescription;
    fullOpenApiDoc.info.version = configShared.data.appVersion;

    await this.redisService.redis.set(
      ERegistryStoreKey.openApiDoc,
      JSON.stringify(fullOpenApiDoc),
    );

    const endpoints = await this.saveKrakendConfig(docs);
    console.dir(endpoints, { colors: true, depth: null });

    console.log(
      "Worker is drained ========================================================================",
    );
  }

  private readonly saveKrakendConfig = async (
    docs: { doc: OpenAPIObject; service: string }[],
  ) => {
    const endpoints: IKrakendEndpoint[] = (
      await Promise.all(
        docs.map(async ({ doc, service }) => {
          const hosts = (await this.serviceRecord.getAll({ service })).map(
            ({ host, port }) =>
              `http://${host === "localhost" ? "host.docker.internal" : host}:${port}`,
          );

          return Object.keys(doc.paths)
            .map(key => {
              return Object.keys(doc.paths[key]).map(method => ({
                backend: [{ host: hosts, url_pattern: key }],
                endpoint: join("/", service, key),
                method:
                  method &&
                  Object.keys(EKrakendHttpMethod).includes(method.toUpperCase())
                    ? (method.toUpperCase() as EKrakendHttpMethod)
                    : EKrakendHttpMethod.GET,
              }));
            })
            .flat();
        }),
      )
    ).flat();

    const krakendConfig = {
      endpoints,
      version: "3",
    };

    await writeFile(
      join(getEnvVarOrThrow("PWD"), "krakend/krakend.json"),
      JSON.stringify(krakendConfig, null, 2),
    );

    return endpoints;
  };
}
