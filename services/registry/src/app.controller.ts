import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('REGISTER')
  register(data: unknown) {
    console.dir(data, { depth: null, colors: true });
    return { success: true };
  }
}
