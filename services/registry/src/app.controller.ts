import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { RegisterOptionsDto } from '@lib/nest';
import { EMessagePatternRegistry } from '@lib/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(EMessagePatternRegistry.registrationRequest)
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new RpcException(errors),
    }),
  )
  register(@Payload() registerOptions: RegisterOptionsDto) {
    void this.appService.registrationRequest(registerOptions);
    return { success: true };
  }
}
