import { configShared } from "@lib/config-shared";
import { RedisService } from "@lib/nest";
import {
  EQueueRegistry,
  ERegistryStoreKey,
  IRegistryRequest,
  IServiceRecord,
} from "@lib/types";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { OpenAPIObject } from "@nestjs/swagger";
import { Job } from "bullmq";
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
      await this.redisService.redis.set(
        this.genOpenApiDocKey(service),
        JSON.stringify(openApiDoc),
      );
    },
  };

  private readonly serviceRecordKey = "registry:service";
  private readonly genServiceRecordKey = (service: string): string =>
    `${this.serviceRecordKey}:${service}`;
  private readonly serviceRecord = {
    get: async (service: string): Promise<IServiceRecord | null> => {
      const stored = await this.redisService.redis.get(
        this.genServiceRecordKey(service),
      );
      return stored ? (JSON.parse(stored) as IServiceRecord) : null;
    },
    set: async (service: string, record: IServiceRecord): Promise<void> => {
      await this.redisService.redis.set(
        this.genServiceRecordKey(service),
        JSON.stringify(record),
      );
    },
  };

  async process(job: Job<IRegistryRequest>): Promise<void> {
    const { host, port, service } = job.data;
    const serviceOpenApiDocUrl = `http://${host}:${port}/api-json`;

    const res = await fetch(serviceOpenApiDocUrl, {
      signal: AbortSignal.timeout(5000),
    });

    const openApiDoc = (await res.json()) as OpenAPIObject;
    await this.openApiDoc.set(service, openApiDoc);

    await this.serviceRecord.set(service, {
      ...job.data,
      alive: true,
    });
  }

  @OnWorkerEvent("drained")
  async onCompleted() {
    const keys = await this.redisService.keys(`${this.serviceRecordKey}:*`);

    const docs = (
      await Promise.all(
        keys.map(async key => {
          const [, , service] = key.split(":");
          const doc = await this.openApiDoc.get(service);
          if (!doc) return null;
          return { doc, service };
        }),
      )
    ).filter(d => d !== null);

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

    console.log(
      "Worker is drained ========================================================================",
    );
  }
}
