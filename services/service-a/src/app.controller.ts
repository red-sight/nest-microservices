import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiExtension } from "@nestjs/swagger";

import { AppService } from "./app.service";
import { MethodADto, QueryParamsDto } from "./dtos";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/hello")
  @ApiExtension("x-requires-authentication", true)
  @ApiExtension("x-authorized-permissions", ["users:read"])
  getHello(): unknown {
    console.log("in hello 2");
    return this.appService.getHello();
  }

  @Post("/signin")
  aaa(@Body() { name, password }: MethodADto) {
    console.log("in signin", name, password);
    return { response: "AAAAAAA" };
  }

  @Get("with_params/:param1")
  newApi(@Param("param1") param1: string) {
    console.log("in newApi", param1);
    return { new: "bar" };
  }

  @Get("with_query")
  newApiWithQuery(@Query() query: QueryParamsDto) {
    console.log("in newApiWithQuery", query);

    return { new: "bar" };
  }
}
