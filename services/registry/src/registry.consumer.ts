import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AppService } from './app.service';

@Processor('registry')
export class RegistryConsumer extends WorkerHost {
  constructor(private readonly appService: AppService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log('In RegistryConsumer', job.data);

    const keys = await this.appService.processRegistrationRequests();
    console.log(keys);

    return { success: true };
  }
}
