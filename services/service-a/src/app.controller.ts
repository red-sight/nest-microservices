import { Controller, Get, Post } from "@nestjs/common";

import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/hello")
  getHello(): unknown {
    console.log("in hello 2");

    return this.appService.getHello();
  }

  @Post("/bye")
  aaa() {
    console.log("In aaa");

    return { response: "AAAAAAA" };
  }

  @Get("new_one2")
  newApi() {
    return { new: "bar" };
  }
}
