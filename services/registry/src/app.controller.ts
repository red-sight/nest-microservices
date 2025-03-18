import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { RegisterOptionsDto } from '@lib/nest';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('REGISTER')
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new RpcException(errors),
    }),
  )
  register(@Payload() registerOptions: RegisterOptionsDto) {
    void this.appService.register(registerOptions);
    return { success: true };
  }
}
