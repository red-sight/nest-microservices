import { Body, Controller, Get, Post } from "@nestjs/common";

import { AppService } from "./app.service";
import { MethodADto } from "./dtos/MethodA.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/hello")
  getHello(): unknown {
    console.log("in hello 2");

    return this.appService.getHello();
  }

  @Post("/signin")
  aaa(@Body() { name, password }: MethodADto) {
    console.log("in signin", name, password);
    return { response: "AAAAAAA" };
  }

  @Get("new_one2")
  newApi() {
    return { new: "bar" };
  }
}
