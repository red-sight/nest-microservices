import { RegisterOptionsDto } from "@lib/nest";
import { EQueueRegistry } from "@lib/types";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  ApiDocService,
  KrakendGatewayProvider,
  ServiceRecordService,
} from "src/services";

@Processor(EQueueRegistry.registryRequests)
export class RegistryRequestsConsumer extends WorkerHost {
  constructor(
    private readonly serviceRecord: ServiceRecordService,
    private readonly apiDocService: ApiDocService,
    private readonly krakendGateway: KrakendGatewayProvider,
  ) {
    super();
  }

  async process(job: Job<RegisterOptionsDto>): Promise<void> {
    // Validate job data
    const dto = plainToInstance(RegisterOptionsDto, job.data);
    const errors = await validate(dto);
    if (errors.length)
      throw new Error(
        `Registry request data is invalid: ${JSON.stringify(errors, null, 2)}`,
      );

    const { alive = true, host, port, service } = dto;

    if (alive) {
      const openApiDoc = await this.apiDocService.fetch(dto);
      await this.apiDocService.set(service, openApiDoc);
    }

    await this.serviceRecord.set({
      alive: !!alive,
      host,
      port,
      service,
    });
  }

  @OnWorkerEvent("drained")
  async onCompleted() {
    const services = await this.serviceRecord.getServicesList();
    const docs = await this.apiDocService.getAll(services);
    const fullDoc = this.apiDocService.merge(docs);
    if (!fullDoc) return;
    await this.apiDocService.saveFullOpenApiDoc(fullDoc);

    await this.krakendGateway.configure(docs);
  }
}
