import { EQueueRegistry } from "@lib/types";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { ServiceRecordService } from "src/services";

@Processor(EQueueRegistry.serviceHealthCheck)
export class HealthCheckConsumer extends WorkerHost {
  constructor(private readonly serviceRecord: ServiceRecordService) {
    super();
  }

  async process() {
    const services = await this.serviceRecord.getAll();
    await Promise.all(
      services.map(async ({ alive, host, port, service }) => {
        const url = `http://${host}:${port}/health`;
        let healthy = false;
        try {
          const res = await fetch(url, {
            signal: AbortSignal.timeout(2000),
          });
          healthy = res.status === 200;
        } catch {
          /* empty */
        }
        if (healthy !== alive)
          console.warn(
            `Service ${service} status at ${host}:${port} has changed to ${healthy.toString()}`,
          );
        await this.serviceRecord.set({
          alive: healthy,
          host,
          port,
          service,
        });
      }),
    );
  }
}
